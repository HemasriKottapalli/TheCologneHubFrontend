import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/user_pages/LandingPage';
import Layout from './components/user_comps/Layout'; 
import Shop from './pages/user_pages/Shop';
import About from './components/user_comps/About';
import Orders from './pages/user_pages/Orders';
import Cart from './pages/user_pages/Cart';
import Wishlist from './pages/user_pages/Wishlist';

// Admin Pages
import AdminLayout from './components/admin_comps/AdminLayout';
import ManageProducts from './pages/admin_pages/ManageProducts';
import ManageOrders from './pages/admin_pages/ManageOrders';
import ManageUsers from './pages/admin_pages/ManageUsers';
import ScrollToTop from './components/common_comps/ScrolllToTop';

// Import your existing ProtectedRoute
import ProtectedRoute from './components/common_comps/ProtectedRoute'; // Adjust path as needed
import ManageBrands from './pages/admin_pages/ManageBrands';
import ManageInventory from './pages/admin_pages/ManageInvenTory';
import OrderConfirmation from './pages/user_pages/OrderConfirmationPage';
import ResetPasswordPage from './components/auth_comps/ResetPasswordPage';
import VerifyEmail from './components/auth_comps/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes - Accessible to everyone (no login required) */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
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
    </BrowserRouter>
  );
}

export default App;

