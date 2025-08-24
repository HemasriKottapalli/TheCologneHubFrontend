import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/user_pages/LandingPage';
import Layout from './components/user_comps/Layout';
import Shop from './pages/user_pages/Shop';
import About from './components/user_comps/About';
import Orders from './pages/user_pages/Orders';
import Cart from './pages/user_pages/Cart';
import Wishlist from './pages/user_pages/Wishlist';
import AdminLayout from './components/admin_comps/AdminLayout';
import ManageProducts from './pages/admin_pages/ManageProducts';
import ManageOrders from './pages/admin_pages/ManageOrders';
import ManageUsers from './pages/admin_pages/ManageUsers';
import ManageBrands from './pages/admin_pages/ManageBrands';
import ManageInventory from './pages/admin_pages/ManageInvenTory';
import OrderConfirmation from './pages/user_pages/OrderConfirmationPage';
import ResetPasswordPage from './components/auth_comps/ResetPasswordPage';
import VerifyEmail from './components/auth_comps/VerifyEmail';
import ProtectedRoute from './components/common_comps/ProtectedRoute';
import ScrollToTop from './components/common_comps/ScrolllToTop';

// Inner component to use hooks within BrowserRouter
function AppContent() {
  const [searchParams] = useSearchParams();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState('login');

  useEffect(() => {
    if (searchParams.get('showLogin') === 'true') {
      setAuthModalOpen(true);
      setAuthModalType('login');
    }
  }, [searchParams]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes - Accessible to everyone (no login required) */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<LandingPage authModalOpen={authModalOpen} authModalType={authModalType} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route
            path="/login"
            element={<LandingPage authModalOpen={true} authModalType="login" />}
          />
          <Route
            path="/register"
            element={<LandingPage authModalOpen={true} authModalType="register" />}
          />
        </Route>

        {/* Protected User Routes - Require login (any logged-in user) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/orders" element={<Orders />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Admin Routes - Admin Only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="brands" element={<ManageBrands />} />
          <Route path="inventory" element={<ManageInventory />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;