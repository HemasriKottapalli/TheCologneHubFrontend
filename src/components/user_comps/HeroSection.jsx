import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import img from '../../assets/img.png'
 
function HeroSection() {
   const [username, setUsername] = useState('');
   const navigate = useNavigate();
 
   useEffect(() => {
    function updateUsername(){
        try{
          const username = localStorage.getItem('username');
          setUsername(username);
        }catch (err){
          console.log(err);
        }
    }
 
    function removeUsername(){
        setUsername('');
    }
 
    updateUsername();
 
    window.addEventListener('usernameChanged', updateUsername);
    window.addEventListener('usernameRemoved', removeUsername);
 
    //clean up on component unmount
    return () => {
       window.removeEventListener('usernameChanged', updateUsername);
       window.removeEventListener('usernameRemoved', removeUsername);
    }
    }, []);
 
   const handleShopNavigate = () => {
      navigate('/shop');
   }
 
   return (
    <div className="relative bg-white flex flex-col lg:flex-row items-center px-4 sm:px-6 lg:px-8 py-6 lg:py-4 overflow-hidden mx-2 sm:mx-4 lg:mx-8">
       {/* Left Content - Always visible */}
       <div className="flex flex-col gap-4 sm:gap-6 w-full lg:max-w-xl relative z-10 text-center lg:text-left">
          <small className="font-bold text-2xl sm:text-3xl" style={{ color: '#8B5A7C' }}>
            Hey, {username ? username : 'there'}
          </small>
          <h1 className="font-bold text-3xl sm:text-4xl text-gray-800">
            Welcome to{' '}
          </h1>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-main-color">
              The Cologne Hub
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Discover premium fragrances that define your signature style. The Cologne Hub brings you carefully curated scents from around the world, each bottle telling its own unique story of elegance and sophistication.
          </p>
          <div className="flex justify-center lg:justify-start">
            <button
              onClick={handleShopNavigate}
              className="px-6 sm:px-8 py-3 text-white rounded-full border transition-all duration-300 text-base sm:text-lg font-medium hover:bg-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: '#8B5A7C',
                borderColor: '#8B5A7C'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#8B5A7C';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#8B5A7C';
                e.target.style.color = 'white';
              }}
            >
              Shop Now
            </button>
          </div>
       </div>

       {/* Center - Perfume Bottle - Hidden on mobile, visible on desktop */}
       <div className="hidden lg:flex flex-1 justify-center items-center relative z-10">
          <div className="relative">
            <img 
              src={img} 
              alt="Premium Cologne" 
              className="h-[400px] xl:h-[500px] w-[400px] xl:w-[500px] object-cover drop-shadow-2xl filter brightness-110 contrast-110"
            />
            
            {/* Subtle glow effect behind image */}
            <div 
              className="absolute inset-0 rounded-lg blur-2xl opacity-10 -z-10 scale-110"
              style={{ backgroundColor: '#8B5A7C' }}
            ></div>
          </div>
       </div>

       {/* Right Side - Category Tags - Hidden on mobile, visible on desktop */}
       <div className="hidden lg:flex flex-col space-y-6 xl:space-y-8 max-w-xs relative z-10">
          {[
            { name: 'Floral', desc: 'Delicate and\nromantic scents.' },
            { name: 'Aromatic', desc: 'Fresh and\ninvigorating notes.' },
            { name: 'Woody', desc: 'Rich and\nearthy fragrances.' }
          ].map((category, index) => (
            <div key={category.name} className="text-right">
              <h4 
                className="font-bold text-xl xl:text-2xl mb-2"
                style={{ color: '#8B5A7C' }}
              >
                {category.name}
              </h4>
              <p className="text-gray-500 text-sm whitespace-pre-line">
                {category.desc}
              </p>
            </div>
          ))}
       </div>
    </div>
  )
}
 
export default HeroSection