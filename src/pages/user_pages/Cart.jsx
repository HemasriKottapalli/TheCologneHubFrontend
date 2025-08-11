import { useState, useEffect } from 'react';
import API from '../../api';
import OrderSummary from '../../components/user_comps/OrderSummary';
import CartItems from '../../components/user_comps/CartItems';


function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get('/api/customer/cart');
      
      // Transform API response to match component structure
      const transformedItems = (response.data.items || [])
        .filter(item => {
          return item.product && 
                 item.product.name && 
                 item.productId && 
                 item.quantity > 0;
        })
        .map(item => ({
          id: item.productId,
          productId: item.productId,
          name: item.product.name,
          brand: item.product.brand || 'Unknown Brand',
          price: item.product.retail_price || 0,
          originalPrice: item.product.cost_price && item.product.cost_price > item.product.retail_price 
            ? item.product.cost_price 
            : null,
          quantity: item.quantity,
          image: item.product.image_url || null,
          size: '100ml',
          stockQuantity: item.product.stock_quantity || 0,
          inStock: (item.product.stock_quantity || 0) > 0
        }));
      
      setCartItems(transformedItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load cart items. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const currentItem = cartItems.find(item => item.productId === productId);
    if (!currentItem) return;

    if (newQuantity > currentItem.stockQuantity) {
      setError(`Only ${currentItem.stockQuantity} items available in stock`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      setUpdatingItems(prev => new Set([...prev, productId]));
      
      setCartItems(items =>
        items.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );

      await API.put('/api/customer/cart', {
        productId,
        quantity: newQuantity
      });
      
    } catch (err) {
      console.error('Error updating quantity:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update quantity. Please try again.';
      setError(errorMessage);
      fetchCartItems();
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdatingItems(prev => new Set([...prev, productId]));
      
      setCartItems(items => items.filter(item => item.productId !== productId));
      
      await API.delete(`/api/customer/cart/${productId}`);
      
    } catch (err) {
      console.error('Error removing item:', err);
      const errorMessage = err.response?.data?.message || 'Failed to remove item. Please try again.';
      setError(errorMessage);
      fetchCartItems();
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  const applyPromoCode = () => {
    const code = promoCode.toLowerCase();
    if (code === 'save20') {
      setAppliedPromo({ code: 'SAVE20', discount: 20 });
      setPromoCode('');
      setError(null);
    } else if (code === 'newuser10') {
      setAppliedPromo({ code: 'NEWUSER10', discount: 10 });
      setPromoCode('');
      setError(null);
    } else {
      setError('Invalid promo code');
      setTimeout(() => setError(null), 3000);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setError(null);
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      setError(null);
      
      // Prepare checkout data
      const checkoutData = {
        items: inStockItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        promoCode: appliedPromo?.code || null,
        subtotal: subtotal,
        discount: promoDiscount,
        shipping: shipping,
        tax: tax,
        total: total
      };

      // Call checkout API
      const response = await API.post('/api/customer/checkout', checkoutData);
      
      if (response.data.success) {
        // Redirect to payment or success page
        const { orderId, paymentUrl } = response.data;
        
        if (paymentUrl) {
          // Redirect to payment gateway
          window.location.href = paymentUrl;
        } else {
          // Redirect to order confirmation
          window.location.href = `/order-confirmation/${orderId}`;
        }
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.message || 'Checkout failed. Please try again.';
      setError(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Separate items by stock status
  const inStockItems = cartItems.filter(item => item.stockQuantity > 0);
  const outOfStockItems = cartItems.filter(item => item.stockQuantity <= 0);

  // Calculate totals
  const subtotal = inStockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = (subtotal - promoDiscount) * 0.08;
  const total = subtotal - promoDiscount + shipping + tax;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A7C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-4">Add some amazing fragrances to get started</p>
          <button 
            onClick={() => window.location.href = '/products'}
            className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CartItems
          inStockItems={inStockItems}
          outOfStockItems={outOfStockItems}
          updatingItems={updatingItems}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          error={error}
          clearError={clearError}
        />
        
        <OrderSummary
          inStockItems={inStockItems}
          outOfStockItems={outOfStockItems}
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          appliedPromo={appliedPromo}
          applyPromoCode={applyPromoCode}
          removePromo={removePromo}
          subtotal={subtotal}
          promoDiscount={promoDiscount}
          shipping={shipping}
          tax={tax}
          total={total}
          onCheckout={handleCheckout}
          checkoutLoading={checkoutLoading}
        />
      </div>
    </div>
  );
}

export default Cart;