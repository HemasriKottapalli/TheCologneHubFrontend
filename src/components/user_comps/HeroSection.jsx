import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import imgright from '../../assets/img1.png'

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

   // Generate fairy dust particles - MORE with BIGGER sizes, only on image side (desktop only)
   const particles = Array.from({ length: 80 }, (_, i) => ({
     id: i,
     size: Math.random() * 15 + 0.5, // Sizes from 0.5px to 15.5px (BIGGER)
     initialX: Math.random() * 50 + 50, // Only right side (50% to 100%)
     initialY: Math.random() * 100,
     duration: Math.random() * 35 + 8,
     delay: Math.random() * 25
   }));

   return (
    <div className="relative flex justify-between items-center h-auto pt-4 pb-8 md:pb-4 gap-6 overflow-hidden">
       {/* Fairy Dust Background Animation - Hidden on mobile */}
       <div className="absolute inset-0 pointer-events-none z-0 hidden md:block">
         {particles.map((particle) => (
           <div
             key={particle.id}
             className="absolute rounded-full"
             style={{
               width: `${particle.size}px`,
               height: `${particle.size}px`,
               backgroundColor: '#8B5A7C',
               left: `${particle.initialX}%`,
               top: `${particle.initialY}%`,
               opacity: particle.size > 10 ? 0.2 : particle.size > 6 ? 0.4 : particle.size > 3 ? 0.6 : 0.8, // Different opacity for BIGGER sizes
               animation: `fairyFloat ${particle.duration}s infinite linear`,
               animationDelay: `${particle.delay}s`,
               boxShadow: particle.size > 8 ? `0 0 ${particle.size * 3}px rgba(139, 90, 124, 0.4)` : particle.size > 4 ? `0 0 ${particle.size * 2}px rgba(139, 90, 124, 0.5)` : particle.size > 2 ? `0 0 ${particle.size}px rgba(139, 90, 124, 0.3)` : 'none',
               filter: particle.size < 2 ? 'blur(0.5px)' : particle.size < 4 ? 'blur(0.2px)' : 'none'
             }}
           />
         ))}
         
         {/* Extra tiny sparkles - MORE, only on image side */}
         {Array.from({ length: 60 }, (_, i) => (
           <div
             key={`sparkle-${i}`}
             className="absolute rounded-full"
             style={{
               width: `${Math.random() * 4 + 0.5}px`, // 0.5px to 4.5px (BIGGER)
               height: `${Math.random() * 4 + 0.5}px`,
               backgroundColor: '#8B5A7C',
               left: `${Math.random() * 50 + 50}%`, // Only right side (50% to 100%)
               top: `${Math.random() * 100}%`,
               opacity: Math.random() * 0.6 + 0.2, // Random opacity 0.2-0.8
               animation: `sparkle ${Math.random() * 6 + 2}s infinite ease-in-out`,
               animationDelay: `${Math.random() * 15}s`,
               boxShadow: '0 0 8px rgba(139, 90, 124, 0.6)'
             }}
           />
         ))}
       </div>

       <div className="flex flex-col gap-4 w-full max-w-2xl px-4 md:ml-[5%] md:px-0 relative z-10">
          <small className="font-bold text-2xl md:text-3xl text-main-color">Hey, {username ? username : ''}</small>
          <h1 className="font-bold text-3xl md:text-4xl leading-tight">Welcome to <span className="text-main-color text-3xl md:text-5xl block md:inline">The Cologne Hub</span></h1>
          <p className="text-wrap text-base md:text-lg">Discover premium fragrances that define your signature style. The Cologne Hub brings you carefully curated scents from around the world, each bottle telling its own unique story of elegance and sophistication.</p>
          <button
             onClick={handleShopNavigate}
            className="px-8 py-3 bg-main-color rounded-full text-white border border-main-color transition-colors max-w-44 hover:bg-white hover:text-main-color relative z-10 text-lg"
            >Shop Now</button>
      </div>
        
      {/* Image - Hidden on mobile, visible on medium screens and up */}
      <div className="relative z-10 hidden md:block">
          <img src={imgright} alt="image" className="h-[28rem] drop-shadow-2xl shadow-black/50 filter brightness-50 contrast-125"/>
        </div>

      <style>{`
        @keyframes fairyFloat {
          0% {
            transform: translateY(0px) translateX(0px) scale(0.8);
            opacity: 0;
          }
          5% {
            opacity: 0.6;
            transform: scale(1);
          }
          95% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-120vh) translateX(40px) scale(0.2);
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  )
}

export default HeroSection