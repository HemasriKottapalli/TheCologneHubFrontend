import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import FilterSidebar from '../../components/user_comps/FilterSidebar';
import ProductGrid from '../../components/user_comps/ProductGrid';
import SearchBar from '../../components/user_comps/SearchBar';
import API from '../../api';

function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL parameters handling
  const [searchParams, setSearchParams] = useSearchParams();

  // Calculate dynamic price range - moved to a single place
  const priceRange = useMemo(() => {
    if (products.length === 0) return [0, 5000];
    const prices = products
      .map(p => p.retail_price)
      .filter(price => typeof price === 'number' && !isNaN(price));
    if (prices.length === 0) return [0, 5000];
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  // Initialize filters with empty/default values - removed isNew and onSale
  const getInitialFilters = () => ({
    categories: [],
    brands: [],
    priceRange: [0, 5000], // Will be updated when products load
    rating: 0
  });

  const [filters, setFilters] = useState(getInitialFilters());

  // Removed 'special' from accordion states since we don't need it anymore
  const [accordionStates, setAccordionStates] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: true
  });

  // Apply URL parameter filters when component mounts or URL changes
  useEffect(() => {
    const categoryFromURL = searchParams.get('category');
    
    if (categoryFromURL && products.length > 0) {
      // Check if the category exists in our products
      const availableCategories = [...new Set(products.map(p => p.category))];
      const decodedCategory = decodeURIComponent(categoryFromURL);
      
      if (availableCategories.includes(decodedCategory)) {
        setFilters(prev => ({
          ...prev,
          categories: [decodedCategory]
        }));
      }
    }
  }, [searchParams, products]);

  // Update filters.priceRange when priceRange changes (only when products load)
  useEffect(() => {
    if (products.length > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [priceRange[0], priceRange[1]]
      }));
    }
  }, [priceRange, products.length]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(savedWishlist);
  }, []);

  // Save wishlist to localStorage on change
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get('/api/customer/products');
        console.log(res);
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (error) {
        console.error("Error fetching products", error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch products');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and filters using useMemo - removed isNew and onSale filters
  const filtered = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => filters.brands.includes(product.brand));
    }

    // Use retail_price instead of price
    filtered = filtered.filter(product =>
      product.retail_price >= filters.priceRange[0] && product.retail_price <= filters.priceRange[1]
    );

    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    return filtered;
  }, [products, filters, searchTerm]);

  useEffect(() => {
    setFilteredProducts(filtered);
  }, [filtered]);

  // Handle sorting - updated to use correct field names
  const handleSortChange = (sortType) => {
    let sortedProducts = [...filteredProducts];
    switch (sortType) {
      case 'priceLow':
        sortedProducts.sort((a, b) => a.retail_price - b.retail_price);
        break;
      case 'priceHigh':
        sortedProducts.sort((a, b) => b.retail_price - a.retail_price);
        break;
      case 'ratingHigh':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'brandAZ':
        sortedProducts.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      case 'nameAZ':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    setFilteredProducts(sortedProducts);
  };

  // Updated handleFilterChange - removed isNew and onSale handling
  const handleFilterChange = (filterType, value, checked) => {
    setFilters(prev => {
      const newFilters = { ...prev };

      if (filterType === 'categories' || filterType === 'brands') {
        if (checked) {
          newFilters[filterType] = [...prev[filterType], value];
        } else {
          newFilters[filterType] = prev[filterType].filter(item => item !== value);
        }
      } else if (filterType === 'priceRange') {
        newFilters[filterType] = value;
      } else if (filterType === 'rating') {
        newFilters[filterType] = value;
      }

      return newFilters;
    });

    // Update URL parameters when filters change
    updateURLParams(filterType, value, checked);
  };

  // Function to update URL parameters
  const updateURLParams = (filterType, value, checked) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (filterType === 'categories') {
      if (checked) {
        // If adding a category, update the URL parameter
        newSearchParams.set('category', value);
      } else {
        // If removing a category, check if there are other categories selected
        const otherCategories = filters.categories.filter(cat => cat !== value);
        if (otherCategories.length > 0) {
          newSearchParams.set('category', otherCategories[0]);
        } else {
          newSearchParams.delete('category');
        }
      }
      setSearchParams(newSearchParams);
    }
  };

  // Updated clear filters function - removed isNew and onSale reset
  const handleClearFilters = () => {
    console.log('Clearing filters...');
    
    setFilters({
      categories: [],
      brands: [],
      priceRange: [priceRange[0], priceRange[1]], // Reset to current full range
      rating: 0
    });
    
    setSearchTerm('');
    
    // Clear URL parameters
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
    
    // Close mobile sidebar after clearing
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleToggleAccordion = (section) => {
    setAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Use product_id for wishlist toggle
  const handleToggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleRetry = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/customer/products');
      setProducts(res.data);
      setFilteredProducts(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Show active category filter in header
  const activeCategoryFilter = filters.categories.length > 0 ? filters.categories[0] : null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error loading products</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14 items-center">
            {/* Show active category filter */}
            {activeCategoryFilter && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <span className="bg-[#8B5A7C] text-white text-xs px-2 py-1 rounded-full">
                  {activeCategoryFilter}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-label="Toggle filter sidebar"
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show active category filter on desktop */}
        {activeCategoryFilter && (
          <div className="hidden lg:block mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Showing products for category:</span>
                <span className="bg-[#8B5A7C] text-white text-sm px-3 py-1 rounded-full font-medium">
                  {activeCategoryFilter}
                </span>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-sm text-[#8B5A7C] hover:text-[#8B5A7C]/80 font-medium"
              >
                View All Categories
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <div
            className={`
              hidden lg:block w-60
              sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto
            `}
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              products={products}
              priceRange={priceRange}
              accordionStates={accordionStates}
              onToggleAccordion={handleToggleAccordion}
              isSidebarOpen={isSidebarOpen}
              onCloseSidebar={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} onSortChange={handleSortChange} />
            </div>

            <ProductGrid
              products={filteredProducts}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={`
            fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden
            transition-opacity duration-300 ease-in-out
            ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:hidden
        `}
      >
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          products={products}
          priceRange={priceRange}
          accordionStates={accordionStates}
          onToggleAccordion={handleToggleAccordion}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}

export default Shop;