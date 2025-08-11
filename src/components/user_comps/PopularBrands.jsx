import { useEffect, useState } from 'react';
import API from '../../api';

const PopularBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await API.get('/api/customer/brands/popular');
        setBrands(response.data);
      } catch (err) {
        console.error('Frontend error fetching brands:', err);
        setError(err.response?.data?.message || 'Failed to fetch brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) return <p className="text-center py-6 text-gray-600">Loading...</p>;
  if (error) return <p className="text-center py-6 text-red-500">{error}</p>;

  return (
    <>
      {brands.length > 0 && (
        <section className="w-full bg-light-bg-4 px-4 py-10 md:px-10 lg:px-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Popular Brands We Carry
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
              Discover some of the most loved perfume brands curated just for you.
            </p>
            <div className="w-20 h-1 bg-main-color mx-auto mt-4 rounded-full"></div>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {brands.map((brand) => (
              <li
                key={brand._id}
                className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-md transition duration-300"
              >
                <p className="text-base md:text-lg font-semibold text-gray-800">{brand.brandName}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

export default PopularBrands;
 