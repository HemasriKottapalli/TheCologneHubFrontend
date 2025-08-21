// pages/OrderConfirmation.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, MapPin, CreditCard, Download, ArrowRight } from 'lucide-react';
import API from '../api';

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/customer/order/${orderId}`);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-green-600 bg-green-100',
      processing: 'text-blue-600 bg-blue-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100'
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <button 
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B5A7C] to-[#A86B7A] text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Order #{order.orderId}</h2>
              <p className="opacity-90">Placed on {formatDate(order.orderDate || order.createdAt)}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                <Package className="w-4 h-4 mr-1" />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Items List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                </div>
                {order.promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.promoCode})</span>
                    <span>-₹{order.promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {order.shipping === 0 ? 'Free' : `₹${order.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#8B5A7C]" />
            <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
          </div>
          <div className="text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Payment & Delivery Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-[#8B5A7C]" />
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
              </div>
              <p className="text-gray-600 capitalize">{order.paymentMethod} • {order.paymentStatus}</p>
            </div>
            
            {order.estimatedDelivery && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#8B5A7C]" />
                  <h3 className="text-lg font-semibold text-gray-900">Estimated Delivery</h3>
                </div>
                <p className="text-gray-600">{formatDate(order.estimatedDelivery)}</p>
              </div>
            )}

            {order.trackingNumber && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-[#8B5A7C]" />
                  <h3 className="text-lg font-semibold text-gray-900">Tracking Number</h3>
                </div>
                <p className="text-gray-600 font-mono">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
        >
          <Package className="w-4 h-4" />
          View All Orders
        </button>
        
        <button
          onClick={() => navigate('/products')}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-[#8B5A7C] text-[#8B5A7C] rounded-lg hover:bg-[#8B5A7C]/10 transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Print Receipt
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;