import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiX, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import API from '../../api';
import { getPendingAction } from '../../utils/authUtils';

const AuthModal = ({ isOpen, onClose, initialType = 'login' }) => {
  const [modalType, setModalType] = useState(initialType);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  
  // Ref to store polling interval
  const pollingInterval = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setModalType(initialType);
    } else {
      // Clean up when modal closes
      setLoginForm({ username: '', password: '' });
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
      setError('');
      setSuccess('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setVerificationEmail('');
      stopPolling();
    }
  }, [isOpen, initialType]);

  useEffect(() => {
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [modalType]);

  // Function to start polling for email verification
  const startPolling = (email) => {
    setIsPolling(true);
    
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await API.get(`/api/auth/verification-status/${encodeURIComponent(email)}`);
        
        if (response.data.isEmailVerified) {
          // Email is verified! Auto-login the user
          try {
            const loginResponse = await API.post('/api/auth/login-verified', { email });
            
            // Store user data
            localStorage.setItem('token', loginResponse.data.token);
            localStorage.setItem('role', loginResponse.data.role);
            localStorage.setItem('username', loginResponse.data.username);
            localStorage.setItem('email', loginResponse.data.email);
            localStorage.setItem('isEmailVerified', 'true');
            
            // Stop polling
            stopPolling();
            
            // Show success message
            setSuccess('Email verified successfully! You are now logged in.');
            
            // Dispatch events for UI updates
            window.dispatchEvent(new Event('usernameChanged'));
            window.dispatchEvent(new CustomEvent('userLoggedIn'));
            
            // Close modal and handle pending actions after a brief delay
            setTimeout(() => {
              onClose();
              
              const pendingAction = getPendingAction();
              if (pendingAction) {
                window.dispatchEvent(new CustomEvent('executePendingAction', {
                  detail: pendingAction
                }));
              }
              
              window.dispatchEvent(new CustomEvent('loginSuccess', {
                detail: { role: loginResponse.data.role }
              }));
            }, 1500);
            
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
            setError('Email verified but auto-login failed. Please try logging in manually.');
            stopPolling();
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling unless it's a critical error
        if (error.response?.status === 404) {
          setError('User not found. Please try registering again.');
          stopPolling();
        }
      }
    }, 3000); // Poll every 3 seconds
  };

  // Function to stop polling
  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    setIsPolling(false);
  };

  // Clean up polling on component unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.keyCode === 27) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setError('');
  };

  const validateRegisterForm = () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await API.post('/api/auth/login', loginForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('email', res.data.email);
      localStorage.setItem('isEmailVerified', res.data.isEmailVerified);
      
      window.dispatchEvent(new Event('usernameChanged'));
      window.dispatchEvent(new CustomEvent('userLoggedIn'));

      onClose();

      if (res.data.role === 'admin') {
        window.location.href = '/admin';
        return;
      }

      const pendingAction = getPendingAction();
      if (pendingAction) {
        window.dispatchEvent(new CustomEvent('executePendingAction', {
          detail: pendingAction
        }));
      }

      window.dispatchEvent(new CustomEvent('loginSuccess', {
        detail: { role: res.data.role }
      }));

    } catch (err) {
      if (err.response?.data?.emailVerificationRequired) {
        setError('Please verify your email before logging in.');
        setVerificationEmail(err.response.data.email);
        setModalType('emailVerification');
        // Start polling for this email
        startPolling(err.response.data.email);
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/api/auth/register', {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password
      });
      
      setVerificationEmail(registerForm.email);
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          setModalType('emailVerification');
          setSuccess('');
          // Start polling for verification
          startPolling(registerForm.email);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/api/auth/resend-verification', {
        email: verificationEmail
      });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        // Restart polling after resending
        if (!isPolling) {
          startPolling(verificationEmail);
        }
      } else {
        setError(response.data.message || 'Failed to resend verification email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchModalType = () => {
    stopPolling(); // Stop polling when switching modal types
    setModalType(modalType === 'login' ? 'register' : 'login');
  };

  if (!isOpen) return null;

  if (modalType === 'emailVerification') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative w-full mx-4 max-w-md max-h-[90vh] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="mb-4">
                {success ? (
                  <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                ) : (
                  <FiMail className="h-16 w-16 text-main-color mx-auto" />
                )}
              </div>
              <h1 className="text-2xl font-bold font-[Caveat] bg-clip-text text-transparent bg-gradient-to-tr from-main-color to-main-color mb-2">
                {success ? 'Success!' : 'Check Your Email'}
              </h1>
              {!success && (
                <>
                  <p className="text-gray-600 text-sm">
                    We've sent a verification link to
                  </p>
                  <p className="font-medium text-gray-800 break-words">
                    {verificationEmail}
                  </p>
                </>
              )}
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm text-center">
                <FiCheckCircle className="inline mr-2" />
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {!success && (
              <>
                {/* Polling Status Indicator */}
                {isPolling && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <span>Waiting for email verification... We'll automatically log you in once verified!</span>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  <p className="font-medium mb-2">What happens next:</p>
                  <ul className="text-xs space-y-1">
                    <li>1. Check your email inbox (including spam folder)</li>
                    <li>2. Click the "Verify My Email" button in the email</li>
                    <li>3. You will be automatically logged in here</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  <p className="font-medium mb-1">Cross-Device Support:</p>
                  <p className="text-xs">You can click the verification link on any device (mobile, tablet, etc.). Once verified, you'll be automatically logged in on this device!</p>
                </div>
              </>
            )}

            <div className="space-y-3">
              {!success && (
                <button
                  onClick={handleResendVerificationEmail}
                  disabled={isLoading}
                  className="w-full border border-main-color text-main-color py-3 px-4 rounded-lg font-medium hover:bg-main-color hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-2" size={18} />
                      Resend Email
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  stopPolling();
                  setModalType('login');
                }}
                className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200"
              >
                {success ? 'Continue' : 'Back to Login'}
              </button>
            </div>

            {!success && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  The verification link will expire in 24 hours for security.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={`relative w-full mx-4 max-h-[90vh] overflow-y-auto ${modalType === 'register' ? 'max-w-lg' : 'max-w-md'}`}>
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-[Caveat] bg-clip-text text-transparent bg-gradient-to-tr from-main-color to-main-color">
              The Cologne Hub
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              {modalType === 'login' ? 'Welcome back to your fragrance journey' : 'Join our fragrance community'}
            </p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {modalType === 'login' && (
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="modal-username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <FiUser size={18} />
                  </span>
                  <input
                    type="text"
                    id="modal-username"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <FiLock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="modal-password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-white bg-white border-gray-300 rounded focus:ring-main-color checked:bg-main-color checked:border-main-color"
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-main-color hover:underline" onClick={onClose}>
                  Forgot password?
                </a>
              </div>

              <button
                onClick={handleLoginSubmit}
                disabled={isLoading}
                className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-main-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          )}

          {modalType === 'register' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="modal-reg-username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <FiUser size={18} />
                    </span>
                    <input
                      type="text"
                      id="modal-reg-username"
                      name="username"
                      value={registerForm.username}
                      onChange={handleRegisterChange}
                      placeholder="Choose a username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <FiMail size={18} />
                    </span>
                    <input
                      type="email"
                      id="modal-email"
                      name="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="modal-reg-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <FiLock size={18} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="modal-reg-password"
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      placeholder="Choose a password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {registerForm.password && (
                    <div className="mt-1">
                      <div className="text-xs text-gray-500">
                        {registerForm.password.length < 6 ? 'Too short' : 'Good'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label htmlFor="modal-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <FiLock size={18} />
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="modal-confirm-password"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {registerForm.confirmPassword && (
                    <div className="mt-1">
                      <div className={`text-xs ${registerForm.password === registerForm.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                        {registerForm.password === registerForm.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="modal-terms"
                  className="w-4 h-4 mt-1 text-main-color border-gray-300 rounded focus:ring-main-color flex-shrink-0"
                  required
                />
                <label htmlFor="modal-terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" className="text-main-color hover:underline font-medium" onClick={onClose}>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-main-color hover:underline font-medium" onClick={onClose}>
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                onClick={handleRegisterSubmit}
                disabled={isLoading}
                className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-main-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {modalType === 'login' ? 'New to The Cologne Hub?' : 'Already have an account?'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={switchModalType}
              className="mt-4 w-full py-3 px-4 border border-main-color text-main-color rounded-lg font-medium hover:bg-main-color hover:text-white transition-colors duration-200"
            >
              {modalType === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;