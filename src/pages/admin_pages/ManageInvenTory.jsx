import { useState, useEffect } from 'react';
import { Search, Warehouse, Edit2, Save, XCircle, Package, AlertCircle, CheckCircle } from 'lucide-react';
import API from '../../api';

const ManageInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingStock, setEditingStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await API.get('/api/admin/products');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        console.error("API response is not an array:", res.data);
        setProducts([]);
        setError("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (err.response?.status === 500) {
        setError(`Server error: ${err.response?.data?.message || 'Internal server error'}`);
      } else {
        setError("Failed to fetch products. Please try again.");
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStockEdit = async (productId) => {
    if (!newStockValue.trim() || isNaN(newStockValue) || parseInt(newStockValue) < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }

    try {
      const product = products.find(p => p.product_id === productId);
      const updatedProduct = {
        ...product,
        stock_quantity: parseInt(newStockValue)
      };

      const res = await API.put(`/api/admin/products/${productId}`, {
        product_id: product.product_id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        tags: Array.isArray(product.tags) ? product.tags : [],
        rating: product.rating || 0,
        cost_price: product.cost_price || 0,
        retail_price: product.retail_price || 0,
        stock_quantity: parseInt(newStockValue),
        image_url: product.image_url || '',
        description: product.description || ''
      });

      setProducts(products.map(p => 
        p.product_id === productId ? { ...p, stock_quantity: parseInt(newStockValue) } : p
      ));
      
      setEditingStock(null);
      setNewStockValue('');
    } catch (err) {
      console.error("Failed to update stock", err);
      alert("Failed to update stock. Please try again.");
    }
  };

  const startStockEdit = (product) => {
    setEditingStock(product.product_id);
    setNewStockValue(product.stock_quantity?.toString() || '0');
  };

  const cancelStockEdit = () => {
    setEditingStock(null);
    setNewStockValue('');
  };

  // Filter products based on search and active filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const stock = product.stock_quantity || 0;
    const matchesFilter =
      activeFilter === 'all' ? true :
      activeFilter === 'low' ? (stock <= 10 && stock > 0) :
      activeFilter === 'out' ? stock === 0 :
      activeFilter === 'good' ? stock > 10 : true;

    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalItems = products.length;
  const outOfStockItems = products.filter(p => (p.stock_quantity || 0) === 0).length;
  const lowStockItems = products.filter(p => {
    const stock = p.stock_quantity || 0;
    return stock <= 10 && stock > 0;
  }).length;
  const goodStockItems = products.filter(p => (p.stock_quantity || 0) > 10).length;

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle };
    if (stock <= 10) return { status: 'low', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: AlertCircle };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading inventory...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-700 mb-3">{error}</div>
            <button 
              onClick={fetchProducts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <Package className="text-gray-400" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Good Stock</p>
                <p className="text-2xl font-bold text-green-600">{goodStockItems}</p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
              </div>
              <AlertCircle className="text-orange-400" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
              <AlertCircle className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 mb-2">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search products by name, brand, category, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#8B5A7C] focus:border-[#8B5A7C] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-[#8B5A7C] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products ({totalItems})
            </button>
            <button
              onClick={() => setActiveFilter('good')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'good' 
                  ? 'bg-[#8B5A7C] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Good Stock ({goodStockItems})
            </button>
            <button
              onClick={() => setActiveFilter('low')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'low' 
                  ? 'bg-[#8B5A7C] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Stock ({lowStockItems})
            </button>
            <button
              onClick={() => setActiveFilter('out')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'out' 
                  ? 'bg-[#8B5A7C] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Out of Stock ({outOfStockItems})
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#8B5A7C] rounded-full"></div>
            <span className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
              {searchTerm && (
                <span className="text-[#8B5A7C] font-medium">
                  {" "}matching "{searchTerm}"
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Warehouse size={48} className="mx-auto text-gray-300 mb-4" />
              <div className="text-gray-500 mb-2">
                {searchTerm ? 'No products found matching your search' : 'No products found'}
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[#8B5A7C] hover:text-[#7A4E6C] text-sm"
                >
                  Clear search to see all products
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <span className="text-sm font-medium text-gray-700">Product Info</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">Brand</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">Category</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">Stock Status</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">Stock Quantity</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-gray-700">Action</span>
                  </div>
                </div>
              </div>
              
              {/* Products */}
              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product, index) => {
                  const stock = product.stock_quantity || 0;
                  const stockInfo = getStockStatus(stock);
                  const StatusIcon = stockInfo.icon;

                  return (
                    <div
                      key={product.product_id}
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-[#8B5A7C] bg-opacity-10 rounded-lg flex items-center justify-center">
                                <span className="text-[#8B5A7C] font-semibold text-sm">
                                  {product.name?.charAt(0)?.toUpperCase() || 'P'}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                              <div className="text-xs text-gray-500">ID: {product.product_id}</div>
                            </div>
                          </div>
                        </div>

                        {/* Brand */}
                        <div className="col-span-2">
                          <div className="text-sm text-gray-900">{product.brand || 'N/A'}</div>
                        </div>

                        {/* Category */}
                        <div className="col-span-2">
                          <div className="text-sm text-gray-900">{product.category || 'N/A'}</div>
                        </div>

                        {/* Stock Status */}
                        <div className="col-span-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${stockInfo.bgColor} ${stockInfo.color}`}>
                            <StatusIcon size={14} />
                            {stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low Stock' : 'Good Stock'}
                          </div>
                        </div>

                        {/* Stock Quantity */}
                        <div className="col-span-2">
                          {editingStock === product.product_id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={newStockValue}
                                onChange={(e) => setNewStockValue(e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8B5A7C] focus:border-[#8B5A7C] text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => handleStockEdit(product.product_id)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={cancelStockEdit}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Cancel"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-gray-900">{stock}</div>
                          )}
                        </div>

                        {/* Action */}
                        <div className="col-span-1">
                          {editingStock !== product.product_id && (
                            <button
                              onClick={() => startStockEdit(product)}
                              className="p-2 text-gray-600 hover:text-[#8B5A7C] hover:bg-[#8B5A7C] hover:bg-opacity-10 rounded-lg transition-colors"
                              title="Edit stock quantity"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;