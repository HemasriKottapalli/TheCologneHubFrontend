import { useState, useEffect } from 'react';
import { AiOutlineHeart, AiFillHeart, AiOutlineShoppingCart, AiOutlineLeft, AiOutlineRight, AiOutlineClose, AiOutlineCheck } from 'react-icons/ai';
import { FaStar } from 'react-icons/fa';
import API from '../../api';
import { isAuthenticated } from '../../utils/authUtils';
import { useAuthAction } from '../../hooks/useAuthAction';

function ProductGrid({ products, onClearFilters, itemsPerPage = 12 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // New state for wishlist and cart items
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Calculate pagination values
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Define action handlers for post-login execution
  const actionHandlers = {
    'ADD_TO_CART': async (data) => {
      const { productId, quantity } = data;
      await handleAddToCart(productId, quantity, false); // false = don't show auth modal
    },
    'TOGGLE_WISHLIST': async (data) => {
      const { productId } = data;
      await handleToggleWishlist(productId, false); // false = don't show auth modal
    }
  };

  // Use the auth action hook
  const { executeWithAuth } = useAuthAction(actionHandlers);

  // Fetch wishlist and cart data on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchUserData();
    } else {
      setDataLoading(false);
    }
  }, []);

  // Listen for login success to fetch user data
  useEffect(() => {
    const handleLoginSuccess = () => {
      fetchUserData();
    };

    window.addEventListener('userLoggedIn', handleLoginSuccess);
    return () => window.removeEventListener('userLoggedIn', handleLoginSuccess);
  }, []);

  // Listen for logout to clear user data
  useEffect(() => {
    const handleLogout = () => {
      setWishlistItems([]);
      setCartItems([]);
    };

    window.addEventListener('userLoggedOut', handleLogout);
    return () => window.removeEventListener('userLoggedOut', handleLogout);
  }, []);

  // Fetch both wishlist and cart data
  const fetchUserData = async () => {
    if (!isAuthenticated()) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    try {
      // Fetch wishlist and cart data in parallel
      const [wishlistResponse, cartResponse] = await Promise.all([
        API.get('/api/customer/wishlist').catch(() => ({ data: { products: [] } })),
        API.get('/api/customer/cart').catch(() => ({ data: { items: [] } }))
      ]);

      // Extract product IDs from wishlist
      const wishlistProductIds = (wishlistResponse.data.products || []).map(item => item.product_id);
      setWishlistItems(wishlistProductIds);

      // Extract product IDs from cart
      const cartProductIds = (cartResponse.data.items || []).map(item => item.productId);
      setCartItems(cartProductIds);

    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // Helper function to check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.includes(productId);
  };

  // Helper function to check if product is in cart
  const isInCart = (productId) => {
    return cartItems.includes(productId);
  };

  // Reset to first page when products change (e.g., after filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // Reset quantity and messages when modal closes
  useEffect(() => {
    if (!selectedProduct) {
      setQuantity(1);
      setError(null);
    }
  }, [selectedProduct]);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // Updated handleAddToCart with auth integration
  const handleAddToCart = async (productId, qty = 1, showAuthModal = true) => {
    // If user is not authenticated and showAuthModal is true, require auth with pending action
    if (!isAuthenticated() && showAuthModal) {
      executeWithAuth('ADD_TO_CART', { productId, quantity: qty }, () => {
        // This will only run if user is already authenticated
        handleAddToCart(productId, qty, false);
      });
      return;
    }

    // If user is not authenticated and showAuthModal is false, just return
    if (!isAuthenticated()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.post('/api/customer/cart', {
        productId: productId,
        quantity: qty
      });

      if (response.status === 200) {
        // Update cart items state
        setCartItems(prev => {
          if (!prev.includes(productId)) {
            return [...prev, productId];
          }
          return prev;
        });
        
        addNotification(`Added ${qty} item(s) to cart!`, 'success');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart. Please try again.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      console.error('Add to cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Updated handleToggleWishlist with auth integration
  const handleToggleWishlist = async (productId, showAuthModal = true) => {
    // If user is not authenticated and showAuthModal is true, require auth with pending action
    if (!isAuthenticated() && showAuthModal) {
      executeWithAuth('TOGGLE_WISHLIST', { productId }, () => {
        // This will only run if user is already authenticated
        handleToggleWishlist(productId, false);
      });
      return;
    }

    // If user is not authenticated and showAuthModal is false, just return
    if (!isAuthenticated()) {
      return;
    }

    setWishlistLoading(true);

    try {
      const isProductInWishlist = isInWishlist(productId);
      
      if (isProductInWishlist) {
        // Remove from wishlist
        const response = await API.delete(`/api/customer/wishlist/${productId}`);
        if (response.status === 200) {
          setWishlistItems(prev => prev.filter(id => id !== productId));
          addNotification('Removed from wishlist', 'success');
        }
      } else {
        // Add to wishlist
        const response = await API.post('/api/customer/wishlist', {
          productId: productId
        });
        if (response.status === 200) {
          setWishlistItems(prev => [...prev, productId]);
          addNotification('Added to wishlist!', 'success');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update wishlist. Please try again.';
      addNotification(errorMessage, 'error');
      console.error('Wishlist error:', err);
    } finally {
      setWishlistLoading(false);
    }
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

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    const productInCart = isInCart(selectedProduct.product_id);
    const productInWishlist = isInWishlist(selectedProduct.product_id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">{selectedProduct.name}</h2>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <AiOutlineClose className="text-lg text-gray-600" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left Column - Image and Description */}
              <div className="space-y-4">
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleToggleWishlist(selectedProduct.product_id)}
                    disabled={wishlistLoading}
                    className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 ${
                      wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label={productInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {productInWishlist ? (
                      <AiFillHeart className="text-red-600 text-base" />
                    ) : (
                      <AiOutlineHeart className="text-gray-400 text-base hover:text-red-600" />
                    )}
                  </button>
                </div>

                {/* Description */}
                {(selectedProduct.description || selectedProduct.name) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {selectedProduct.description ? (
                        <p>{selectedProduct.description}</p>
                      ) : (
                        <p>Experience the premium quality of {selectedProduct.name} from {selectedProduct.brand}. This exceptional {selectedProduct.category.toLowerCase()} combines style, functionality, and durability to meet your needs.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Product Details */}
              <div className="space-y-3">
                {/* Brand & Category */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">{selectedProduct.brand}</span>
                  <span className="text-xs text-[#8B5A7C] bg-[#8B5A7C]/10 px-2 py-1 rounded-full">
                    {selectedProduct.category}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(selectedProduct.rating)}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedProduct.rating}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({Math.floor(Math.random() * 500) + 50} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ${selectedProduct.retail_price}
                  </span>
                  {selectedProduct.cost_price && selectedProduct.cost_price < selectedProduct.retail_price && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ${selectedProduct.cost_price}
                      </span>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                        {Math.round(((selectedProduct.cost_price - selectedProduct.retail_price) / selectedProduct.cost_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Tags */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Specs */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Quick Info</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{selectedProduct.product_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">{selectedProduct.rating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Auth Status Info */}
                {!isAuthenticated() && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700">
                      Sign in to add items to cart and wishlist
                    </p>
                  </div>
                )}

                {/* Quantity Selector and Add to Cart */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    disabled={loading}
                    className="border p-1 w-16 rounded text-sm"
                  />
                  <button
                    onClick={() => handleAddToCart(selectedProduct.product_id, quantity)}
                    disabled={loading}
                    className={`w-full text-white text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium ${
                      productInCart 
                        ? 'bg-[#8B5A7C] hover:bg-[#8B5A7C]/90' 
                        : 'bg-[#8B5A7C] hover:bg-[#8B5A7C]/90'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <AiOutlineShoppingCart className="text-base" />
                    {loading ? 'Adding...' : productInCart ? 'Already in Cart' : isAuthenticated() ? 'Add to Cart' : 'Sign in to Add'}
                  </button>
                </div>
                
                {/* Error message only - success notifications are handled by toast */}
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (showEllipsis) {
      pages.push(1);
      if (currentPage > 4) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AiOutlineLeft className="text-sm" />
          Previous
        </button>
        <div className="flex gap-1">
          {pages.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'text-white bg-[#8B5A7C] border border-[#8B5A7C]'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <AiOutlineRight className="text-sm" />
        </button>
      </div>
    );
  };

  // Show loading state while fetching user data (only if authenticated)
  if (dataLoading && isAuthenticated()) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A7C] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div>
      {renderNotifications()}
      
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length} products
        </p>
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentProducts.map((product) => {
          const productInWishlist = isInWishlist(product.product_id);
          const productInCart = isInCart(product.product_id);
          
          return (
            <div
              key={product.product_id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(product.product_id);
                  }}
                  disabled={wishlistLoading}
                  className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 ${
                    wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label={productInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {productInWishlist ? (
                    <AiFillHeart className="text-red-600 text-lg" />
                  ) : (
                    <AiOutlineHeart className="text-gray-400 text-lg hover:text-red-600" />
                  )}
                </button>

                {/* Add to Cart Button on Hover */}
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.product_id, 1);
                    }}
                    disabled={loading}
                    className={`w-full text-white text-sm py-2 rounded flex items-center justify-center gap-2 transition-colors ${
                      productInCart 
                        ? 'bg-[#8B5A7C] hover:bg-[#8B5A7C]/90' 
                        : 'bg-[#8B5A7C] hover:bg-[#8B5A7C]/90'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    aria-label="Add to cart"
                  >
                    <AiOutlineShoppingCart className="text-lg" />
                    {loading ? 'Adding...' : productInCart ? 'Already in Cart' : isAuthenticated() ? 'Add to Cart' : 'Sign in to Add'}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 font-medium">{product.brand}</span>
                  <span className="text-xs text-[#8B5A7C] bg-[#8B5A7C]/10 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {product.name}
                </h3>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.retail_price}
                  </span>
                  {product.cost_price && product.cost_price < product.retail_price && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ${product.cost_price}
                      </span>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                        {Math.round(((product.cost_price - product.retail_price) / product.cost_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {renderPagination()}
      {renderProductModal()}
    </div>
  );
}

export default ProductGrid;