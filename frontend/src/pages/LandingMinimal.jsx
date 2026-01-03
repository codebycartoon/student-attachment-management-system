import NavbarMinimal from '../components/NavbarMinimal';
import HeroMinimal from '../components/HeroMinimal';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function LandingMinimal() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <NavbarMinimal />
      <HeroMinimal />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}