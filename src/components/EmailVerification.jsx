import { useState, useEffect } from 'react';
import { FiMail, FiCheckCircle, FiXCircle, FiRefreshCw, FiArrowLeft, FiClock } from 'react-icons/fi';

const EmailVerificationPage = () => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('processing'); // processing, verifying, success, error, expired, invalid
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlStatus = urlParams.get('status');
    const urlMessage = urlParams.get('message');
    const urlData = urlParams.get('data');
    
    console.log("=== EMAIL VERIFICATION PAGE DEBUG ===");
    console.log("URL Token:", urlToken);
    console.log("URL Status:", urlStatus);
    console.log("URL Message:", urlMessage);
    console.log("URL Data:", urlData);

    // FIXED: Handle different scenarios
    if (urlStatus) {
      // This means we came back from backend verification
      setStatus(urlStatus);
      
      if (urlMessage) {
        setMessage(decodeURIComponent(urlMessage));
      }
      
      if (urlData && urlStatus === 'success') {
        try {
          const decodedData = JSON.parse(decodeURIComponent(urlData));
          console.log("Decoded user data:", decodedData);
          setUserData(decodedData);
          setUsername(decodedData.username);
          
          // Store authentication data in localStorage
          localStorage.setItem('token', decodedData.token);
          localStorage.setItem('role', decodedData.role);
          localStorage.setItem('username', decodedData.username);
          localStorage.setItem('email', decodedData.email);
          localStorage.setItem('isEmailVerified', 'true');
          localStorage.setItem('justVerified', 'true');
          
          // Trigger header update events
          window.dispatchEvent(new Event('usernameChanged'));
          window.dispatchEvent(new CustomEvent('userLoggedIn'));
          window.dispatchEvent(new CustomEvent('loginSuccess', {
            detail: { role: decodedData.role }
          }));
          
          // For cross-tab communication
          window.dispatchEvent(new Event('storage'));
          
          // Send message to parent window if opened in popup/new tab
          if (window.opener) {
            window.opener.postMessage({
              type: 'EMAIL_VERIFIED',
              data: decodedData
            }, '*');
          }
          
          // Start countdown for redirect
          setCountdown(5);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setStatus('error');
          setMessage('Verification successful but failed to process user data');
        }
      }
      
      // Clean up URL parameters
      const url = new URL(window.location);
      url.search = '';
      window.history.replaceState({}, document.title, url.pathname);
      
    } else if (urlToken) {
      // This means user clicked email link, we need to verify
      setToken(urlToken);
      setStatus('verifying');
      verifyEmailToken(urlToken);
    } else {
      // No token or status provided
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
    } else if (countdown === 0 && status === 'success') {
      handleSuccessfulLogin();
    }
    return () => clearInterval(interval);
  }, [status, countdown]);

  const verifyEmailToken = async (tokenToVerify) => {
    try {
      setIsLoading(true);
      setStatus('verifying');
      setMessage('Processing your email verification...');
      
      console.log("Verifying token:", tokenToVerify);
      
      // FIXED: Make request to backend verification endpoint
      // The backend will handle the verification and redirect back to this page with status
      window.location.href = `/api/auth/verify-email/${tokenToVerify}`;
      
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Failed to process verification request');
      setIsLoading(false);
    }
  };

  const handleSuccessfulLogin = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  const handleRetryVerification = () => {
    if (token) {
      setStatus('verifying');
      setMessage('Retrying verification...');
      setCountdown(5);
      verifyEmailToken(token);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
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
        return <FiMail className="h-16 w-16 text-gray-400 mx-auto" />;
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
      case 'processing':
      case 'verifying':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'processing':
        return 'Processing...';
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

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'processing':
        return 'Please wait while we process your request...';
      case 'verifying':
        return 'We are verifying your email address. This should only take a moment.';
      case 'success':
        return `Welcome to The Cologne Hub${username ? `, ${username}` : ''}! Your email has been verified and you are now logged in.`;
      case 'expired':
        return 'Your verification link has expired. Please request a new verification email.';
      case 'invalid':
        return 'The verification link is invalid or has already been used.';
      case 'error':
        return 'Something went wrong during verification. Please try again.';
      default:
        return 'Processing your email verification...';
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
            <h3 className="font-semibold mb-2">{getStatusTitle()}</h3>
            <p className="text-sm">{getStatusMessage()}</p>
            
            {status === 'success' && (
              <div className="bg-white rounded-lg p-3 border border-green-300 mt-4">
                <p className="text-sm font-medium">
                  Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...
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

            {(status === 'error' || status === 'expired' || status === 'invalid') && (
              <>
                {token && (
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
                )}
                
                <button
                  onClick={() => window.location.href = '/?showRegister=true'}
                  className="w-full border border-main-color text-main-color py-3 px-4 rounded-lg font-medium hover:bg-main-color hover:text-white transition-colors duration-200"
                >
                  {status === 'expired' ? 'Request New Verification' : 'Go to Registration'}
                </button>
              </>
            )}

            {(status === 'processing' || status === 'verifying') && (
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

export default EmailVerificationPage;