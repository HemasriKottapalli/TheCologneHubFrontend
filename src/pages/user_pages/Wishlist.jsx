import { useState, useEffect } from 'react';
import { AiFillHeart, AiOutlineShoppingCart, AiOutlineClose, AiOutlineCheck } from 'react-icons/ai';
import { FaStar } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import API from '../../api'; // Adjust the path according to your project structure

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState({});
  const [removeLoading, setRemoveLoading] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Auto-remove notifications after 3 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Helper function to check if product is in cart
  const isInCart = (productId) => {
    return cartItems.includes(productId);
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch wishlist and cart data in parallel
      const [wishlistResponse, cartResponse] = await Promise.all([
        API.get('/api/customer/wishlist'),
        API.get('/api/customer/cart').catch(() => ({ data: { items: [] } }))
      ]);

      setWishlistItems(wishlistResponse.data.products || []);
      
      // Extract product IDs from cart
      const cartProductIds = (cartResponse.data.items || []).map(item => item.productId);
      setCartItems(cartProductIds);
      
      setError(null);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Please log in to view your wishlist');
        } else if (err.response.status === 404) {
          setError('Wishlist not found');
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
      console.error('Wishlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setRemoveLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      await API.delete(`/api/customer/wishlist/${productId}`);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      addNotification('Removed from wishlist', 'success');
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to remove item from wishlist';
      addNotification(errorMessage, 'error');
    } finally {
      setRemoveLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const addToCart = async (productId) => {
    setCartLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await API.post('/api/customer/cart', {
        productId,
        quantity: 1
      });

      if (response.status === 200) {
        // Update cart items state
        setCartItems(prev => {
          if (!prev.includes(productId)) {
            return [...prev, productId];
          }
          return prev;
        });
        
        // Remove from wishlist after successfully adding to cart
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        
        // Also remove from wishlist on server
        try {
          await API.delete(`/api/customer/wishlist/${productId}`);
        } catch (wishlistErr) {
          console.error('Failed to remove from wishlist after adding to cart:', wishlistErr);
          // Don't show error to user since the main action (add to cart) was successful
        }
        
        addNotification('Added to cart and removed from wishlist!', 'success');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      addNotification(errorMessage, 'error');
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400 text-xs" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStar key="half-star" className="text-yellow-400 text-xs opacity-50" />);
    }
    
    return stars;
  };

  const renderNotifications = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <AiOutlineCheck className="text-lg flex-shrink-0" />
            ) : (
              <AiOutlineClose className="text-lg flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <AiOutlineClose className="text-sm" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Load wishlist on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A7C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AiOutlineClose className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Wishlist</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="bg-[#8B5A7C] text-white px-6 py-2 rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNotifications()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Updated Header Design */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 bg-[#8B5A7C]/10 rounded-lg">
              <AiFillHeart className="h-5 w-5 text-[#8B5A7C]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-sm text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">💜</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Discover amazing products and save your favorites here. Start building your dream collection today.
            </p>
            <button
              onClick={() => window.location.href = '/shop'}
              className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : (
          /* Product Grid - Matching ProductGrid component style */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const productInCart = isInCart(item.product_id);
              
              return (
                <div
                  key={item.product_id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=300&fit=crop'}
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      disabled={removeLoading[item.product_id]}
                      className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 ${
                        removeLoading[item.product_id] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Remove from wishlist"
                    >
                      {removeLoading[item.product_id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8B5A7C]"></div>
                      ) : (
                        <MdDelete className="text-red-500 text-lg hover:text-red-600" />
                      )}
                    </button>

                    {/* Cart Status Indicator */}
                    {/* {productInCart && (
                      <div className="absolute top-2 left-2 bg-comp-color text-white text-xs px-2 py-1 rounded-full">
                        In Cart
                      </div>
                    )} */}

                    {/* Add to Cart Button on Hover */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => addToCart(item.product_id)}
                        disabled={cartLoading[item.product_id] || productInCart}
                        className={`w-full text-white text-sm py-2 rounded flex items-center justify-center gap-2 transition-colors ${
                          productInCart 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-[#8B5A7C] hover:bg-[#8B5A7C]/90'
                        } ${cartLoading[item.product_id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {cartLoading[item.product_id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <AiOutlineShoppingCart className="text-lg" />
                            {productInCart ? 'Already in Cart' : 'Add to Cart'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Brand & Category */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 font-medium">{item.brand}</span>
                      <span className="text-xs text-[#8B5A7C] bg-[#8B5A7C]/10 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    {item.rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {renderStars(item.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {item.rating}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        ${item.retail_price}
                      </span>
                      {item.cost_price && item.cost_price > item.retail_price && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ${item.cost_price}
                          </span>
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                            {Math.round(((item.cost_price - item.retail_price) / item.cost_price) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;