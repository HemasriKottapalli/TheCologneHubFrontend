// // components/Layout.js
// import React from 'react';
// import Header from '.././user_comps/Header';
// import Footer from '.././user_comps/Footer';
// import { Outlet } from 'react-router-dom';

// const Layout = () => {
//   return (
//     <>
//       <Header />
//       <main style={{ minHeight: '80vh' }}>
//         <Outlet /> {/* This will render nested route content */}
//       </main>
//       <Footer />
//     </>
//   );
// };

// export default Layout;
// components/Layout.js - Updated with your actual layout
import { useEffect } from 'react';
import Header from '.././user_comps/Header';
import Footer from '.././user_comps/Footer';
import { Outlet } from 'react-router-dom';
import AuthModal from '../auth_comps/AuthModal';
import { useAuthModal } from '../../hooks/useAuthModal';

const Layout = () => {
  const { isOpen, modalType, openLogin, openRegister, close } = useAuthModal();

  // Listen for custom events to open auth modal from anywhere in the app
  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      const { type } = event.detail;
      if (type === 'login') {
        openLogin();
      } else if (type === 'register') {
        openRegister();
      }
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, [openLogin, openRegister]);

  return (
    <>
      <Header onLoginClick={openLogin} onRegisterClick={openRegister} />
      <main style={{ minHeight: '80vh' }}>
        <Outlet /> {/* This will render nested route content */}
      </main>
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isOpen} 
        onClose={close} 
        initialType={modalType} 
      />
    </>
  );
};

export default Layout;