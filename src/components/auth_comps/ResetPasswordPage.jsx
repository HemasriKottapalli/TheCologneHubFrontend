import React, { useState, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiX } from 'react-icons/fi';
import API from '../../api'; // Adjust path to your API

const ResetPasswordPage = () => {
  // Get token from URL parameters
  const getTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  };

  const token = getTokenFromUrl();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validateForm = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await API.post(`/api/auth/reset-password/${token}`, {
        password
      });

      if (response.data.success) {
        setSuccess(true);
        
        // Redirect to home with login prompt after 3 seconds
        setTimeout(() => {
          window.location.href = '/?showLogin=true';
        }, 3000);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid or expired reset link');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-main-color via-comp-color to-main-color flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-600 mb-2">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You will be redirected to login shortly.
          </p>
          <button
            onClick={handleGoHome}
            className="bg-main-color text-white py-3 px-6 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-main-color via-comp-color to-main-color flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button
          onClick={handleGoHome}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={24} />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-[Caveat] bg-clip-text text-transparent bg-gradient-to-tr from-main-color to-main-color mb-2">
            The Cologne Hub
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
          <p className="text-gray-600 text-sm">Enter your new password below</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <FiLock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your new password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                disabled={isLoading}
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
            {password && (
              <div className="mt-1">
                <div className={`text-xs ${password.length >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                  {password.length >= 6 ? 'Password strength: Good' : 'Password too short'}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <FiLock size={18} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Confirm your new password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {confirmPassword && (
              <div className="mt-1">
                <div className={`text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !token}
            className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-main-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center">
            <button
              onClick={handleGoHome}
              className="text-main-color hover:underline text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;