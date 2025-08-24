import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link');
      setStatus('error');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await API.get(`/api/auth/verify-email/${token}`);
        if (response.data.success) {
          setStatus('success');
          setMessage(`Email verified successfully! Welcome, ${response.data.username}! You will be redirected to login shortly.`);
          setTimeout(() => {
            navigate('/?showLogin=true');
          }, 3000);
        }
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Failed to verify email. Please try again or request a new verification link.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Verification</h2>
        </div>

        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-color mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={handleGoHome}
              className="bg-main-color text-white py-3 px-6 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200"
            >
              Continue to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
            <button
              onClick={handleGoHome}
              className="bg-main-color text-white py-3 px-6 rounded-lg font-medium hover:bg-comp-color transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;