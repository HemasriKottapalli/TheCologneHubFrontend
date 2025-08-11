// import { useEffect, useState, useMemo } from 'react';
// import { Plus, Edit2, Trash2, Save, Star, Search, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
// import API from '../../api';

// const ManageProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [selectedProduct, setSelectedProduct] = useState(null);
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('name');
//   const [sortOrder, setSortOrder] = useState('asc');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
  
//   const [formData, setFormData] = useState({
//     product_id: '',
//     name: '',
//     brand: '',
//     category: '',
//     tags: '',
//     rating: '',
//     cost_price: '',
//     retail_price: '',
//     stock_quantity: '',
//     image_url: '',
//     description: ''
//   });

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const res = await API.get('/api/admin/products');
//       console.log('API Response:', res.data);
//       if (Array.isArray(res.data)) {
//         setProducts(res.data);
//       } else {
//         console.error("API response is not an array:", res.data);
//         setProducts([]);
//         setError("Invalid data format received from server");
//       }
//     } catch (err) {
//       console.error("Failed to fetch products", err);
//       console.error("Error details:", err.response?.data);
      
//       if (err.response?.status === 401) {
//         setError("Authentication failed. Please log in again.");
//       } else if (err.response?.status === 403) {
//         setError("Access denied. Admin privileges required.");
//       } else if (err.response?.status === 500) {
//         setError(`Server error: ${err.response?.data?.message || 'Internal server error'}`);
//       } else {
//         setError("Failed to fetch products. Please try again.");
//       }
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBrands = async () => {
//     try {
//       const { data } = await API.get('/api/admin/brands/all');
//       if (Array.isArray(data)) {
//         // Extract brandName from each brand object
//         const brandNames = data.map(brand => brand.brandName);
//         setBrands(brandNames);
//       } else {
//         console.error("Brands API response is not an array:", data);
//         setBrands([]);
//       }
//     } catch (err) {
//       console.error("Failed to fetch brands", err);
//       setError("Failed to fetch brands. Please try again.");
//     }
//   };

//   const filteredAndSortedProducts = useMemo(() => {
//     let filtered = products.filter(product => {
//       const searchString = searchTerm.toLowerCase();
//       return (
//         product.name?.toLowerCase().includes(searchString) ||
//         product.brand?.toLowerCase().includes(searchString) ||
//         product.category?.toLowerCase().includes(searchString) ||
//         product.product_id?.toLowerCase().includes(searchString) ||
//         (Array.isArray(product.tags) && product.tags.some(tag => tag.toLowerCase().includes(searchString)))
//       );
//     });

//     filtered.sort((a, b) => {
//       let aValue = a[sortBy];
//       let bValue = b[sortBy];

//       if (sortBy === 'rating' || sortBy === 'cost_price' || sortBy === 'retail_price' || sortBy === 'stock_quantity') {
//         aValue = parseFloat(aValue) || 0;
//         bValue = parseFloat(bValue) || 0;
//       } else if (sortBy === 'created_at') {
//         aValue = new Date(aValue || 0);
//         bValue = new Date(bValue || 0);
//       } else {
//         aValue = (aValue || '').toString().toLowerCase();
//         bValue = (bValue || '').toString().toLowerCase();
//       }

//       if (sortOrder === 'asc') {
//         return aValue > bValue ? 1 : -1;
//       } else {
//         return aValue < bValue ? 1 : -1;
//       }
//     });

//     return filtered;
//   }, [products, searchTerm, sortBy, sortOrder]);

//   const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, sortBy, sortOrder]);

//   const handleAddProduct = async (e) => {
//     e.preventDefault();
//     try {
//       const productData = {
//         ...formData,
//         tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
//         rating: parseFloat(formData.rating) || 0,
//         cost_price: parseFloat(formData.cost_price) || 0,
//         retail_price: parseFloat(formData.retail_price) || 0,
//         stock_quantity: parseInt(formData.stock_quantity) || 0,
//       };

//       const res = await API.post('/api/admin/products', productData);
//       const newProduct = res.data.product;
//       setProducts([...products, newProduct]);
//       setShowAddForm(false);
//       resetForm();
//     } catch (err) {
//       console.error("Failed to add product", err);
//       setError("Failed to add product. Please try again.");
//     }
//   };

//   const handleEditProduct = async (e) => {
//     e.preventDefault();
//     try {
//       const productData = {
//         ...formData,
//         tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
//         rating: parseFloat(formData.rating) || 0,
//         cost_price: parseFloat(formData.cost_price) || 0,
//         retail_price: parseFloat(formData.retail_price) || 0,
//         stock_quantity: parseInt(formData.stock_quantity) || 0,
//       };

//       const res = await API.put(`/api/admin/products/${editingProduct.product_id}`, productData);
//       const updatedProduct = res.data.product;
//       setProducts(products.map(p => 
//         p.product_id === editingProduct.product_id ? updatedProduct : p
//       ));
//       setEditingProduct(null);
//       resetForm();
//     } catch (err) {
//       console.error("Failed to update product", err);
//       setError("Failed to update product. Please try again.");
//     }
//   };

//   const deleteProduct = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this product?')) return;
    
//     try {
//       await API.delete(`/api/admin/products/${id}`);
//       setProducts(products.filter(p => p.product_id !== id));
//     } catch (err) {
//       console.error("Failed to delete product", err);
//       setError("Failed to delete product. Please try again.");
//     }
//   };

//   const startEdit = (product) => {
//     setEditingProduct(product);
//     setFormData({
//       product_id: product.product_id || '',
//       name: product.name || '',
//       brand: product.brand || '',
//       category: product.category || '',
//       tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
//       rating: product.rating || '',
//       cost_price: product.cost_price || '',
//       retail_price: product.retail_price || '',
//       stock_quantity: product.stock_quantity || '',
//       image_url: product.image_url || '',
//       description: product.description || ''
//     });
//     setShowAddForm(false);
//   };

//   const resetForm = () => {
//     setFormData({
//       product_id: '',
//       name: '',
//       brand: '',
//       category: '',
//       tags: '',
//       rating: '',
//       cost_price: '',
//       retail_price: '',
//       stock_quantity: '',
//       image_url: '',
//       description: ''
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const cancelEdit = () => {
//     setEditingProduct(null);
//     setShowAddForm(false);
//     resetForm();
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 !== 0;
    
//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
//     }
    
//     if (hasHalfStar) {
//       stars.push(<Star key="half" size={14} className="fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
//     }
    
//     const emptyStars = 5 - Math.ceil(rating);
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />);
//     }
    
//     return stars;
//   };

//   useEffect(() => {
//     fetchProducts();
//     fetchBrands();
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex items-center justify-center">
//           <div className="text-gray-500">Loading products...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="text-red-700">{error}</div>
//           <button 
//             onClick={fetchProducts}
//             className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-2">
//       <div className="mb-4 flex items-center justify-between m-2">
//         <div>
//           <h2 className="text-2xl font-bold" style={{ color: '#2C2B2A' }}>Manage Products</h2>
//         </div>
//         <button
//           onClick={() => {
//             setShowAddForm(true);
//             setEditingProduct(null);
//             resetForm();
//           }}
//           className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//           style={{ backgroundColor: '#8B5A7C' }}
//           onMouseOver={(e) => e.target.style.backgroundColor = '#7A4E6C'}
//           onMouseOut={(e) => e.target.style.backgroundColor = '#8B5A7C'}
//         >
//           <Plus size={16} />
//           Add Product
//         </button>
//       </div>

//       <div className="bg-white p-4 mb-2">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search products by name, brand, category, ID, or tags..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 transition-colors"
//               style={{ '--tw-ring-color': '#8B5A7C' }}
//               onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//               onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//             />
//           </div>
//           <div className="flex gap-2">
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 transition-colors"
//               style={{ '--tw-ring-color': '#8B5A7C' }}
//               onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//               onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//             >
//               <option value="name">Sort by Name</option>
//               <option value="brand">Sort by Brand</option>
//               <option value="category">Sort by Category</option>
//               <option value="retail_price">Sort by Price</option>
//               <option value="stock_quantity">Sort by Stock</option>
//               <option value="rating">Sort by Rating</option>
//               <option value="created_at">Sort by Date</option>
//             </select>
//             <button
//               onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
//               className="px-3 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
//               style={{ color: '#8B5A7C' }}
//             >
//               {sortOrder === 'asc' ? '↑' : '↓'}
//             </button>
//           </div>
//           <select
//             value={itemsPerPage}
//             onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
//             className="px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 transition-colors"
//             style={{ '--tw-ring-color': '#8B5A7C' }}
//             onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//             onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//           >
//             <option value={5}>5 per page</option>
//             <option value={10}>10 per page</option>
//             <option value={20}>20 per page</option>
//             <option value={50}>50 per page</option>
//           </select>
//         </div>
//       </div>

//       <div className="mt-3 ml-4 text-sm text-gray-600">
//         Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
//         {searchTerm && ` (filtered from ${products.length} total)`}
//       </div>

//       {(showAddForm || editingProduct) && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold" style={{ color: '#2C2B2A' }}>
//                 {editingProduct ? 'Edit Product' : 'Add New Product'}
//               </h3>
//               <button
//                 onClick={cancelEdit}
//                 className="text-gray-600 hover:text-gray-800"
//               >
//                 <XCircle size={24} />
//               </button>
//             </div>
//             <div className="rounded-lg p-6">
//               <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct}>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Product ID *
//                     </label>
//                     <input
//                       type="text"
//                       name="product_id"
//                       value={formData.product_id}
//                       onChange={handleInputChange}
//                       required
//                       disabled={editingProduct}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Product Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Brand *
//                     </label>
//                     <select
//                       name="brand"
//                       value={formData.brand}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     >
//                       <option value="">Select Brand</option>
//                       {brands.map((brandName) => (
//                         <option key={brandName} value={brandName}>{brandName}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Category *
//                     </label>
//                     <select
//                       name="category"
//                       value={formData.category}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     >
//                       <option value="">Select Category</option>
//                       <option value="Women">Women</option>
//                       <option value="Men">Men</option>
//                       <option value="Unisex">Unisex</option>
//                       <option value="Gifts">Gifts</option>
//                     </select>
//                   </div>
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Tags (comma-separated)
//                     </label>
//                     <input
//                       type="text"
//                       name="tags"
//                       value={formData.tags}
//                       onChange={handleInputChange}
//                       placeholder="e.g., perfume, floral, women"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Rating (0-5)
//                     </label>
//                     <input
//                       type="number"
//                       name="rating"
//                       value={formData.rating}
//                       onChange={handleInputChange}
//                       min="0"
//                       max="5"
//                       step="0.1"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Cost Price *
//                     </label>
//                     <input
//                       type="number"
//                       name="cost_price"
//                       value={formData.cost_price}
//                       onChange={handleInputChange}
//                       required
//                       step="0.01"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Retail Price *
//                     </label>
//                     <input
//                       type="number"
//                       name="retail_price"
//                       value={formData.retail_price}
//                       onChange={handleInputChange}
//                       required
//                       step="0.01"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Stock Quantity
//                     </label>
//                     <input
//                       type="number"
//                       name="stock_quantity"
//                       value={formData.stock_quantity}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                   <div className="md:col-span-3">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Image URL
//                     </label>
//                     <input
//                       type="url"
//                       name="image_url"
//                       value={formData.image_url}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                   <div className="md:col-span-3">
//                     <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
//                       Description
//                     </label>
//                     <textarea
//                       name="description"
//                       value={formData.description}
//                       onChange={handleInputChange}
//                       rows={2}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors resize-none"
//                       style={{ '--tw-ring-color': '#8B5A7C' }}
//                       onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
//                       onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex gap-2 mt-4 justify-end">
//                   <button
//                     type="submit"
//                     className="text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
//                     style={{ backgroundColor: '#8B5A7C' }}
//                     onMouseOver={(e) => e.target.style.backgroundColor = '#7A4E6C'}
//                     onMouseOut={(e) => e.target.style.backgroundColor = '#8B5A7C'}
//                   >
//                     <Save size={16} />
//                     {editingProduct ? 'Update Product' : 'Add Product'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {filteredAndSortedProducts.length === 0 ? (
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
//           <div className="text-gray-500">
//             {searchTerm ? 'No products found matching your search' : 'No products found'}
//           </div>
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm('')}
//               className="mt-2 text-blue-600 hover:text-blue-800"
//             >
//               Clear search
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Cost/Retail)</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {paginatedProducts.map(prod => (
//                 <tr 
//                   key={prod.product_id}
//                   className="hover:bg-gray-50 cursor-pointer"
//                   onClick={() => setSelectedProduct(prod)}
//                 >
//                   <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#2C2B2A' }}>
//                     {prod.product_id}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm font-medium" style={{ color: '#2C2B2A' }}>
//                     {prod.name}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#2C2B2A' }}>
//                     {prod.brand || 'N/A'}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#2C2B2A' }}>
//                     {prod.category || 'N/A'}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#8B5A7C' }}>
//                     ₹{prod.cost_price || 0} / ₹{prod.retail_price || 0}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#2C2B2A' }}>
//                     {prod.stock_quantity || 0}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <div className="flex items-center gap-1">
//                       {renderStars(prod.rating || 0)}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           startEdit(prod);
//                         }}
//                         className="text-blue-600 hover:text-blue-800"
//                         title="Edit"
//                       >
//                         <Edit2 size={16} />
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           deleteProduct(prod.product_id);
//                         }}
//                         className="text-red-600 hover:text-red-800"
//                         title="Delete"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {totalPages > 1 && (
//         <div className="flex items-center justify-between mt-6">
//           <button
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center gap-2"
//             style={{ color: '#8B5A7C' }}
//           >
//             <ChevronLeft size={16} />
//             Previous
//           </button>
//           <div className="text-sm text-gray-600">
//             Page {currentPage} of {totalPages}
//           </div>
//           <button
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center gap-2"
//             style={{ color: '#8B5A7C' }}
//           >
//             Next
//             <ChevronRight size={16} />
//           </button>
//         </div>
//       )}

//       {selectedProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-semibold" style={{ color: '#2C2B2A' }}>
//                 {selectedProduct.name}
//               </h3>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => {
//                     setSelectedProduct(null);
//                     startEdit(selectedProduct);
//                   }}
//                   className="text-blue-600 hover:text-blue-800"
//                   title="Edit"
//                 >
//                   <Edit2 size={20} />
//                 </button>
//                 <button
//                   onClick={() => setSelectedProduct(null)}
//                   className="text-gray-600 hover:text-gray-800"
//                 >
//                   <XCircle size={24} />
//                 </button>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="flex flex-col">
//                 {selectedProduct.image_url ? (
//                   <img
//                     src={selectedProduct.image_url}
//                     alt={selectedProduct.name}
//                     className="w-full h-48 object-cover rounded-lg shadow-sm"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                     }}
//                   />
//                 ) : (
//                   <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
//                     <span className="text-gray-400">No Image Available</span>
//                   </div>
//                 )}
//                 <div className="mt-4">
//                   <h4 className="text-sm font-medium text-gray-500">Description</h4>
//                   <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.description || 'No description available'}</p>
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500">Product ID</h4>
//                   <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.product_id}</p>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500">Brand</h4>
//                   <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.brand || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500">Category</h4>
//                   <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.category || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500">Tags</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {Array.isArray(selectedProduct.tags) && selectedProduct.tags.length > 0 ? (
//                       selectedProduct.tags.map((tag, index) => (
//                         <span
//                           key={index}
//                           className="text-xs px-2 py-1 bg-gray-100 rounded-full"
//                           style={{ color: '#2C2B2A' }}
//                         >
//                           {tag}
//                         </span>
//                       ))
//                     ) : (
//                       <span className="text-xs text-gray-400">No tags</span>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500">Rating</h4>
//                   <div className="flex items-center gap-1">{renderStars(selectedProduct.rating || 0)}</div>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500">Pricing</h4>
//                   <p className="text-sm" style={{ color: '#2C2B2A' }}>
//                     Cost: ₹{selectedProduct.cost_price || 0} / Retail: ₹{selectedProduct.retail_price || 0}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Margin: {selectedProduct.cost_price && selectedProduct.retail_price ? 
//                       Math.round(((selectedProduct.retail_price - selectedProduct.cost_price) / selectedProduct.retail_price) * 100) : 0}%
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500">Stock Quantity</h4>
//                   <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.stock_quantity || 0}</p>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500">Created At</h4>
//                   <p className="text-sm" style={{ color: '#2C2B2A' }}>{formatDate(selectedProduct.created_at)}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageProducts;

import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, Star, Search, ChevronLeft, ChevronRight, XCircle, Upload } from 'lucide-react';
import * as XLSX from 'xlsx'; // Import xlsx for Excel file handling
import API from '../../api';

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
  
  // New state for file upload
  const [file, setFile] = useState(null);

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
      console.log('API Response:', res.data);
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

  // New function to handle Excel file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel file to upload.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate that we have exactly 10 products
        if (jsonData.length !== 10) {
          setError("Excel file must contain exactly 10 products.");
          return;
        }

        // Validate required fields and format data
        const formattedProducts = jsonData.map((row) => {
          if (!row.product_id || !row.name || !row.brand || !row.category || !row.cost_price || !row.retail_price) {
            throw new Error("Missing required fields in one or more products.");
          }

          return {
            product_id: row.product_id.toString(),
            name: row.name,
            brand: row.brand,
            category: row.category,
            tags: row.tags ? row.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            rating: parseFloat(row.rating) || 0,
            cost_price: parseFloat(row.cost_price) || 0,
            retail_price: parseFloat(row.retail_price) || 0,
            stock_quantity: parseInt(row.stock_quantity) || 0,
            image_url: row.image_url || '',
            description: row.description || ''
          };
        });

        // Send bulk product data to the API
        try {
          const res = await API.post('/api/admin/bulkupload', { products: formattedProducts });
          const newProducts = res.data.products || formattedProducts;
          setProducts([...products, ...newProducts]);
          setFile(null); // Reset file input
          setError(null);
          fetchProducts(); // Refresh product list
        } catch (err) {
          console.error("Failed to add products from Excel", err);
          setError("Failed to add products from Excel. Please check the file format and try again.");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error processing Excel file", err);
      setError(err.message || "Error processing Excel file. Please try again.");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        rating: parseFloat(formData.rating) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        retail_price: parseFloat(formData.retail_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
      };

      const res = await API.post('/api/admin/products', productData);
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
      const productData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        rating: parseFloat(formData.rating) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        retail_price: parseFloat(formData.retail_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
      };

      const res = await API.put(`/api/admin/products/${editingProduct.product_id}`, productData);
      const updatedProduct = res.data.product;
      setProducts(products.map(p => 
        p.product_id === editingProduct.product_id ? updatedProduct : p
      ));
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
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">{error}</div>
          <button 
            onClick={fetchProducts}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="mb-4 flex items-center justify-between m-2">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#2C2B2A' }}>Manage Products</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingProduct(null);
              resetForm();
            }}
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            style={{ backgroundColor: '#8B5A7C' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#7A4E6C'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#8B5A7C'}
          >
            <Plus size={16} />
            Add Product
          </button>
          <form onSubmit={handleFileUpload} className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <button
              type="submit"
              className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              style={{ backgroundColor: '#8B5A7C' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#7A4E6C'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#8B5A7C'}
            >
              <Upload size={16} />
              Upload Excel
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white p-4 mb-2">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name, brand, category, ID, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 transition-colors"
              style={{ '--tw-ring-color': '#8B5A7C' }}
              onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 transition-colors"
              style={{ '--tw-ring-color': '#8B5A7C' }}
              onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
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
              className="px-3 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              style={{ color: '#8B5A7C' }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 transition-colors"
            style={{ '--tw-ring-color': '#8B5A7C' }}
            onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      <div className="mt-3 ml-4 text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
        {searchTerm && ` (filtered from ${products.length} total)`}
      </div>

      {(showAddForm || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#2C2B2A' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={cancelEdit}
                className="text-gray-600 hover:text-gray-800"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="rounded-lg p-6">
              <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Product ID *
                    </label>
                    <input
                      type="text"
                      name="product_id"
                      value={formData.product_id}
                      onChange={handleInputChange}
                      required
                      disabled={editingProduct}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Brand *
                    </label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brandName) => (
                        <option key={brandName} value={brandName}>{brandName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    >
                      <option value="">Select Category</option>
                      <option value="Women">Women</option>
                      <option value="Men">Men</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Gifts">Gifts</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g., perfume, floral, women"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Cost Price *
                    </label>
                    <input
                      type="number"
                      name="cost_price"
                      value={formData.cost_price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Retail Price *
                    </label>
                    <input
                      type="number"
                      name="retail_price"
                      value={formData.retail_price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2C2B2A' }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors resize-none"
                      style={{ '--tw-ring-color': '#8B5A7C' }}
                      onFocus={(e) => e.target.style.borderColor = '#8B5A7C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                  <button
                    type="submit"
                    className="text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                    style={{ backgroundColor: '#8B5A7C' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#7A4E6C'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#8B5A7C'}
                  >
                    <Save size={16} />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500">
            {searchTerm ? 'No products found matching your search' : 'No products found'}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Cost/Retail)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map(prod => (
                <tr 
                  key={prod.product_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedProduct(prod)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#2C2B2A' }}>
                    {prod.product_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium" style={{ color: '#2C2B2A' }}>
                    {prod.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#2C2B2A' }}>
                    {prod.brand || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#2C2B2A' }}>
                    {prod.category || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#8B5A7C' }}>
                    ₹{prod.cost_price || 0} / ₹{prod.retail_price || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#2C2B2A' }}>
                    {prod.stock_quantity || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {renderStars(prod.rating || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(prod);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProduct(prod.product_id);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center gap-2"
            style={{ color: '#8B5A7C' }}
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
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center gap-2"
            style={{ color: '#8B5A7C' }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold" style={{ color: '#2C2B2A' }}>
                {selectedProduct.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    startEdit(selectedProduct);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image Available</span>
                  </div>
                )}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.description || 'No description available'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Product ID</h4>
                  <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.product_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Brand</h4>
                  <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.brand || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.category || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedProduct.tags) && selectedProduct.tags.length > 0 ? (
                      selectedProduct.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                          style={{ color: '#2C2B2A' }}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No tags</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                  <div className="flex items-center gap-1">{renderStars(selectedProduct.rating || 0)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Pricing</h4>
                  <p className="text-sm" style={{ color: '#2C2B2A' }}>
                    Cost: ₹{selectedProduct.cost_price || 0} / Retail: ₹{selectedProduct.retail_price || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    Margin: {selectedProduct.cost_price && selectedProduct.retail_price ? 
                      Math.round(((selectedProduct.retail_price - selectedProduct.cost_price) / selectedProduct.retail_price) * 100) : 0}%
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Stock Quantity</h4>
                  <p className="text-sm" style={{ color: '#2C2B2A' }}>{selectedProduct.stock_quantity || 0}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                  <p className="text-sm" style={{ color: '#2C2B2A' }}>{formatDate(selectedProduct.created_at)}</p>
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