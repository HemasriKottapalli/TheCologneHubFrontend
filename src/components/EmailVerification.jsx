import React, { useState, useEffect } from 'react';
import { FiMail, FiCheckCircle, FiXCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import API from '../api';
 
const EmailVerification = () => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
 
  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
   
    if (urlToken) {
      setToken(urlToken);
      verifyEmailToken(urlToken);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, []);

  // Countdown effect for auto-redirect
  useEffect(() => {
    let interval = null;
    if (status === 'success' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleSuccessfulLogin();
    }
    return () => clearInterval(interval);
  }, [status, countdown]);
 
  const verifyEmailToken = async (tokenToVerify) => {
    try {
      setIsLoading(true);
      const response = await API.get(`/api/auth/verify-email/${tokenToVerify}`);
     
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        setUsername(response.data.username);
        
        // Store authentication data in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('role', response.data.role);
          localStorage.setItem('username', response.data.username);
          localStorage.setItem('email', response.data.email);
          localStorage.setItem('isEmailVerified', 'true');
          
          // Trigger header update events
          window.dispatchEvent(new Event('usernameChanged'));
          window.dispatchEvent(new CustomEvent('userLoggedIn'));
          window.dispatchEvent(new CustomEvent('loginSuccess', {
            detail: { role: response.data.role }
          }));
        }
        
        // Start countdown for auto-redirect
        setCountdown(3);
      }
     
    } catch (error) {
      if (error.response?.data?.expired) {
        setStatus('expired');
        setMessage(error.response.data.message);
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulLogin = () => {
    // Navigate to home page with verification success indicator
    window.location.href = '/?verified=true';
  };
 
  const handleRetryVerification = () => {
    if (token) {
      setStatus('verifying');
      setMessage('');
      setCountdown(3);
      verifyEmailToken(token);
    }
  };
 
  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-main-color mx-auto"></div>
        );
      case 'success':
        return <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto" />;
      case 'error':
      case 'expired':
        return <FiXCircle className="h-16 w-16 text-red-500 mx-auto" />;
      default:
        return <FiMail className="h-16 w-16 text-gray-400 mx-auto" />;
    }
  };
 
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-[Caveat] bg-clip-text text-transparent bg-gradient-to-tr from-main-color to-main-color mb-2">
              The Cologne Hub
            </h1>
            <p className="text-gray-600">Email Verification</p>
          </div>
 
          {/* Status Icon */}
          <div className="mb-6">
            {getStatusIcon()}
          </div>
 
          {/* Status Message */}
          <div className={`p-4 rounded-lg border mb-6 ${getStatusColor()}`}>
            {status === 'verifying' && isLoading && (
              <div>
                <h3 className="font-semibold mb-2">Verifying Your Email...</h3>
                <p>Please wait while we verify your email address.</p>
              </div>
            )}
            {status === 'success' && (
              <div>
                <h3 className="font-semibold mb-2">🎉 Email Verified Successfully!</h3>
                {username && <p className="mb-2">Welcome to The Cologne Hub, <span className="font-semibold text-main-color">{username}</span>!</p>}
                <p className="text-sm mb-3">You are now logged in and have full access to your account.</p>
                <div className="bg-white rounded-lg p-3 border border-green-300">
                  <p className="text-sm font-medium">
                    Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-main-color h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {(status === 'error' || status === 'expired') && (
              <div>
                <h3 className="font-semibold mb-2">
                  {status === 'expired' ? 'Verification Link Expired' : 'Verification Failed'}
                </h3>
                <p>{message}</p>
              </div>
            )}
          </div>
 
          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={handleSuccessfulLogin}
                className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200 flex items-center justify-center"
              >
                <FiCheckCircle className="mr-2" size={18} />
                Continue to Home (Skip Wait)
              </button>
            )}
 
            {(status === 'error' || status === 'expired') && (
              <>
                <button
                  onClick={handleRetryVerification}
                  disabled={isLoading}
                  className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-2" size={18} />
                      Try Again
                    </>
                  )}
                </button>
               
                <button
                  onClick={() => window.location.href = '/?showRegister=true'}
                  className="w-full border border-main-color text-main-color py-3 px-4 rounded-lg font-medium hover:bg-main-color hover:text-white transition-colors duration-200"
                >
                  Go to Registration
                </button>
              </>
            )}
 
            {status === 'verifying' && (
              <button
                onClick={() => window.location.href = '/'}
                className="w-full border border-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
              >
                <FiArrowLeft className="mr-2" size={18} />
                Back to Home
              </button>
            )}
          </div>
 
          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Having trouble with verification?{' '}
              <button
                onClick={() => window.location.href = '/contact'}
                className="text-main-color hover:underline font-medium"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default EmailVerification;