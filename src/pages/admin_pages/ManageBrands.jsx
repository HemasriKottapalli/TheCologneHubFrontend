import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, XCircle, Search, Slack } from 'lucide-react';
import API from '../../api';

export default function ManageBrands() {
  /* ---------- state ---------- */
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  /* ---------- effect: fetch all brands on mount ---------- */
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/api/admin/brands/all');
      // map backend -> frontend field names
      const mapped = data.map((b) => ({
        id: b._id || b.id,
        name: b.brandName ?? b.name,
      }));
      setBrands(mapped);
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- CRUD helpers ---------- */
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Brand name is required');
      return;
    }
    setLoading(true);
    try {
      const body = { brandName: formData.name.trim() };
      const { data } = await API.post('/api/admin/brands/', body);
      setBrands([
        ...brands,
        {
          id: data.brand._id || data.brand.id,
          name: data.brand.brandName ?? data.brand.name,
        },
      ]);
      resetForm();
    } catch (err) {
      console.error('Add failed:', err.response?.data || err.message);
      alert(`Failed to add brand: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBrand = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Brand name is required');
      return;
    }
    setLoading(true);
    try {
      const body = { brandName: formData.name.trim() };
      const { data } = await API.put(`/api/admin/brands/${editingBrand.id}`, body);
      setBrands(
        brands.map((b) =>
          b.id === editingBrand.id
            ? {
                ...b,
                name: data.brand.brandName ?? data.brand.name,
              }
            : b
        )
      );
      resetForm();
    } catch (err) {
      console.error('Update failed:', err.response?.data || err.message);
      alert(`Failed to update brand: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    setLoading(true);
    try {
      await API.delete(`/api/admin/brands/${id}`);
      setBrands(brands.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      alert(`Failed to delete brand: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- helpers ---------- */
  const startEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name });
    setShowAddForm(false);
  };

  const cancelEdit = () => resetForm();

  const resetForm = () => {
    setEditingBrand(null);
    setShowAddForm(false);
    setFormData({ name: '' });
  };

  /* ---------- derived list ---------- */
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Brands</h3>
              <p className="text-3xl font-bold text-[#8B5A7C] mt-1">{brands.length}</p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingBrand(null);
                setFormData({ name: '' });
              }}
              disabled={loading}
              className="bg-[#8B5A7C] hover:bg-[#7A4E6C] text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Add New Brand
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className=" p-6 mb-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search brands by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#8B5A7C] focus:border-[#8B5A7C] transition-colors"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 text-sm"
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredBrands.length} of {brands.length} brands
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>

        {/* Modal (add / edit) */}
        {(showAddForm || editingBrand) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                  </h3>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (editingBrand) {
                            handleEditBrand(e);
                          } else {
                            handleAddBrand(e);
                          }
                        }
                      }}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A7C] focus:border-[#8B5A7C] transition-colors"
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div className="flex ">
                
                    <button
                      type="button"
                      onClick={editingBrand ? handleEditBrand : handleAddBrand}
                      disabled={loading}
                      className="flex-1 bg-[#8B5A7C] hover:bg-[#7A4E6C] text-white px-3 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={16} />
                      {loading ? 'Saving...' : editingBrand ? 'Update' : 'Add Brand'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brands List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading && brands.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading brands...</div>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="p-8 text-center">
              <Slack size={48} className="mx-auto text-gray-300 mb-4" />
              <div className="text-gray-500 mb-2">
                {searchTerm ? 'No brands found matching your search' : 'No brands found'}
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[#8B5A7C] hover:text-[#7A4E6C] text-sm"
                >
                  Clear search to see all brands
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-10">
                    <span className="text-sm font-medium text-gray-700">Brand Name</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">Actions</span>
                  </div>
                </div>
              </div>
              
              {/* Brands */}
              <div className="divide-y divide-gray-200">
                {filteredBrands.map((brand, index) => (
                  <div
                    key={brand.id}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#8B5A7C] bg-opacity-10 rounded-lg flex items-center justify-center">
                            <span className="text-[#8B5A7C] font-semibold text-sm">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{brand.name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(brand)}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-[#8B5A7C] hover:bg-[#8B5A7C] hover:bg-opacity-10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit brand"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete brand"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}