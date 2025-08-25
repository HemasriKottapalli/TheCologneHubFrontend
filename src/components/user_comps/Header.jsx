import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import API from '../../api'; // Adjust the path according to your project structure

const Header = ({ onLoginClick, onRegisterClick }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');
      const storedEmail = localStorage.getItem('email');
      const storedRole = localStorage.getItem('role');
      
      if (token && storedUsername) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
        setEmail(storedEmail || '');
        setRole(storedRole || 'user');
      } else {
        setIsLoggedIn(false);
        setUsername('');
        setEmail('');
        setRole('');
        setCartItemCount(0);
        setWishlistItemCount(0);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (in case user logs out from another tab)
    window.addEventListener('storage', checkAuthStatus);
    
    // Custom event listener for immediate login updates
    window.addEventListener('userLoggedIn', checkAuthStatus);
    window.addEventListener('userLoggedOut', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('userLoggedIn', checkAuthStatus);
      window.removeEventListener('userLoggedOut', checkAuthStatus);
    };
  }, []);

  // Fetch cart and wishlist counts when user is logged in
  useEffect(() => {
    if (isLoggedIn && role !== 'admin') {
      fetchCounts();
      
      // Listen for cart/wishlist updates
      window.addEventListener('cartUpdated', fetchCounts);
      window.addEventListener('wishlistUpdated', fetchCounts);
      
      return () => {
        window.removeEventListener('cartUpdated', fetchCounts);
        window.removeEventListener('wishlistUpdated', fetchCounts);
      };
    }
  }, [isLoggedIn, role]);

  const fetchCounts = async () => {
    try {
      // Fetch cart and wishlist counts in parallel
      const [cartResponse, wishlistResponse] = await Promise.all([
        API.get('/api/customer/cart').catch(() => ({ data: { items: [] } })),
        API.get('/api/customer/wishlist').catch(() => ({ data: { products: [] } }))
      ]);

      // Calculate cart item count
      const cartItems = cartResponse.data.items || [];
      const totalCartItems = cartItems
        .filter(item => item.product && item.quantity > 0)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      setCartItemCount(totalCartItems);

      // Calculate wishlist item count
      const wishlistItems = wishlistResponse.data.products || [];
      setWishlistItemCount(wishlistItems.length);

    } catch (error) {
      console.error('Error fetching counts:', error);
      // Don't show error to user, just keep counts at 0
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    //for name update on hero section
    window.dispatchEvent(new Event('usernameRemoved'));
    localStorage.removeItem('email');
    
    // Update state
    setIsLoggedIn(false);
    setUsername('');
    setRole('');
    setCartItemCount(0);
    setWishlistItemCount(0);
    
    // Trigger logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Redirect to home page
    navigate('/');
    
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  // Handle login button click
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  // Handle register button click
  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    }
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  // Function to check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items for logged in users (not admin)
  const userNavItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Shop', path: '/shop' },
    { name: 'Orders', path: '/orders' },
  ];

  // User Profile Dropdown Component (only visible on desktop - hidden on mobile)
  const UserProfileDropdown = () => (
    <div className="relative group hidden md:block">
      <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200">
        <div className="w-8 h-8 bg-main-color rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {username.charAt(0).toUpperCase()}
        </div>
        <span className="hidden lg:block text-sm font-medium">
          {username}
        </span>
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50">
        {/* Arrow pointing up */}
        <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
        
        <div className="py-4">
          {/* User Info Section */}
          <div className="px-5 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-main-color rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">{username}</p>
                <p className="text-sm text-gray-500 truncate">{email}</p>
              </div>
            </div>
          </div>
          
          {/* Logout Section */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 group/logout"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 group-hover/logout:bg-red-200 transition-colors duration-200 flex items-center justify-center">
                <FiLogOut size={16} />
              </div>
              <div className="text-left">
                <p className="font-medium">Sign Out</p>
                <p className="text-xs text-red-500">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Icon Link Component with active state styling and count badge
  const IconLink = ({ to, icon: Icon, title, count = 0, size = 20 }) => {
    const isActive = isActiveRoute(to);
    
    return (
      <Link
        to={to}
        className={`relative p-2 transition-colors duration-200 ${
          isActive 
            ? 'text-main-color' 
            : 'text-gray-700 hover:text-main-color'
        }`}
        title={title}
      >
        <Icon size={size} />
        
        {/* Count Badge - only show when not active and count > 0 */}
        {!isActive && count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-main-color text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
        
        {/* Active indicator dot - only show when active */}
        {isActive && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-main-color rounded-full"></span>
        )}
      </Link>
    );
  };

  // If user is admin, render simplified header
  if (isLoggedIn && role === 'admin') {
    return (
      <header className="bg-white fixed top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Non-clickable for admin */}
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold font-[Caveat] text-main-color cursor-default">
                The Cologne Hub
              </span>
            </div>

            {/* Admin Profile - Simple display only */}
            <div className="flex items-center space-x-2 p-2 text-gray-700">
              <FiUser size={20} />
              <span className="text-sm font-medium">
                {username}
              </span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full capitalize">
                {role}
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Regular header for guests and regular users
  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold font-[Caveat] text-main-color">
              The Cologne Hub
            </Link>
          </div>

          {/* Desktop Navigation - Only show for logged in users */}
          {isLoggedIn && (
            <nav className="hidden md:flex space-x-8">
              {userNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative text-gray-700 hover:text-main-color transition-colors duration-200 font-medium ${
                    isActiveRoute(item.path) ? 'text-main-color' : ''
                  }`}
                >
                  {item.name}
                  {isActiveRoute(item.path) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-main-color"></span>
                  )}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              // Logged in user actions with highlighting and counts
              <>
                {/* Cart with count badge */}
                <IconLink 
                  to="/cart" 
                  icon={FiShoppingCart} 
                  title="Cart" 
                  count={cartItemCount}
                />

                {/* Wishlist with count badge */}
                <IconLink 
                  to="/wishlist" 
                  icon={FiHeart} 
                  title="Wishlist" 
                  count={wishlistItemCount}
                />

                {/* Profile Dropdown - Hidden on mobile */}
                <UserProfileDropdown />
              </>
            ) : (
              // Guest user actions - Only Login and Sign Up
              <>
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 rounded-full text-main-color border border-main-color transition-colors duration-200 font-medium hover:text-white hover:bg-main-color"
                >
                  Login
                </button>
                <button
                  onClick={handleRegisterClick}
                  className=" border border-main-color bg-main-color text-white px-4 py-2 rounded-full hover:bg-white hover:text-main-color transition-colors duration-200 font-medium"
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile menu button - Only show when logged in */}
            {isLoggedIn && (
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-gray-700 hover:text-main-color transition-colors duration-200"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only show for logged in users */}
        {isMobileMenuOpen && isLoggedIn && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {userNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                    isActiveRoute(item.path) 
                      ? 'text-main-color bg-main-color bg-opacity-10 border-l-4 border-main-color' 
                      : 'text-gray-700 hover:text-main-color hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Cart with mobile count */}
              <Link
                to="/cart"
                className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/cart')
                    ? 'text-main-color bg-main-color bg-opacity-10 border-l-4 border-main-color'
                    : 'text-gray-700 hover:text-main-color hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Cart</span>
                {!isActiveRoute('/cart') && cartItemCount > 0 && (
                  <span className="min-w-[20px] h-[20px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
              
              {/* Wishlist with mobile count */}
              <Link
                to="/wishlist"
                className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/wishlist')
                    ? 'text-main-color bg-main-color bg-opacity-10 border-l-4 border-main-color'
                    : 'text-gray-700 hover:text-main-color hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Wishlist</span>
                {!isActiveRoute('/wishlist') && wishlistItemCount > 0 && (
                  <span className="min-w-[20px] h-[20px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                  </span>
                )}
              </Link>
              
              {/* Profile link in mobile menu */}
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/profile')
                    ? 'text-main-color bg-main-color bg-opacity-10 border-l-4 border-main-color'
                    : 'text-gray-700 hover:text-main-color hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              
              <hr className="my-2" />
              
              {/* Logout button in mobile menu */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center space-x-2"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;