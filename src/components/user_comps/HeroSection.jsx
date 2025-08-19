import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import img from '../../assets/img.png'
 
function HeroSection() {
   const [username, setUsername] = useState('hi');
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
       window.removeEventListener('usernameUpdated', updateUsername);
       window.removeEventListener('usernameRemoved',removeUsername);
    }
    }, []);
 
   const handleShopNavigate = () => {
      navigate('/shop');
   }
 
   return (
    <div className="relative bg-white flex items-center px-8 py-4 overflow-hidden mx-8">
       {/* Left Content */}
       <div className="flex flex-col gap-6 max-w-xl relative z-10">
          <small className="font-bold text-3xl" style={{ color: '#8B5A7C' }}>
            Hey, {username ? username : ''}
          </small>
          <h1 className="font-bold text-4xl text-gray-800">
            Welcome to{' '}
          </h1>
          <h2 className="text-5xl font-extrabold text-main-color">
              The Cologne Hub
          </h2>
          
          <p className="text-wrap text-lg text-gray-600">
            Discover premium fragrances that define your signature style. The Cologne Hub brings you carefully curated scents from around the world, each bottle telling its own unique story of elegance and sophistication.
          </p>
          <button
            onClick={handleShopNavigate}
            className="px-8 py-3 text-white rounded-full border transition-colors max-w-44 text-lg font-medium hover:bg-white shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
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

       {/* Center - Perfume Bottle */}
       <div className="flex-1 flex justify-center items-center relative z-10">
          {/* Cologne Image - Made Bigger */}
          <div className="relative">
            <img 
              src={img} 
              alt="Premium Cologne" 
              className="h-[500px] w-[500px] object-cover drop-shadow-2xl filter brightness-110 contrast-110"
            />
            
            {/* Subtle glow effect behind image */}
            <div 
              className="absolute inset-0 rounded-lg blur-2xl opacity-10 -z-10 scale-110"
              style={{ backgroundColor: '#8B5A7C' }}
            ></div>
          </div>
       </div>

       {/* Right Side - Category Tags */}
       <div className="flex flex-col space-y-8 max-w-xs relative z-10">
          {[
            { name: 'Floral', desc: 'Hop to you in\none day.' },
            { name: 'Aromatic', desc: 'Hop to you in\none day.' },
            { name: 'Woody', desc: 'Hop to you in\none day.' }
          ].map((category, index) => (
            <div key={category.name} className="text-right">
              <h4 
                className="font-bold text-2xl mb-2"
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