import React, { useState } from 'react';
import { FiX, FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import API from '../../api';

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'sent'

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setError('');
      setSuccess('');
      setStep('request');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/api/auth/forgot-password', { email: email.trim() });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setStep('sent');
      } else {
        setError(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.response?.status === 429) {
        setError('Too many password reset attempts. Please wait 5 minutes before trying again.');
      } else if (err.response?.status === 404) {
        setError('No account found with this email address.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to send reset email. Please check your email and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setStep('request');
    setError('');
    setSuccess('');
  };

  const handleBackToLogin = () => {
    onClose();
    onBackToLogin();
  };

  if (!isOpen) return null;

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

          {step === 'request' ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <FiMail className="h-12 w-12 text-main-color mx-auto mb-3" />
                <h1 className="text-xl font-bold text-main-color mb-1">
                  Forgot Password?
                </h1>
                <p className="text-gray-600 text-sm">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <FiMail size={18} />
                    </span>
                    <input
                      type="email"
                      id="reset-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-main-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleBackToLogin}
                  className="inline-flex items-center text-sm text-main-color hover:underline"
                >
                  <FiArrowLeft size={16} className="mr-1" />
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-green-600 mb-2">Email Sent!</h1>
                <p className="text-gray-600 text-sm mb-4">
                  We've sent a password reset link to
                </p>
                <p className="font-medium text-gray-800 mb-6">{email}</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-700">
                    Check your email and click the reset link to create a new password. 
                    The link will expire in 1 hour.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleResend}
                    className="w-full border border-main-color text-main-color py-2.5 px-4 rounded-lg font-medium hover:bg-main-color hover:text-white transition-colors duration-200"
                  >
                    Send Another Email
                  </button>
                  
                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-main-color text-white py-2.5 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;