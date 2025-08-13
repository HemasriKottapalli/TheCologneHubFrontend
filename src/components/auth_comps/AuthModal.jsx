import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiX, FiRefreshCw } from 'react-icons/fi';
import API from '../../api';
import { getPendingAction } from '../../utils/authUtils';
 
const AuthModal = ({ isOpen, onClose, initialType = 'login' }) => {
  const [modalType, setModalType] = useState(initialType); // 'login', 'register', 'emailVerification'
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
  const [isResendingEmail, setIsResendingEmail] = useState(false);
 
  // Reset when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      setModalType(initialType);
    } else {
      // Reset everything when modal closes
      setLoginForm({ username: '', password: '' });
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
      setError('');
      setSuccess('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setVerificationEmail('');
    }
  }, [isOpen, initialType]);
 
  useEffect(() => {
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [modalType]);

useEffect(() => {
  const handleStorageChange = () => {
    // Check if user just got verified and logged in
    const isVerified = localStorage.getItem('isEmailVerified');
    const token = localStorage.getItem('token');
    
    if (isVerified === 'true' && token && modalType === 'emailVerification') {
      // User just got verified, close the modal
      setSuccess('Email verified successfully! You are now logged in.');
      setTimeout(() => {
        onClose();
        // Trigger any pending actions if they exist
        const pendingAction = getPendingAction();
        if (pendingAction) {
          window.dispatchEvent(new CustomEvent('executePendingAction', {
            detail: pendingAction
          }));
        }
      }, 1500);
    }
  };

  // Listen for storage changes (when verification happens in another tab)
  window.addEventListener('storage', handleStorageChange);
  
  // Also check on mount
  handleStorageChange();
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, [modalType, onClose]);
 
  // Handle ESC key
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
    if (error) setError('');
  };
 
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    if (error) setError('');
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
      window.dispatchEvent(new Event('usernameChanged'));
      localStorage.setItem('email', res.data.email);
 
      // Trigger header update
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
 
      // Close modal - user stays on current page!
      onClose();
 
      // Check if user is admin and redirect to products page
      if (res.data.role === 'admin') {
        window.location.href = '/admin';
        return;
      }
 
      // Check for pending actions and execute them
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
     
      console.log('Registration response:', response.data);
     
      setVerificationEmail(registerForm.email);
     
      if (response.data.success) {
        if (response.data.emailSent) {
          setSuccess(response.data.message);
          // Switch to email verification view immediately
          setTimeout(() => {
            setModalType('emailVerification');
            setSuccess('');
          }, 1500);
        } else {
          // Registration successful but email failed
          setSuccess(response.data.message);
          setTimeout(() => {
            setModalType('emailVerification');
            setSuccess('');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleResendVerificationEmail = async () => {
    setIsResendingEmail(true);
    setError('');
    setSuccess('');
 
    try {
      console.log('Resending verification email to:', verificationEmail);
     
      const response = await API.post('/api/auth/resend-verification', {
        email: verificationEmail
      });
     
      console.log('Resend response:', response.data);
     
      if (response.data.success) {
        setSuccess(response.data.message);
      } else {
        setError(response.data.message || 'Failed to resend verification email.');
      }
    } catch (err) {
      console.error('Resend error:', err);
     
      // Provide more specific error messages
      let errorMessage = 'Failed to resend verification email.';
     
      if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again in a few minutes.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Email address not found. Please register first.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
     
      setError(errorMessage);
    } finally {
      setIsResendingEmail(false);
    }
  };
 
  const switchModalType = () => {
    setModalType(modalType === 'login' ? 'register' : 'login');
  };
 
  if (!isOpen) return null;
 
  // Email Verification View
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
              <FiMail className="h-16 w-16 text-main-color mx-auto" />
            </div>
            <h1 className="text-2xl font-bold font-[Caveat] bg-clip-text text-transparent bg-gradient-to-tr from-main-color to-main-color mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 text-sm">
              We've sent a verification link to
            </p>
            <p className="font-medium text-gray-800 break-words">
              {verificationEmail}
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

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm">
            <p className="font-medium mb-2">📧 What happens next:</p>
            <ul className="text-xs space-y-1">
              <li>1. Check your email inbox (including spam folder)</li>
              <li>2. Click the "Verify My Email" button in the email</li>
              <li>3. You'll be automatically logged in</li>
              <li>4. This window will close automatically</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 text-xs">
            <p className="font-medium mb-1">💡 Pro Tip:</p>
            <p>Keep this window open while you check your email. When you click the verification link, you'll be automatically logged in and this window will close.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResendVerificationEmail}
              disabled={isResendingEmail}
              className="w-full border border-main-color text-main-color py-3 px-4 rounded-lg font-medium hover:bg-main-color hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isResendingEmail ? (
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
           
            <button
              onClick={() => setModalType('login')}
              className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              The verification link will expire in 24 hours for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
     
      {/* Modal */}
      <div className={`relative w-full mx-4 max-h-[90vh] overflow-y-auto ${
        modalType === 'register' ? 'max-w-lg' : 'max-w-md'
      }`}>
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
 
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-[Caveat] bg-clip-text text-transparent bg-gradient-to-tr from-main-color to-main-color">
              The Cologne Hub
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              {modalType === 'login'
                ? 'Welcome back to your fragrance journey'
                : 'Join our fragrance community'
              }
            </p>
          </div>
 
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}
 
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
 
          {/* Login Form */}
          {modalType === 'login' && (
            <div className="space-y-4">
              {/* Username Field */}
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
 
              {/* Password Field */}
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
 
              {/* Remember Me & Forgot Password */}
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
 
              {/* Login Button */}
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
 
          {/* Register Form */}
          {modalType === 'register' && (
            <div className="space-y-5">
              {/* Two columns for username and email on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username Field */}
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
 
                {/* Email Field */}
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
 
              {/* Two columns for passwords on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password Field */}
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
                  {/* Password strength indicator */}
                  {registerForm.password && (
                    <div className="mt-1">
                      <div className="text-xs text-gray-500">
                        {registerForm.password.length < 6 ? 'Too short' : 'Good'}
                      </div>
                    </div>
                  )}
                </div>
 
                {/* Confirm Password Field */}
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
                  {/* Password match indicator */}
                  {registerForm.confirmPassword && (
                    <div className="mt-1">
                      <div className={`text-xs ${
                        registerForm.password === registerForm.confirmPassword
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {registerForm.password === registerForm.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
 
              {/* Terms & Conditions - Full width */}
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
 
              {/* Register Button */}
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
 
          {/* Switch between Login/Register */}
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
 