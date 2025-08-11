import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, Search, Eye, Download } from 'lucide-react';

function Orders() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample orders data
  const orders = [
    {
      id: 'ORD-2024-001',
      date: '2024-12-15',
      status: 'delivered',
      total: 299.99,
      items: [
        { name: 'Chanel Bleu de Chanel', quantity: 1, price: 150.00, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop' },
        { name: 'Dior Sauvage', quantity: 1, price: 149.99, image: 'https://images.unsplash.com/photo-1585386699204-8d2f2bb10c62?w=100&h=100&fit=crop' }
      ],
      shippingAddress: '123 Main St, New York, NY 10001',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-2024-002',
      date: '2024-12-20',
      status: 'shipped',
      total: 89.99,
      items: [
        { name: 'Tom Ford Black Orchid', quantity: 1, price: 89.99, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&h=100&fit=crop' }
      ],
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
      trackingNumber: 'TRK987654321'
    },
    {
      id: 'ORD-2024-003',
      date: '2024-12-22',
      status: 'processing',
      total: 199.99,
      items: [
        { name: 'Versace Eros', quantity: 1, price: 79.99, image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=100&h=100&fit=crop' },
        { name: 'Paco Rabanne 1 Million', quantity: 1, price: 119.99, image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=100&h=100&fit=crop' }
      ],
      shippingAddress: '789 Pine St, Chicago, IL 60601',
      trackingNumber: null
    },
    {
      id: 'ORD-2024-004',
      date: '2024-12-23',
      status: 'pending',
      total: 450.00,
      items: [
        { name: 'Creed Aventus', quantity: 1, price: 450.00, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=100&h=100&fit=crop' }
      ],
      shippingAddress: '321 Elm St, Miami, FL 33101',
      trackingNumber: null
    },
    {
      id: 'ORD-2024-005',
      date: '2024-12-24',
      status: 'shipped',
      total: 325.50,
      items: [
        { name: 'Giorgio Armani Acqua di Gio', quantity: 1, price: 125.50, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop' },
        { name: 'Calvin Klein Eternity', quantity: 1, price: 200.00, image: 'https://images.unsplash.com/photo-1585386699204-8d2f2bb10c62?w=100&h=100&fit=crop' }
      ],
      shippingAddress: '555 Broadway, Seattle, WA 98101',
      trackingNumber: 'TRK456789123'
    },
    {
      id: 'ORD-2024-006',
      date: '2024-12-25',
      status: 'delivered',
      total: 175.99,
      items: [
        { name: 'Dolce & Gabbana Light Blue', quantity: 1, price: 175.99, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&h=100&fit=crop' }
      ],
      shippingAddress: '777 Fifth Ave, Boston, MA 02101',
      trackingNumber: 'TRK789123456'
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Pending' },
      processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Processing' },
      shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', text: 'Shipped' },
      delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Delivered' }
    };
    return configs[status] || configs.pending;
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        {/* Status Filter Pills */}
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

        {/* Search Bar */}
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

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-fit">
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{order.id}</h3>
                    <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                    <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                    <span className={`text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.text}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">${order.total}</p>
                  <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">${item.price}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{order.items.length - 2} more item(s)
                    </div>
                  )}
                </div>

                {/* Shipping Info */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-900 mb-1">Shipping Address</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{order.shippingAddress}</p>
                    {order.trackingNumber && (
                      <p className="text-xs text-gray-600 mt-1">
                        Tracking: <span className="font-mono text-[#8B5A7C]">{order.trackingNumber}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-[#8B5A7C] hover:bg-[#8B5A7C]/10 rounded-lg transition-colors flex-1 justify-center">
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    {order.status === 'delivered' && (
                      <button className="flex items-center gap-1 px-2 py-1 text-xs text-[#8B5A7C] hover:bg-[#8B5A7C]/10 rounded-lg transition-colors flex-1 justify-center">
                        <Download className="w-3 h-3" />
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

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'You haven\'t placed any orders yet'}
          </p>
          <button className="px-6 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 transition-colors">
            Browse Products
          </button>
        </div>
      )}
    </div>
  );
}

export default Orders;