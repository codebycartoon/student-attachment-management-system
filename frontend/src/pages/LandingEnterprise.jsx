import NavbarEnterprise from '../components/NavbarEnterprise';
import HeroEnterprise from '../components/HeroEnterprise';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

// Import global styles
import '../styles/app.css';

export default function LandingEnterprise() {
  return (
    <div>
      {/* Enterprise Navigation + Hero share viewport */}
      <NavbarEnterprise />
      <HeroEnterprise />
      
      {/* Additional sections */}
      <Features />
      <HowItWorks />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}