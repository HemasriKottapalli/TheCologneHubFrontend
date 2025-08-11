// // src/utils/authUtils.js
// // Utility functions for authentication without context

// export const isAuthenticated = () => {
//   const token = localStorage.getItem('token');
//   return !!token;
// };

// export const getUserRole = () => {
//   return localStorage.getItem('role');
// };

// export const getUserInfo = () => {
//   const token = localStorage.getItem('token');
//   const role = localStorage.getItem('role');
//   const username = localStorage.getItem('username');
//   const email = localStorage.getItem('email');
  
//   if (!token) return null;
  
//   return { username, email, role };
// };

// export const logout = () => {
//   localStorage.removeItem('token');
//   localStorage.removeItem('role');
//   localStorage.removeItem('username');
//   localStorage.removeItem('email');
  
//   // Trigger header update
//   window.dispatchEvent(new CustomEvent('userLoggedOut'));
// };

// // Custom event helpers for triggering auth modal from anywhere
// export const triggerLoginModal = () => {
//   window.dispatchEvent(new CustomEvent('openAuthModal', { 
//     detail: { type: 'login' } 
//   }));
// };

// export const triggerRegisterModal = () => {
//   window.dispatchEvent(new CustomEvent('openAuthModal', { 
//     detail: { type: 'register' } 
//   }));
// };

// // Function to require authentication and show modal if not authenticated
// export const requireAuth = (callback, showModal = triggerLoginModal) => {
//   if (isAuthenticated()) {
//     callback();
//   } else {
//     showModal();
//   }
// };

// src/utils/authUtils.js
// Utility functions for authentication without context

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUserRole = () => {
  return localStorage.getItem('role');
};

export const getUserInfo = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  
  if (!token) return null;
  
  return { username, email, role };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  
  // Clear any pending actions
  localStorage.removeItem('pendingAction');
  
  // Trigger header update
  window.dispatchEvent(new CustomEvent('userLoggedOut'));
};

// Store action to execute after login
export const setPendingAction = (action) => {
  localStorage.setItem('pendingAction', JSON.stringify(action));
};

// Get and clear pending action
export const getPendingAction = () => {
  const action = localStorage.getItem('pendingAction');
  if (action) {
    localStorage.removeItem('pendingAction');
    return JSON.parse(action);
  }
  return null;
};

// Custom event helpers for triggering auth modal from anywhere
export const triggerLoginModal = () => {
  window.dispatchEvent(new CustomEvent('openAuthModal', { 
    detail: { type: 'login' } 
  }));
};

export const triggerRegisterModal = () => {
  window.dispatchEvent(new CustomEvent('openAuthModal', { 
    detail: { type: 'register' } 
  }));
};

// Function to require authentication and show modal if not authenticated
export const requireAuth = (callback, showModal = triggerLoginModal) => {
  if (isAuthenticated()) {
    callback();
  } else {
    showModal();
  }
};

// Function to require auth with pending action for post-login execution
export const requireAuthWithAction = (actionType, actionData, callback, showModal = triggerLoginModal) => {
  if (isAuthenticated()) {
    callback();
  } else {
    // Store the action to execute after login
    setPendingAction({ type: actionType, data: actionData });
    showModal();
  }
};