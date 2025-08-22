import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, Search, Eye, Download, XCircle, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import API from '../../api';

function Orders() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAddresses, setExpandedAddresses] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [activeFilter, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching orders with params:', { status: activeFilter, search: searchTerm });
      const response = await API.get('/api/customer/orders', {
        params: {
          status: activeFilter === 'all' ? undefined : activeFilter,
          search: searchTerm.trim() || undefined,
          page: 1,
          limit: 50,
        },
      });

      console.log('✅ API Response:', response.data);
      console.log('📊 Status Counts from API:', response.data.statusCounts);

      if (response.data.success) {
        setOrders(response.data.orders || []);
        setStatusCounts({
          all: response.data.statusCounts?.all ?? 0,
          pending: response.data.statusCounts?.pending ?? 0,
          confirmed: response.data.statusCounts?.confirmed ?? 0,
          processing: response.data.statusCounts?.processing ?? 0,
          shipped: response.data.statusCounts?.shipped ?? 0,
          delivered: response.data.statusCounts?.delivered ?? 0,
          cancelled: response.data.statusCounts?.cancelled ?? 0,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Pending' },
      confirmed: { icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-100', text: 'Confirmed' },
      processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Processing' },
      shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', text: 'Shipped' },
      delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Delivered' },
      cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Cancelled' },
    };
    return configs[status] || configs.pending;
  };

  const toggleAddress = (orderId) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const toggleItems = (orderId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A7C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === status
                  ? 'bg-[#8B5A7C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders or products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          const isAddressExpanded = expandedAddresses[order.id];
          const isItemsExpanded = expandedItems[order.id];
          const hasMoreItems = order.items.length > 2;
          const displayItems = isItemsExpanded ? order.items : order.items.slice(0, 2);

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 truncate">{order.orderId}</h3>
                    <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${statusConfig.bg} shadow-sm flex-shrink-0`}>
                    <StatusIcon className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${statusConfig.color}`} />
                    <span className={`text-xs font-semibold ${statusConfig.color}`}>
                      {statusConfig.text}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg sm:text-xl font-bold text-[#8B5A7C]">${order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <ShoppingBag className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">{order.items.length}</span>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="px-4 sm:px-5 py-3 sm:py-4">
                <div className="space-y-2 sm:space-y-3">
                  {displayItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 sm:w-12 h-10 sm:h-12 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute -top-1 -right-1 bg-[#8B5A7C] text-white text-xs rounded-full w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs sm:text-sm leading-tight mb-1 line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-gray-500">Unit: ${item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {hasMoreItems && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => toggleItems(order.id)}
                        className="text-xs sm:text-sm text-[#8B5A7C] hover:text-[#8B5A7C]/80 font-medium flex items-center gap-1 mx-auto transition-colors touch-manipulation"
                      >
                        {isItemsExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" /> 
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" /> 
                            Show {order.items.length - 2} More Items
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Section */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="pt-3 sm:pt-4 border-t border-gray-100 space-y-3 sm:space-y-4">
                  {/* Shipping Address */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Shipping Address</p>
                      <button
                        onClick={() => toggleAddress(order.id)}
                        className="text-xs text-[#8B5A7C] hover:text-[#8B5A7C]/80 font-medium flex items-center gap-1 transition-colors touch-manipulation"
                      >
                        {isAddressExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" /> Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" /> More
                          </>
                        )}
                      </button>
                    </div>
                    
                    {isAddressExpanded ? (
                      <div className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                        {/* Handle both string and object shippingAddress */}
                        {typeof order.shippingAddress === 'string' ? (
                          <div>
                            <p className="font-medium mb-1">Delivery Address:</p>
                            <p className="whitespace-pre-line">{order.shippingAddress}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">
                              {order.shippingAddress?.fullName || order.shippingAddress?.name || order.customerName || 'Customer'}
                            </p>
                            <p>{order.shippingAddress?.address || order.shippingAddress?.street || ''}</p>
                            <p>
                              {order.shippingAddress?.city || ''}{order.shippingAddress?.city ? ', ' : ''}{order.shippingAddress?.state || ''}{' '}
                              {order.shippingAddress?.zip || order.shippingAddress?.zipCode || order.shippingAddress?.postalCode || ''}
                            </p>
                            {(order.shippingAddress?.country || order.country) && (
                              <p>{order.shippingAddress?.country || order.country}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Estimated Delivery */}
                        {order.estimatedDelivery && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="font-medium text-gray-900">Estimated Delivery:</p>
                            <p className="text-[#8B5A7C]">
                              {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        )}
                        
                        {/* Tracking Number */}
                        {order.trackingNumber && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="font-medium text-gray-900">Tracking Number:</p>
                            <p className="font-mono text-[#8B5A7C] bg-white px-2 py-1 rounded border mt-1 inline-block break-all">
                              {order.trackingNumber}
                            </p>
                          </div>
                        )}
                        
                        {/* Payment Info */}
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="font-medium text-gray-900">Payment:</p>
                          <p className="capitalize text-gray-600">
                            {order.paymentMethod || 'N/A'} • {order.paymentStatus || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {typeof order.shippingAddress === 'string' 
                          ? order.shippingAddress 
                          : (order.shippingAddress?.address || order.shippingAddress?.street || order.address || 
                             `${order.shippingAddress?.city || ''} ${order.shippingAddress?.state || ''}`.trim() || 'Address not available')
                        }
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => navigate(`/order-confirmation/${order.id}`)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#8B5A7C] bg-[#8B5A7C]/10 hover:bg-[#8B5A7C]/20 rounded-lg transition-colors flex-1 justify-center font-medium touch-manipulation"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#8B5A7C] bg-[#8B5A7C]/10 hover:bg-[#8B5A7C]/20 rounded-lg transition-colors flex-1 justify-center font-medium touch-manipulation"
                      >
                        <Download className="w-4 h-4" />
                        Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {orders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : "You haven't placed any orders yet"}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors"
          >
            Browse Products
          </button>
        </div>
      )}
    </div>
  );
}

export default Orders;