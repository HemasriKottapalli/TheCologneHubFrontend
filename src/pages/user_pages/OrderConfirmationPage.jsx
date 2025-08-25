// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { CheckCircle, Package, Truck, Calendar, MapPin, CreditCard, Download, ArrowRight } from 'lucide-react';
// import API from '../../api';

// function OrderConfirmation() {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Check if order data was passed via navigation state
//   const orderDataFromState = location.state?.orderData;

//   useEffect(() => {
//     console.log('🎯 Order Confirmation Page Loaded');
//     console.log('- Order ID:', orderId);
//     console.log('- Location state:', location.state);
    
//     if (orderDataFromState) {
//       console.log('✅ Using order data from navigation state');
//       setOrder(orderDataFromState);
//       setLoading(false);
//     } else {
//       console.log('🔄 Fetching order data from API');
//       fetchOrderDetails();
//     }
//   }, [orderId]);

//   const fetchOrderDetails = async () => {
//     try {
//       setLoading(true);
//       console.log('📡 Fetching order:', orderId);
      
//       const response = await API.get(`/api/customer/order/${orderId}`);
      
//       if (response.data.success) {
//         console.log('✅ Order data received:', response.data.order);
//         setOrder(response.data.order);
//       } else {
//         throw new Error('Order not found');
//       }
//     } catch (err) {
//       console.error('❌ Error fetching order:', err);
//       setError(err.response?.data?.message || 'Failed to load order details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="text-center py-16">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A7C] mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading order details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="text-center py-16">
//           <div className="text-red-500 text-6xl mb-4">⚠️</div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <div className="space-x-4">
//             <button 
//               onClick={() => navigate('/orders')}
//               className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
//             >
//               View All Orders
//             </button>
//             <button 
//               onClick={() => navigate('/shop')}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="text-center py-16">
//           <p>No order data available</p>
//           <button 
//             onClick={() => navigate('/')}
//             className="mt-4 px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
//           >
//             Go Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       {/* Success Header */}
//       <div className="text-center mb-8">
//         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <CheckCircle className="w-8 h-8 text-green-600" />
//         </div>
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed! 🎉</h1>
//         <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        
//         {/* Debug info - remove in production */}
//         {process.env.NODE_ENV === 'development' && (
//           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-left">
//             <strong>Debug Info:</strong><br/>
//             Order ID: {orderId}<br/>
//             Order Status: {order.status}<br/>
//             Payment Status: {order.paymentStatus}<br/>
//             Total: ${order.total}
//           </div>
//         )}
//       </div>

//       {/* Order Summary - simplified version */}
//       <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//         <h2 className="text-xl font-semibold mb-4">Order #{order.orderId || orderId}</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <h3 className="font-semibold mb-2">Order Details</h3>
//             <p>Status: <span className="capitalize font-medium text-green-600">{order.status}</span></p>
//             <p>Total: <span className="font-bold">${order.total?.toFixed(2)}</span></p>
//             <p>Items: {order.items?.length || 0}</p>
//           </div>
          
//           <div>
//             <h3 className="font-semibold mb-2">Shipping Address</h3>
//             {order.shippingAddress && (
//               <div className="text-sm text-gray-600">
//                 <p>{order.shippingAddress.fullName}</p>
//                 <p>{order.shippingAddress.addressLine1}</p>
//                 {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
//                 <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 justify-center">
//         <button
//           onClick={() => navigate('/orders')}
//           className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors flex items-center justify-center gap-2"
//         >
//           View Order History <ArrowRight className="w-4 h-4" />
//         </button>
        
//         <button
//           onClick={() => navigate('/products')}
//           className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
//         >
//           Continue Shopping <Package className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   );
// }

// export default OrderConfirmation;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, MapPin, CreditCard, Download, ArrowRight } from 'lucide-react';
import API from '../../api';

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if order data was passed via navigation state
  const orderDataFromState = location.state?.orderData;

  useEffect(() => {
    if (orderDataFromState) {
      setOrder(orderDataFromState);
      setLoading(false);
    } else {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/customer/order/${orderId}`);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        throw new Error('Order not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A7C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
            >
              View All Orders
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p>No order data available</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed! 🎉</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      {/* Order Summary - simplified version */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order #{order.orderId || orderId}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Order Details</h3>
            <p>Status: <span className="capitalize font-medium text-green-600">{order.status}</span></p>
            <p>Total: <span className="font-bold">${order.total?.toFixed(2)}</span></p>
            <p>Items: {order.items?.length || 0}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            {order.shippingAddress && (
              <div className="text-sm text-gray-600">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors flex items-center justify-center gap-2"
        >
          View Order History <ArrowRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          Continue Shopping <Package className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;