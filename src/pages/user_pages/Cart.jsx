// Fixed Cart.jsx with better error handling and debugging
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom'; // Add this import
import API from '../../api';
import OrderSummary from '../../components/user_comps/OrderSummary';
import CartItems from '../../components/user_comps/CartItems';
import CheckoutForm from '../../components/user_comps/checkoutForm';
import ShippingForm from '../../components/user_comps/ShippingForm';

// Load Stripe with proper environment variable for Vite
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Cart() {
  const navigate = useNavigate(); // Add navigation hook
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');

  // Debug: Check if Stripe key is loaded
  useEffect(() => {
    console.log('🔧 Cart Component Debug Info:');
    console.log('- Stripe key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Found ✅' : 'Missing ❌');
    console.log('- Current step:', checkoutStep);
    console.log('- Cart items:', cartItems.length);
    
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setError('Stripe configuration is missing. Please check environment variables.');
    }
  }, [checkoutStep, cartItems.length]);

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get('/api/customer/cart');
      
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
      console.error('❌ Error fetching cart:', err);
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

  const handleCheckout = () => {
    if (inStockItems.length === 0) {
      setError('No items available for checkout');
      return;
    }
    
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setError('Payment system is not configured. Please contact support.');
      return;
    }
    
    setCheckoutStep('shipping');
  };

  
  const handleShippingSubmit = async (shippingData) => {
    try {
      setCheckoutLoading(true);
      setError(null);
      setShippingAddress(shippingData);

      const checkoutData = {
        items: inStockItems.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        promoCode: appliedPromo?.code || null,
        subtotal: subtotal,
        promoDiscount: promoDiscount,
        shipping: shipping,
        tax: tax,
        total: total,
        shippingAddress: shippingData
      };

      console.log('💳 Creating payment intent with data:', checkoutData);

      const response = await API.post('/api/customer/create-payment-intent', checkoutData);
      
      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
        setOrderId(response.data.orderId);
        setCheckoutStep('payment');
        console.log('✅ Payment intent created successfully');
      } else {
        throw new Error(response.data.message || 'Failed to initialize payment');
      }
      
    } catch (err) {
      console.error('❌ Payment initialization error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to initialize payment. Please try again.';
      setError(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Fixed payment success handler with better error handling
  const handlePaymentSuccess = async (completedOrderId) => {
    try {
      console.log('🎉 Payment successful! Order ID:', completedOrderId);
      console.log('🔄 Confirming payment with backend...');
      
      // Confirm payment on backend
      const confirmResponse = await API.post('/api/customer/confirm-payment', {
        paymentIntentId: clientSecret.split('_secret_')[0],
        orderId: completedOrderId
      });

      console.log('✅ Payment confirmed:', confirmResponse.data);

      // Check if confirmation was successful
      if (confirmResponse.data.success) {
        console.log('🚀 Redirecting to order confirmation...');
        
        // Use React Router navigation instead of window.location
        navigate(`/order-confirmation/${completedOrderId}`, { 
          replace: true,
          state: { 
            orderConfirmed: true,
            orderData: confirmResponse.data.order 
          }
        });
      } else {
        throw new Error('Payment confirmation failed');
      }
      
    } catch (err) {
      console.error('❌ Payment confirmation error:', err);
      
      // More specific error handling
      if (err.response?.status === 404) {
        setError('Order not found. Payment may have succeeded but order confirmation failed. Please contact support with your payment details.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Redirect to login or refresh page
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setError('Payment succeeded but confirmation failed. Please contact support or check your order history.');
      }
    }
  };

  // Enhanced payment error handler
  const handlePaymentError = (errorMessage) => {
    console.error('❌ Payment failed:', errorMessage);
    setError(`Payment failed: ${errorMessage}`);
    
    // Don't redirect on payment failure - stay on payment page
    // User can try again
  };

  const handleBack = () => {
    if (checkoutStep === 'payment') {
      setCheckoutStep('shipping');
      setClientSecret('');
      setOrderId('');
    } else if (checkoutStep === 'shipping') {
      setCheckoutStep('cart');
    }
  };

  const clearError = () => setError(null);

  // Calculate values
  const inStockItems = cartItems.filter(item => item.stockQuantity > 0);
  const outOfStockItems = cartItems.filter(item => item.stockQuantity <= 0);
  const subtotal = inStockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const shipping = subtotal > 75 ? 0 : 9.99; // Free shipping over $75, otherwise $9.99
  const tax = (subtotal - promoDiscount) * 0.08; // 8% sales tax (adjust based on your tax requirements)
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
  if (cartItems.length === 0 && !loading && checkoutStep === 'cart') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-4">Add some amazing fragrances to get started</p>
          <button 
            onClick={() => navigate('/shop')}
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
      {/* Progress indicator */}
      {cartItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${checkoutStep === 'cart' ? 'text-[#8B5A7C]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                checkoutStep === 'cart' ? 'bg-[#8B5A7C] text-white' : 'bg-gray-200'
              }`}>1</div>
              <span className="ml-2 font-medium">Cart</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className={`flex items-center ${checkoutStep === 'shipping' ? 'text-[#8B5A7C]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                checkoutStep === 'shipping' ? 'bg-[#8B5A7C] text-white' : 'bg-gray-200'
              }`}>2</div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className={`flex items-center ${checkoutStep === 'payment' ? 'text-[#8B5A7C]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                checkoutStep === 'payment' ? 'bg-[#8B5A7C] text-white' : 'bg-gray-200'
              }`}>3</div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Render appropriate step */}
      {checkoutStep === 'cart' && (
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
      )}

      {checkoutStep === 'shipping' && (
        <div className="max-w-2xl mx-auto">
          <ShippingForm
            onSubmit={handleShippingSubmit}
            onBack={handleBack}
            loading={checkoutLoading}
          />
        </div>
      )}

      {checkoutStep === 'payment' && clientSecret && (
        <div className="max-w-2xl mx-auto">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              orderId={orderId}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              orderTotal={total}
              onBack={handleBack}
              shippingAddress={shippingAddress}
            />
          </Elements>
        </div>
      )}
    </div>
  );
}

export default Cart;