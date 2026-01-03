import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HeroMinimal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section style={{
      height: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      textAlign: 'center',
      padding: '0 1rem',
      paddingTop: '72px' // Account for fixed navbar
    }}>
      <div style={{ 
        maxWidth: '600px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#111',
          marginBottom: '0.5rem',
          lineHeight: '1.2',
          letterSpacing: '-0.02em'
        }}>
          Connect students to dream attachments.
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#555',
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>
          AI-powered matching. Trusted by 500+ universities.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a
            href="/register"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-block'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#333';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#000';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Start Free Trial
          </a>
          
          <button
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#000',
              border: '1px solid #000',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Play size={16} />
            Watch Demo
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section h1 {
            font-size: 2rem !important;
          }
          
          section p {
            font-size: 1rem !important;
          }
          
          section > div > div {
            flex-direction: column !important;
            align-items: center !important;
          }
          
          section > div > div > a,
          section > div > div > button {
            width: 100% !important;
            max-width: 280px !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          section > div {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}