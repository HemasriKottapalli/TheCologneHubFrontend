import React, { useState, useEffect } from 'react';
import { FiMail, FiCheckCircle, FiXCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import API from '../api';
// import API from '../utils/api';
 
const EmailVerification = () => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
 
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
 
  const verifyEmailToken = async (tokenToVerify) => {
    try {
      setIsLoading(true);
      const response = await API.get(`/api/auth/verify-email/${tokenToVerify}`);
     
      setStatus('success');
      setMessage(response.data.message);
      setUsername(response.data.username);
     
      // Auto redirect to home page after 3 seconds
      setTimeout(() => {
        window.location.href = '/?verified=true';
      }, 3000);
     
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
 
  const handleRetryVerification = () => {
    if (token) {
      setStatus('verifying');
      setMessage('');
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
              <p>Verifying your email address...</p>
            )}
            {status === 'success' && (
              <div>
                <h3 className="font-semibold mb-2">Email Verified Successfully! 🎉</h3>
                {username && <p className="mb-2">Welcome to The Cologne Hub, {username}!</p>}
                <p className="text-sm">Redirecting you to home page in a few seconds...</p>
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
                onClick={() => window.location.href = '/?verified=true'}
                className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200 flex items-center justify-center"
              >
                <FiCheckCircle className="mr-2" size={18} />
                Continue to Home
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
 