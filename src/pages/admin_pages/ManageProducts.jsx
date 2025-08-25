import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, Star, Search, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import API from '../../api';
import AddBulkProducts from './AddBulkProducts';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    brand: '',
    category: '',
    tags: '',
    rating: '',
    cost_price: '',
    retail_price: '',
    stock_quantity: '',
    image_url: '',
    description: ''
  });

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
      console.error("Error details:", err.response?.data);
      
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

  const fetchBrands = async () => {
    try {
      const { data } = await API.get('/api/admin/brands/all');
      if (Array.isArray(data)) {
        const brandNames = data.map(brand => brand.brandName);
        setBrands(brandNames);
      } else {
        console.error("Brands API response is not an array:", data);
        setBrands([]);
      }
    } catch (err) {
      console.error("Failed to fetch brands", err);
      setError("Failed to fetch brands. Please try again.");
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const searchString = searchTerm.toLowerCase();
      return (
        product.name?.toLowerCase().includes(searchString) ||
        product.brand?.toLowerCase().includes(searchString) ||
        product.category?.toLowerCase().includes(searchString) ||
        product.product_id?.toLowerCase().includes(searchString) ||
        (Array.isArray(product.tags) && product.tags.some(tag => tag.toLowerCase().includes(searchString)))
      );
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'rating' || sortBy === 'cost_price' || sortBy === 'retail_price' || sortBy === 'stock_quantity') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortBy === 'created_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

const handleAddProduct = async (e) => {
  e.preventDefault();
  try {
    const form = new FormData();

    form.append("product_id", formData.product_id);
    form.append("name", formData.name);
    form.append("brand", formData.brand);
    form.append("category", formData.category);
    form.append("tags", formData.tags);
    form.append("rating", formData.rating);
    form.append("cost_price", formData.cost_price);
    form.append("retail_price", formData.retail_price);
    form.append("stock_quantity", formData.stock_quantity);
    form.append("description", formData.description);

    if (formData.image) {
      form.append("image", formData.image); // matches Multer field name
    }

    const res = await API.post("/api/admin/products", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const newProduct = res.data.product;
    setProducts([...products, newProduct]);
    setShowAddForm(false);
    resetForm();
  } catch (err) {
    console.error("Failed to add product", err);
    setError("Failed to add product. Please try again.");
  }
};


const handleEditProduct = async (e) => {
  e.preventDefault();
  try {
    // create FormData for multipart request
    const productData = new FormData();

    productData.append("product_id", editingProduct.product_id); // keep same id
    productData.append("name", formData.name);
    productData.append("brand", formData.brand);
    productData.append("category", formData.category);
    productData.append(
      "tags",
      formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
        .join(",")
    );
    productData.append("rating", parseFloat(formData.rating) || 0);
    productData.append("cost_price", parseFloat(formData.cost_price) || 0);
    productData.append("retail_price", parseFloat(formData.retail_price) || 0);
    productData.append("stock_quantity", parseInt(formData.stock_quantity) || 0);
    productData.append("description", formData.description);

    // only append if a new image is chosen
    if (formData.image) {
      productData.append("image", formData.image);
    }

    const res = await API.put(
      `/api/admin/products/${editingProduct.product_id}`,
      productData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const updatedProduct = res.data.product;
    setProducts(
      products.map((p) =>
        p.product_id === editingProduct.product_id ? updatedProduct : p
      )
    );
    setEditingProduct(null);
    resetForm();
  } catch (err) {
    console.error("Failed to update product", err);
    setError("Failed to update product. Please try again.");
  }
};


  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await API.delete(`/api/admin/products/${id}`);
      setProducts(products.filter(p => p.product_id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
      setError("Failed to delete product. Please try again.");
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_id: product.product_id || '',
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      rating: product.rating || '',
      cost_price: product.cost_price || '',
      retail_price: product.retail_price || '',
      stock_quantity: product.stock_quantity || '',
      image_url: product.image_url || '',
      description: product.description || ''
    });
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      name: '',
      brand: '',
      category: '',
      tags: '',
      rating: '',
      cost_price: '',
      retail_price: '',
      stock_quantity: '',
      image_url: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    resetForm();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} className="fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />);
    }
    
    return stars;
  };

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-red-50 border border-red-200 rounded-lg max-w-lg mx-auto mt-10">
        <div className="text-red-700">{error}</div>
        <button 
          onClick={fetchProducts}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      {/* Header and Controls */}
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:m-2">
        <h2 className="text-xl md:text-2xl font-bold text-[#2C2B2A]">Manage Products</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingProduct(null);
              setSelectedProduct(null); // Close detail modal
              resetForm();
            }}
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors bg-[#8B5A7C] hover:bg-[#7A4E6C] text-sm md:text-base"
          >
            <Plus size={16} />
            Add Product
          </button>
          <AddBulkProducts />
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-2 md:p-4 mb-2 flex flex-col md:flex-row gap-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B5A7C] transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A7C] transition-colors"
          >
            <option value="name">Sort by Name</option>
            <option value="brand">Sort by Brand</option>
            <option value="category">Sort by Category</option>
            <option value="retail_price">Sort by Price</option>
            <option value="stock_quantity">Sort by Stock</option>
            <option value="rating">Sort by Rating</option>
            <option value="created_at">Sort by Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border rounded-full text-sm hover:bg-gray-100 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A7C] transition-colors"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Product count info */}
      <div className="mt-3 ml-4 text-xs md:text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
        {searchTerm && ` (filtered from ${products.length} total)`}
      </div>

      {/* No products found state */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-8 text-center mt-4">
          <div className="text-gray-500 text-sm">
            {searchTerm ? 'No products found matching your search' : 'No products found'}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Product Cards (hidden on medium screens and up) */}
          <div className="mt-4 md:hidden bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {paginatedProducts.map(prod => (
              <div key={prod.product_id} onClick={() => setSelectedProduct(prod)} className="p-4 flex flex-col gap-2 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm text-[#2C2B2A]">{prod.name}</div>
                  <div className="flex gap-2 text-gray-500">
                    <button onClick={(e)=>{e.stopPropagation(); startEdit(prod);}} className="text-blue-600 hover:text-blue-800"><Edit2 size={16}/></button>
                    <button onClick={(e)=>{e.stopPropagation(); deleteProduct(prod.product_id);}} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">ID: {prod.product_id}</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <div><strong className="text-gray-600">Brand:</strong> {prod.brand || 'N/A'}</div>
                  <div><strong className="text-gray-600">Price:</strong> ${prod.retail_price || 0}</div>
                  <div><strong className="text-gray-600">Stock:</strong> {prod.stock_quantity || 0}</div>
                  <div className="flex items-center gap-1"><strong className="text-gray-600">Rating:</strong> {renderStars(prod.rating || 0)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Product Table (hidden on small screens) */}
          <div className="mt-4 hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID','Name','Brand','Category','Price (Cost/Retail)','Stock','Rating','Actions'].map(header=>(
                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map(prod=>(
                  <tr key={prod.product_id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setSelectedProduct(prod)}>
                    <td className="px-4 py-3 text-sm text-[#2C2B2A]">{prod.product_id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#2C2B2A]">{prod.name}</td>
                    <td className="px-4 py-3 text-sm text-[#2C2B2A]">{prod.brand||'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-[#2C2B2A]">{prod.category||'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-[#8B5A7C]">${prod.cost_price||0}/${prod.retail_price||0}</td>
                    <td className="px-4 py-3 text-sm text-[#2C2B2A]">{prod.stock_quantity||0}</td>
                    <td className="px-4 py-3 text-sm flex items-center gap-1">{renderStars(prod.rating||0)}</td>
                    <td>
                      <button onClick={(e)=>{e.stopPropagation(); startEdit(prod);}} className="text-blue-600 hover:text-blue-800"><Edit2 size={16}/></button>
                      <button onClick={(e)=>{e.stopPropagation(); deleteProduct(prod.product_id);}} className="text-red-600 hover:text-red-800 ml-5"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border rounded-lg disabled:opacity-50 flex items-center gap-2 text-[#8B5A7C] hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border rounded-lg disabled:opacity-50 flex items-center gap-2 text-[#8B5A7C] hover:bg-gray-100 transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {(showAddForm || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2C2B2A]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={cancelEdit}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Product ID *</label>
                <input type="text" name="product_id" value={formData.product_id} onChange={handleInputChange} required disabled={!!editingProduct} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C] disabled:bg-gray-100 disabled:cursor-not-allowed" />
              </div>
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Product Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]" />
              </div>
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Brand *</label>
                <select name="brand" value={formData.brand} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]">
                  <option value="">Select Brand</option>
                  {brands.map((brandName) => (<option key={brandName} value={brandName}>{brandName}</option>))}
                </select>
              </div>
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]">
                  <option value="">Select Category</option>
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Gifts">Gifts</option>
                </select>
              </div>
              <div className="col-span-full md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Tags (comma-separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g., perfume, floral, women" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]" />
              </div>
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Rating (0-5)</label>
                <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} min="0" max="5" step="0.1" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]" />
              </div>
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Cost Price *</label>
                <input type="number" name="cost_price" value={formData.cost_price} onChange={handleInputChange} required step="0.01" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]" />
              </div>
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Retail Price *</label>
                <input type="number" name="retail_price" value={formData.retail_price} onChange={handleInputChange} required step="0.01" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]" />
              </div>
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Stock Quantity</label>
                <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]" />
              </div>

               <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5A7C] resize-none" />
              </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1 text-[#2C2B2A]">Upload Image</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-[#8B5A7C] text-white rounded-md cursor-pointer hover:bg-[#7A4E6C] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V8m0 0L3 12m4-4l4 4m6 0v8m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                  <span className="text-sm">Choose Image</span>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size > 5 * 1024 * 1024) {
                        alert("File size exceeds 5MB limit");
                        return;
                      }
                      if (file && !file.type.startsWith("image/")) {
                        alert("Please select an image file");
                        return;
                      }
                      setFormData((prev) => ({ ...prev, image: file }));
                    }}
                    className="hidden"
                  />
                </label>
                {formData.image && (
                  <>
                    <span className="text-sm text-gray-600 truncate max-w-xs">
                      {formData.image.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                    >
                      <XCircle size={16} />
                      Clear
                    </button>
                  </>
                )}
              </div>
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-24 h-24 object-contain rounded-md border border-gray-200"
                  />
                </div>
              )}
            </div>

              <div className="flex gap-2 mt-4 justify-end col-span-full">
                <button
                  type="submit"
                  className="text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors bg-[#8B5A7C] hover:bg-[#7A4E6C]"
                >
                  <Save size={16} />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2C2B2A]">{selectedProduct.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    startEdit(selectedProduct);
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  title="Close"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-contain rounded-lg shadow-sm"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image Available</span>
                  </div>
                )}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-500">Description</h4>
                  <p className="text-sm text-[#2C2B2A]">{selectedProduct.description || 'No description available'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Product ID</h4>
                  <p className="text-sm text-[#2C2B2A]">{selectedProduct.product_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Brand</h4>
                  <p className="text-sm text-[#2C2B2A]">{selectedProduct.brand || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Category</h4>
                  <p className="text-sm text-[#2C2B2A]">{selectedProduct.category || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedProduct.tags) && selectedProduct.tags.length > 0 ? (
                      selectedProduct.tags.map((tag, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-[#2C2B2A]">{tag}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No tags</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Rating</h4>
                  <div className="flex items-center gap-1">{renderStars(selectedProduct.rating || 0)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Pricing</h4>
                  <p className="text-sm text-[#2C2B2A]">
                    Cost: ${selectedProduct.cost_price || 0} / Retail: ${selectedProduct.retail_price || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    Margin: {selectedProduct.cost_price && selectedProduct.retail_price ? Math.round(((selectedProduct.retail_price - selectedProduct.cost_price) / selectedProduct.retail_price) * 100) : 0}%
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Stock Quantity</h4>
                  <p className="text-sm text-[#2C2B2A]">{selectedProduct.stock_quantity || 0}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Created At</h4>
                  <p className="text-sm text-[#2C2B2A]">{formatDate(selectedProduct.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;