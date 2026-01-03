export default function HeroCool() {
  return (
    <section style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      background: '#000',
      color: '#fff'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 20%, #00c6ff 0%, transparent 35%),
          radial-gradient(circle at 80% 70%, #0072ff 0%, transparent 35%),
          #000
        `,
        opacity: 0.35,
        animation: 'pulse 12s ease-in-out infinite'
      }} />

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        zIndex: 2
      }}>
        <h1 
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '900',
            letterSpacing: '-0.03em',
            position: 'relative',
            marginBottom: '1.2rem'
          }}
          className="glitch"
          data-text="Attach. Launch. Elevate."
        >
          Attach. Launch. Elevate.
        </h1>
        
        <p style={{
          margin: '1.2rem 0 2.5rem',
          fontSize: '1.25rem',
          opacity: 0.85,
          maxWidth: '600px'
        }}>
          AI-matched attachments. Trusted by 500+ universities.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1.2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a
            href="/register"
            style={{
              padding: '0.85rem 2rem',
              border: 'none',
              borderRadius: '6px',
              background: '#fff',
              color: '#000',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              textDecoration: 'none',
              display: 'inline-block'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            Get Started
          </a>
          
          <a
            href="#demo"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('demo')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
            style={{
              padding: '0.85rem 2rem',
              border: '1px solid #fff',
              borderRadius: '6px',
              color: '#fff',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              display: 'inline-block'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#000';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#fff';
            }}
          >
            Watch 45-sec demo
          </a>
        </div>
      </div>

      {/* Floating Glass Cards */}
      <div style={{
        position: 'absolute',
        bottom: '8%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        zIndex: 3,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600',
          animation: 'float 6s ease-in-out infinite'
        }}>
          98% Match
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600',
          animation: 'float 6s ease-in-out infinite',
          animationDelay: '0.5s'
        }}>
          500K+ Placed
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600',
          animation: 'float 6s ease-in-out infinite',
          animationDelay: '1s'
        }}>
          2,500+ Companies
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          overflow: hidden;
        }
        
        .glitch::before {
          left: 2px;
          text-shadow: -2px 0 #00c6ff;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        
        .glitch::after {
          left: -2px;
          text-shadow: -2px 0 #ff00c8;
          clip: rect(85px, 450px, 90px, 0);
          animation: glitch-anim 3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-anim {
          0% { clip: rect(42px, 9999px, 44px, 0); }
          100% { clip: rect(80px, 9999px, 65px, 0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @media (max-width: 768px) {
          section > div:last-child {
            bottom: 12% !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 0.5rem !important;
          }
          
          section > div:nth-child(2) > div {
            gap: 0.8rem !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          
          section > div:nth-child(2) > div > a {
            width: 200px !important;
            text-align: center !important;
          }
          
          section > div:nth-child(2) > p {
            font-size: 1.1rem !important;
            padding: 0 1rem !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse { 0%, 100% { transform: scale(1); } }
          @keyframes glitch-anim { 0%, 100% { clip: rect(42px, 9999px, 44px, 0); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } }
        }
      `}</style>
    </section>
  );
}