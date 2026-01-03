export default function HeroProfessional() {
  return (
    <section style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '0 5vw',
      background: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#111'
    }}>
      {/* Left Side */}
      <div style={{
        flex: '1 1 480px',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
          fontWeight: '700',
          lineHeight: '1.15',
          margin: '0 0 1.25rem',
          letterSpacing: '-0.02em'
        }}>
          Place every student in the right seat.
        </h1>
        
        <p style={{
          fontSize: '1.125rem',
          lineHeight: '1.6',
          color: '#444',
          margin: '0 0 1.5rem'
        }}>
          AI-driven matching, enterprise-grade security, and real-time analytics 
          trusted by 500+ leading universities.
        </p>
        
        {/* Trust Indicators */}
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 2rem',
          display: 'flex',
          gap: '2rem',
          fontSize: '0.95rem',
          color: '#555',
          flexWrap: 'wrap'
        }}>
          <li style={{
            position: 'relative',
            paddingLeft: '1.1rem'
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: '0.45em',
              width: '5px',
              height: '5px',
              background: '#0070f3',
              borderRadius: '50%',
              content: '""',
              display: 'block'
            }}></span>
            500K+ students connected
          </li>
          <li style={{
            position: 'relative',
            paddingLeft: '1.1rem'
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: '0.45em',
              width: '5px',
              height: '5px',
              background: '#0070f3',
              borderRadius: '50%',
              content: '""',
              display: 'block'
            }}></span>
            98% placement rate
          </li>
          <li style={{
            position: 'relative',
            paddingLeft: '1.1rem'
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: '0.45em',
              width: '5px',
              height: '5px',
              background: '#0070f3',
              borderRadius: '50%',
              content: '""',
              display: 'block'
            }}></span>
            SOC 2 Type II certified
          </li>
        </ul>
        
        {/* CTA Section */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              // Scroll to contact section or open demo modal
              document.getElementById('contact')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
            style={{
              padding: '0.85rem 2rem',
              border: 'none',
              borderRadius: '6px',
              background: '#0070f3',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#0051cc';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#0070f3';
            }}
          >
            Book a Demo
          </button>
          
          <a
            href="/register"
            style={{
              color: '#0070f3',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.color = '#0051cc';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#0070f3';
            }}
          >
            Start Free Trial →
          </a>
        </div>
      </div>
      
      {/* Right Side - Live Dashboard */}
      <div style={{
        flex: '1 1 400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          padding: '1.75rem 2rem'
        }}>
          <header style={{
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#666',
            marginBottom: '1.25rem',
            fontWeight: '600'
          }}>
            Live Placement Board
          </header>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            fontSize: '1rem',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <span style={{ color: '#333' }}>Software Engineer — TechCorp</span>
            <strong style={{ color: '#0070f3', fontSize: '0.9rem' }}>98% match</strong>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            fontSize: '1rem',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <span style={{ color: '#333' }}>Product Design — AlphaBank</span>
            <strong style={{ color: '#0070f3', fontSize: '0.9rem' }}>95% match</strong>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            fontSize: '1rem'
          }}>
            <span style={{ color: '#333' }}>Cyber Security — NovaHealth</span>
            <strong style={{ color: '#0070f3', fontSize: '0.9rem' }}>93% match</strong>
          </div>
          
          {/* Status Indicator */}
          <div style={{
            marginTop: '1rem',
            padding: '0.5rem 0.75rem',
            background: '#f0f9ff',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#0070f3',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              background: '#0070f3',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            3 new matches found in the last hour
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 900px) {
          section {
            flex-direction: column !important;
            text-align: center !important;
            padding: 10vh 5vw !important;
            justify-content: center !important;
          }
          
          section > div:first-child > ul {
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
          
          section > div:first-child > div {
            justify-content: center !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          section > div:first-child > div > a,
          section > div:first-child > div > button {
            width: 100% !important;
            max-width: 280px !important;
            text-align: center !important;
          }
          
          section > div:last-child {
            margin-top: 2.5rem !important;
            width: 100% !important;
          }
          
          section > div:last-child > div {
            max-width: 100% !important;
          }
        }
        
        @media (max-width: 600px) {
          section > div:first-child > ul {
            flex-direction: column !important;
            gap: 0.75rem !important;
            align-items: center !important;
          }
          
          section > div:last-child > div {
            padding: 1.25rem 1.5rem !important;
          }
          
          section > div:last-child > div > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.25rem !important;
            padding: 0.5rem 0 !important;
          }
          
          section > div:last-child > div > div > strong {
            align-self: flex-end !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse { 0%, 100% { opacity: 1; } }
        }
      `}</style>
    </section>
  );
}