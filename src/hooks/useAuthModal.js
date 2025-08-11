// src/hooks/useAuthModal.js
import { useState } from 'react';

export const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState('login');

  const openLogin = () => {
    setModalType('login');
    setIsOpen(true);
  };

  const openRegister = () => {
    setModalType('register');
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    modalType,
    openLogin,
    openRegister,
    close
  };
};