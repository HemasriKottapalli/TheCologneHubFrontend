import { useState } from 'react';
import { AiOutlineSearch, AiOutlineClose, AiOutlineDown } from 'react-icons/ai';

function SearchBar({
  onSearch,
  onSortChange,
  placeholder = "Search products, brands, or categories..."
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSortSelect = (value) => {
    setIsSortOpen(false);
    onSortChange?.(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex items-center gap-4 relative">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <div className="relative">
          <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#8B5A7C] focus:border-[#8B5A7C] outline-none text-sm bg-white shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <AiOutlineClose className="text-lg" />
            </button>
          )}
        </div>

        {/* Search Suggestion Box */}
        {searchTerm && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
            <div className="p-3 text-sm text-gray-500">
              Press Enter to search for "{searchTerm}"
            </div>
          </div>
        )}
      </form>

      {/* Sort Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setIsSortOpen(true)}
        onMouseLeave={() => setIsSortOpen(false)}
      >
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white text-sm shadow-sm hover:bg-gray-50 transition"
        >
          Sort <AiOutlineDown className="text-sm" />
        </button>

        {isSortOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            {[
              { label: 'Price: Low to High', value: 'priceLow' },
              { label: 'Price: High to Low', value: 'priceHigh' },
              { label: 'Rating: High to Low', value: 'ratingHigh' },
              { label: 'Brand: A to Z', value: 'brandAZ' },
              { label: 'New Arrivals', value: 'new' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-main-color hover:bg-gray-100 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
