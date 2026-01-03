import HeroProfessional from '../components/HeroProfessional';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function LandingProfessional() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* No navbar - full professional immersion */}
      <HeroProfessional />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}