import NavbarMinimal from '../components/NavbarMinimal';
import HeroStandard from '../components/HeroStandard';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function LandingStandard() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <NavbarMinimal />
      <HeroStandard />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}