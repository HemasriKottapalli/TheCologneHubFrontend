import { useMemo } from 'react';
import { AiOutlineFilter } from 'react-icons/ai';
import { FaStar, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';

function FilterSidebar({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  products, 
  priceRange, // Now received as prop to avoid duplication
  accordionStates, 
  onToggleAccordion,
  onCloseSidebar
}) {
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const brands = useMemo(() => [...new Set(products.map(p => p.brand))], [products]);

  // Updated activeFiltersCount - removed isNew and onSale counting
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    // Categories filter
    if (filters.categories.length > 0) count++;
    
    // Brands filter  
    if (filters.brands.length > 0) count++;
    
    // Price range filter - only count if it's actually restricted
    const tolerance = 0.01;
    const isPriceRangeModified = 
      Math.abs(filters.priceRange[0] - priceRange[0]) > tolerance || 
      Math.abs(filters.priceRange[1] - priceRange[1]) > tolerance;
    
    if (isPriceRangeModified) count++;
    
    // Rating filter
    if (filters.rating > 0) count++;
    
    return count;
  }, [filters, priceRange]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400 text-xs" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStar key="half-star" className="text-yellow-400 text-xs opacity-50" />);
    }
    
    return stars;
  };

  return (
    <div className="w-full h-full">
      {/* Filters Content */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AiOutlineFilter className="text-[#8B5A7C]" />
            Filters
          </h2>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <span className="bg-[#8B5A7C] text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-[#8B5A7C] transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onCloseSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-700"
              aria-label="Close filter sidebar"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        
        {/* Categories Filter */}
        <div className="space-y-3">
          <button
            onClick={() => onToggleAccordion('categories')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900"
          >
            <span>Categories</span>
            {accordionStates.categories ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
          </button>
          
          {accordionStates.categories && (
            <div className="space-y-2 pl-2">
              {categories.map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => onFilterChange('categories', category, e.target.checked)}
                    className="w-4 h-4 text-[#8B5A7C] border-gray-300 rounded focus:ring-2 focus:ring-[#8B5A7C] accent-[#8B5A7C]"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    ({products.filter(p => p.category === category).length})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Brands Filter */}
        <div className="space-y-3">
          <button
            onClick={() => onToggleAccordion('brands')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900"
          >
            <span>Brands</span>
            {accordionStates.brands ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
          </button>
          
          {accordionStates.brands && (
            <div className="space-y-2 pl-2 max-h-48 overflow-y-auto">
              {brands.map(brand => (
                <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => onFilterChange('brands', brand, e.target.checked)}
                    className="w-4 h-4 text-[#8B5A7C] border-gray-300 rounded focus:ring-2 focus:ring-[#8B5A7C] accent-[#8B5A7C]"
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    ({products.filter(p => p.brand === brand).length})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <button
            onClick={() => onToggleAccordion('price')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900"
          >
            <span>Price Range</span>
            {accordionStates.price ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
          </button>
          
          {accordionStates.price && (
            <div className="space-y-4 pl-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    onFilterChange('priceRange', [isNaN(value) ? priceRange[0] : value, filters.priceRange[1]]);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-[#8B5A7C]"
                />
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    onFilterChange('priceRange', [filters.priceRange[0], isNaN(value) ? priceRange[1] : value]);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-[#8B5A7C]"
                />
              </div>
              
              <div className="flex gap-2">
                <input
                  type="number"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    onFilterChange('priceRange', [isNaN(value) ? priceRange[0] : value, filters.priceRange[1]]);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#8B5A7C] focus:border-[#8B5A7C]"
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    onFilterChange('priceRange', [filters.priceRange[0], isNaN(value) ? priceRange[1] : value]);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#8B5A7C] focus:border-[#8B5A7C]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <button
            onClick={() => onToggleAccordion('rating')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900"
          >
            <span>Minimum Rating</span>
            {accordionStates.rating ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
          </button>
          
          {accordionStates.rating && (
            <div className="space-y-2 pl-2">
              {[4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === rating}
                    onChange={() => onFilterChange('rating', rating)}
                    className="w-4 h-4 text-[#8B5A7C] border-gray-300 focus:ring-2 focus:ring-[#8B5A7C] accent-[#8B5A7C]"
                  />
                  <div className="flex items-center gap-1">
                    {renderStars(rating)}
                    <span className="text-sm text-gray-700 ml-1">& up</span>
                  </div>
                </label>
              ))}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === 0}
                  onChange={() => onFilterChange('rating', 0)}
                  className="w-4 h-4 text-[#8B5A7C] border-gray-300 focus:ring-2 focus:ring-[#8B5A7C] accent-[#8B5A7C]"
                />
                <span className="text-sm text-gray-700">Any Rating</span>
              </label>
            </div>
          )}
        </div>

        {/* Removed Special Offers Filter section completely */}

      </div>
    </div>
  );
}

export default FilterSidebar;