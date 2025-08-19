import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiArrowLeft, FiClock } from 'react-icons/fi';
 
const EmailVerificationPage = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      setStatus('verifying');
      verifyEmailToken(urlToken);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (status === 'success' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (countdown === 0 && status === 'success') {
      handleClose();
    }
    return () => clearInterval(interval);
  }, [status, countdown]);

  const verifyEmailToken = async (token) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        localStorage.setItem('email', data.email);
        localStorage.setItem('isEmailVerified', 'true');
        localStorage.setItem('justVerified', 'true');
        
        setUsername(data.username);
        setStatus('success');
        setMessage('Email verified successfully! You are now logged in.');
        
        window.dispatchEvent(new Event('storage'));
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'EMAIL_VERIFIED',
            data: {
              token: data.token,
              role: data.role,
              username: data.username,
              email: data.email
            }
          }, '*');
        }
      } else {
        setStatus(data.status || 'error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to process verification request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/';
    }
  };

  const handleRetryVerification = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setStatus('verifying');
      setMessage('Retrying verification...');
      verifyEmailToken(urlToken);
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
      case 'expired':
        return <FiClock className="h-16 w-16 text-orange-500 mx-auto" />;
      case 'error':
      case 'invalid':
        return <FiXCircle className="h-16 w-16 text-red-500 mx-auto" />;
      default:
        return <FiXCircle className="h-16 w-16 text-red-500 mx-auto" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'expired':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'error':
      case 'invalid':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'verifying':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified Successfully!';
      case 'expired':
        return 'Verification Link Expired';
      case 'invalid':
        return 'Invalid Verification Link';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Email Verification';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-[Caveat] bg-clip-text text-transparent bg-gradient-to-tr from-main-color to-main-color mb-2">
              The Cologne Hub
            </h1>
            <p className="text-gray-600">Email Verification</p>
          </div>

          <div className="mb-6">
            {getStatusIcon()}
          </div>

          <div className={`p-4 rounded-lg border mb-6 ${getStatusColor()}`}>
            <h3 className="font-semibold mb-2">{getStatusTitle()}</h3>
            <p className="text-sm">{message || `Welcome to The Cologne Hub${username ? `, ${username}` : ''}!`}</p>
            
            {status === 'success' && (
              <div className="bg-white rounded-lg p-3 border border-green-300 mt-4">
                <p className="text-sm font-medium">
                  Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-main-color h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={handleClose}
                className="w-full bg-main-color text-white py-3 px-4 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200 flex items-center justify-center"
              >
                <FiCheckCircle className="mr-2" size={18} />
                Close Window
              </button>
            )}

            {(status === 'error' || status === 'expired' || status === 'invalid') && (
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
          </div>

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

export default EmailVerificationPage;