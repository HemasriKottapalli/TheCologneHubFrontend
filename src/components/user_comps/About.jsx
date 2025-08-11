import { FaFacebookF, FaInstagram, FaShippingFast } from "react-icons/fa";
import { CiLinkedin } from "react-icons/ci";
import { GiPerfumeBottle } from "react-icons/gi";
import { FiLock } from "react-icons/fi";
import { TbCurrencyDollarSingapore } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Free Shipping Over $35',
    description: 'Enjoy complimentary delivery on all orders above $35.',
    icon: <TbCurrencyDollarSingapore />
  },
  {
    title: '100% Secure Payments',
    description: 'Your data and payments are protected with top-tier encryption.',
    icon: <FiLock />
  },
  {
    title: 'Swift & Reliable Delivery',
    description: 'Get your favorite scents delivered in no time.',
    icon: <FaShippingFast />
  },
  {
    title: '100% Authentic Perfumes',
    description: 'Only genuine, brand-certified fragrances.',
    icon: <GiPerfumeBottle />
  }
];

function About() {

  const navigate = useNavigate();

  const handleShopNavigation = () => {
    navigate('/shop');
    window.scrollTo(0,0);
  }

  return (
    <section className='w-full bg-light-bg-4 px-4 py-10 md:px-10 lg:px-20'>
      
      {/* Header */}
      <div className='text-center mb-10'>
        <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-3'>
          Why Shop With The Cologne Hub?
        </h2>
        <p className='text-gray-600 max-w-2xl mx-auto text-sm md:text-base'>
          We go beyond fragrance – experience luxury, trust, and style, all in one place.
        </p>
        <div className='w-20 h-1 bg-main-color mx-auto mt-4 rounded-full'></div>
      </div>

      {/* Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto'>

        {/* Features */}
        <div className='grid grid-cols-2 gap-5'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center text-center'
            >
              <div className='text-main-color text-3xl p-3 border border-main-color rounded-full mb-4'>
                {feature.icon}
              </div>
              <h3 className='text-lg font-semibold mb-2'>{feature.title}</h3>
              <p className='text-sm text-gray-600'>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Brand Story */}
        <div className='flex flex-col justify-center'>
          <h3 className='text-xl md:text-2xl font-semibold text-gray-900 mb-4 leading-snug'>
            Experience the Essence of Luxury with <span className='text-main-color'>The Cologne Hub</span>
          </h3>
          <p className='text-gray-700 text-sm md:text-base mb-3'>
            At Cologne Hub, we believe luxury shouldn't come at a high price. That's why we deliver globally-loved perfumes that are 100% authentic, affordable, and delivered with care.
          </p>
          <p className='text-gray-700 text-sm md:text-base mb-5'>
            Whether you're seeking your next signature scent or searching for the perfect gift, The Cologne Hub makes it effortless and elegant.
          </p>
          <button 
          onClick = {handleShopNavigation}
          className='w-fit px-6 py-2 border border-main-color text-main-color rounded-lg hover:bg-main-color hover:text-white transition duration-300'>
            Explore Our Collection
          </button>

          {/* Social Media */}
          <div className='mt-6'>
            <p className='text-gray-600 text-sm mb-2'>Follow us on</p>
            <div className='flex gap-3'>
              <a
                href='#'
                aria-label='Facebook'
                className='p-2 border border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition'
              >
                <FaFacebookF />
              </a>
              <a
                href='#'
                aria-label='Instagram'
                className='p-2 border border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition'
              >
                <FaInstagram />
              </a>
              <a
                href='#'
                aria-label='LinkedIn'
                className='p-2 border border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition'
              >
                <CiLinkedin />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
