// src/hooks/useAuthAction.js
import { useEffect } from 'react';
import { requireAuthWithAction } from '../utils/authUtils';

export const useAuthAction = (actionHandlers = {}) => {
  // Listen for pending action execution after login
  useEffect(() => {
    const handlePendingAction = async (event) => {
      const { type, data } = event.detail;
      
      // Check if we have a handler for this action type
      if (actionHandlers[type]) {
        try {
          await actionHandlers[type](data);
        } catch (error) {
          console.error(`Failed to execute ${type}:`, error);
        }
      }
    };

    window.addEventListener('executePendingAction', handlePendingAction);
    
    return () => {
      window.removeEventListener('executePendingAction', handlePendingAction);
    };
  }, [actionHandlers]);

  // Helper function to execute auth-required actions
  const executeWithAuth = (actionType, actionData, immediateCallback) => {
    requireAuthWithAction(actionType, actionData, immediateCallback);
  };

  return { executeWithAuth };
};