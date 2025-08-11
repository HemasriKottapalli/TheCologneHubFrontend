import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // If no token, redirect to home page (where they can login via modal)
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If user doesn't have the right role, show access denied or redirect
  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
            {role ? ` Your current role: ${role}` : ''}
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-main-color text-white px-6 py-3 rounded-lg hover:bg-comp-color transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;