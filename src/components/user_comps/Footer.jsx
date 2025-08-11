import { useNavigate } from "react-router-dom";

function Footer() {
  
  const navigate = useNavigate();

  const handleShopNavigation = ()=>{
      navigate('/shop');
  }
  return (
    <footer className='flex flex-col justify-center items-center gap-4 p-8 bg-comp-color text-white text-center'>
      <h3 className='text-2xl font-semibold leading-snug'>
        Discover your signature scent today.  
        <br /> Luxury is just a spray away.
      </h3>

      <button
      onClick = {handleShopNavigation}
      className='px-6 py-3 rounded-full bg-main-color text-white hover:bg-comp-color/90 transition-all'>
        Shop Now
      </button>

      <ul className='flex gap-6 text-sm pt-4'>
        <li><a href="#" className='hover:underline'>Shop</a></li>
        <li><a href="#" className='hover:underline'>About</a></li>
        <li><a href="#" className='hover:underline'>Contact Us</a></li>
        <li><a href="#" className='hover:underline'>Services</a></li>
      </ul>

      <p className='mt-6 text-gray-400 text-sm font-light'>&copy; 2025 The Cologne Hub. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
