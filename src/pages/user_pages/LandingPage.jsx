import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import HeroSection from '../../components/user_comps/HeroSection.jsx';
import About from '../../components/user_comps/About.jsx';
import EmailSubscription from '../../components/user_comps/EmailSubscription.jsx';
import ShopCategories from '../../components/user_comps/ShopCategories.jsx';
// import PopularBrands from '../../components/user_comps/PopularBrands.jsx';

function LandingPage() {
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user just got verified
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    
    if (verified === 'true') {
      // Try to get username from localStorage or other auth state
      const storedUsername = localStorage.getItem('username') || 
                            localStorage.getItem('user') || 
                            'there'; // fallback
      setUsername(storedUsername);
      setShowVerificationSuccess(true);
      
      // Clean up URL to remove the verification parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 5000);
    }
  }, []);

  const closeVerificationToast = () => {
    setShowVerificationSuccess(false);
  };

  return (
    <div className="relative">
      {/* Verification Success Toast */}
      {showVerificationSuccess && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
          <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 relative">
            <button
              onClick={closeVerificationToast}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={16} />
            </button>
            
            <div className="flex items-start space-x-3">
              <FiCheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-green-800 mb-1">
                  🎉 Welcome to The Cologne Hub!
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  Hi {username}! Your email has been verified and you're now logged in.
                </p>
                <p className="text-xs text-green-600">
                  You now have full access to all features including your wishlist, orders, and exclusive offers.
                </p>
              </div>
            </div>
            
            {/* Progress bar for auto-hide */}
            <div className="absolute bottom-0 left-0 h-1 bg-green-200 rounded-b-lg overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-[5000ms] ease-linear shrink-animation"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Your existing LandingPage content */}
      <HeroSection />
      {/* <PopularBrands /> */}
      <ShopCategories />
      <About id="about" />
      <EmailSubscription />

      {/* Add these styles to your component or global CSS */}
      <style jsx>{`
        .animate-slide-in {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
        
        .shrink-animation {
          animation: shrink 5s linear forwards;
        }
        
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;