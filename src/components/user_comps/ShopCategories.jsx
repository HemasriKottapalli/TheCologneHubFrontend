import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiWomenLine, RiMenLine, RiGiftLine } from 'react-icons/ri';
import { HiOutlineSparkles, HiArrowRight } from 'react-icons/hi';

// Updated categories to match your requirements (womens, mens, unisex, gifts)
const categories = [
  {
    id: 'womens',
    title: "Women's",
    description: "Elegant & feminine fragrances that capture grace and sophistication",
    icon: <RiWomenLine />,
    count: '120+',
    bgGradient: 'from-pink-500/20 via-rose-500/20 to-red-500/20',
    hoverGradient: 'from-pink-500 via-rose-500 to-red-500',
    image: 'https://wallpapercave.com/wp/wp11308717.jpg',
    features: ['Floral', 'Fruity', 'Oriental'],
    // Map to actual category values in your database
    categoryFilter: 'Women' // Adjust this to match your actual category names
  },
  {
    id: 'mens',
    title: "Men's", 
    description: "Bold & masculine scents that embody strength and confidence",
    icon: <RiMenLine />,
    count: '85+',
    bgGradient: 'from-blue-600/20 via-indigo-600/20 to-purple-600/20',
    hoverGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    image: 'https://tse4.mm.bing.net/th/id/OIP.KRSaWCoDbfT9lQxZx98mFwAAAA?pid=ImgDet&w=191&h=126&c=7&o=7&rm=3',
    features: ['Woody', 'Spicy', 'Fresh'],
    categoryFilter: 'Men' // Adjust this to match your actual category names
  },
  {
    id: 'unisex',
    title: "Unisex",
    description: "Versatile fragrances for everyone, breaking traditional boundaries",
    icon: <HiOutlineSparkles />,
    count: '60+',
    bgGradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
    hoverGradient: 'from-amber-500 via-orange-500 to-yellow-500',
    image: 'https://wuilt-assets-v2-dev.s3.amazonaws.com/clkbs72o30k0701h23ds46opa_clkbs2gr50jzz01h2964ih7fo_IMG_7092.JPG',
    features: ['Citrus', 'Unisex', 'Modern'],
    categoryFilter: 'Unisex' // Adjust this to match your actual category names
  },
  {
    id: 'gifts',
    title: "Gifts",
    description: "Perfect fragrance gift sets and collections for every special occasion",
    icon: <RiGiftLine />,
    count: '45+',
    bgGradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
    hoverGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    image: 'https://tse4.mm.bing.net/th/id/OIP._rDUQAwQBygUplS6GrXxaQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
    features: ['Gift Sets', 'Limited Edition', 'Luxury'],
    categoryFilter: 'Gifts' // Adjust this to match your actual category names
  }
];

function ShopCategories() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  // Handle category navigation with filter applied
  const handleCategoryClick = (category) => {
    // Navigate to shop page with category filter as URL parameter
    navigate(`/shop?category=${encodeURIComponent(category.categoryFilter)}`);
  };

  return (
    <div className="w-full bg-light-bg-6 px-4 py-12 md:px-10 lg:px-20">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Explore Categories</h2>
        <div className="w-20 h-1 bg-[#8B5A7C] mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto pb-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative overflow-hidden rounded-2xl shadow-lg transition-shadow duration-500 hover:shadow-2xl cursor-pointer"
            onMouseEnter={() => setHoveredCard(category.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCategoryClick(category)}
          >
            <div className="relative h-72 sm:h-64 lg:h-80 rounded-2xl overflow-hidden">
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-800 ease-out transform-gpu group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/25 to-black/10 group-hover:from-black/30 group-hover:to-black/20 transition-colors duration-500"></div>
              <div
                className={`absolute inset-0 rounded-2xl p-[1px] transition-opacity duration-500 ${
                  hoveredCard === category.id ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: hoveredCard === category.id
                    ? `linear-gradient(to right, ${category.hoverGradient.replace('/20','')})`
                    : 'none',
                }}
              >
                <div className="w-full h-full bg-black/20 rounded-2xl"></div>
              </div>
            </div>

            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white rounded-2xl pointer-events-none">
              <div className="flex justify-between items-start">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-white/50 text-white text-xl backdrop-blur-sm transition-transform duration-500 ${
                    hoveredCard === category.id
                      ? 'scale-110 border-white'
                      : ''
                  }`}
                >
                  {category.icon}
                </div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/30">
                  {category.count} Products
                </span>
              </div>

              <div className="space-y-3 pointer-events-auto">
                <div className="flex flex-wrap gap-1">
                  {category.features.map((f, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 text-xs bg-white/20 rounded-full border border-white/30 transition-opacity duration-300 ${
                        hoveredCard === category.id ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ transitionDelay: hoveredCard === category.id ? `${idx * 100}ms` : '0ms' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <h3
                  className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 transition-colors duration-500 ${
                    hoveredCard === category.id ? 'text-yellow-200' : 'text-white'
                  }`}
                >
                  {category.title}
                </h3>

                <p
                  className={`text-sm text-gray-200 transition-opacity duration-500 ${
                    hoveredCard === category.id ? 'opacity-100' : 'opacity-80'
                  }`}
                >
                  {category.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <button 
                    className="flex items-center gap-2 text-sm font-semibold transition-gap duration-500 group/btn pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category);
                    }}
                  >
                    <span>Explore Collection</span>
                    <HiArrowRight className="transition-transform duration-500 group-hover/btn:translate-x-1" />
                  </button>
                  <div
                    className={`h-0.5 bg-white rounded-full transition-all duration-500 ${
                      hoveredCard === category.id ? 'w-8' : 'w-0'
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none rounded-2xl">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={`absolute block w-2 h-2 bg-white/30 rounded-full transition-opacity duration-500 ${
                    hoveredCard === category.id ? 'opacity-100 animate-pulse' : 'opacity-0'
                  }`}
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${15 + i * 20}%`,
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopCategories;