import HeroCool from '../components/HeroCool';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

// Simple demo section
const DemoSection = () => (
  <section id="demo" style={{
    padding: '4rem 2rem',
    backgroundColor: '#f8fafc',
    textAlign: 'center'
  }}>
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#111' }}>
        See AttachPro in Action
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        Watch how students find their perfect attachments in under 45 seconds
      </p>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        height: '360px',
        backgroundColor: '#000',
        borderRadius: '12px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        🎬 Demo Video Coming Soon
      </div>
    </div>
  </section>
);

export default function LandingCool() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* No navbar - full immersion */}
      <HeroCool />
      <DemoSection />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}