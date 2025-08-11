import HeroSection from '../../components/user_comps/HeroSection.jsx';
import About from '../../components/user_comps/About.jsx';
import EmailSubscription from '../../components/user_comps/EmailSubscription.jsx';
import ShopCategories from '../../components/user_comps/ShopCategories.jsx';
// import PopularBrands from '../../components/user_comps/PopularBrands.jsx';

function LandingPage() {
  return (
    <div>
        <HeroSection />
        {/* <PopularBrands /> */}
        <ShopCategories />
        <About id="about"></About>
        <EmailSubscription />
    </div>
  )
}

export default LandingPage
