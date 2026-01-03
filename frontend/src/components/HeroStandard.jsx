import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HeroStandard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1100px',
      margin: 'auto',
      padding: '6rem 1.5rem',
      gap: '3rem',
      minHeight: '80vh',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Left Side */}
      <div style={{ flex: 1, textAlign: 'left' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          lineHeight: '1.2',
          color: '#111',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Match students to attachments with AI.
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#444',
          margin: '1rem 0 2rem',
          lineHeight: '1.6',
          maxWidth: '500px'
        }}>
          500+ universities trust AttachPro to place students faster, safer, and smarter.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '1.5rem', color: '#000', fontWeight: '700' }}>
              500K+
            </strong>
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
              Students Connected
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '1.5rem', color: '#000', fontWeight: '700' }}>
              98%
            </strong>
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
              Placement Rate
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/register"
            style={{
              background: '#000',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.75rem',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#333';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#000';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Start Free Trial
          </a>
          
          <button
            style={{
              background: 'transparent',
              color: '#000',
              border: '1px solid #000',
              padding: '0.75rem 1.75rem',
              borderRadius: '6px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f5f5f5';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Play size={16} />
            Watch Demo
          </button>
        </div>
      </div>

      {/* Right Side - Live Match Card */}
      <div style={{ flex: '0 0 320px' }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Badge */}
          <div style={{
            display: 'inline-block',
            background: '#e6f7ff',
            color: '#0066cc',
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            marginBottom: '0.75rem',
            fontWeight: '600',
            animation: 'pulse 2s infinite'
          }}>
            🎯 New Match Found
          </div>
          
          <h3 style={{
            margin: '0 0 0.25rem',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111'
          }}>
            Software Engineer
          </h3>
          
          <p style={{
            margin: '0 0 1rem',
            color: '#666',
            fontSize: '0.95rem'
          }}>
            TechCorp Solutions
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{
              fontWeight: '600',
              color: '#00a335',
              fontSize: '1rem'
            }}>
              98% match
            </span>
            <div style={{
              width: '60px',
              height: '6px',
              background: '#f0f0f0',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '98%',
                height: '100%',
                background: 'linear-gradient(90deg, #00a335, #00d644)',
                borderRadius: '3px',
                animation: 'fillBar 2s ease-out'
              }}></div>
            </div>
          </div>

          {/* Quick Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <div>
              <strong style={{ color: '#333', display: 'block' }}>Location</strong>
              San Francisco, CA
            </div>
            <div>
              <strong style={{ color: '#333', display: 'block' }}>Duration</strong>
              6 months
            </div>
            <div>
              <strong style={{ color: '#333', display: 'block' }}>Start Date</strong>
              Jan 2024
            </div>
            <div>
              <strong style={{ color: '#333', display: 'block' }}>Salary</strong>
              $4,500/month
            </div>
          </div>

          {/* Floating notification */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '16px',
            height: '16px',
            background: '#ff4444',
            borderRadius: '50%',
            border: '2px solid white',
            animation: 'bounce 1s infinite'
          }}></div>
        </div>

        {/* Secondary Cards */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem',
          opacity: '0.7'
        }}>
          <div style={{
            flex: 1,
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.8rem'
          }}>
            <strong style={{ color: '#333', display: 'block', marginBottom: '0.25rem' }}>
              Data Analyst
            </strong>
            <span style={{ color: '#666' }}>DataFlow • 95% match</span>
          </div>
          <div style={{
            flex: 1,
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.8rem'
          }}>
            <strong style={{ color: '#333', display: 'block', marginBottom: '0.25rem' }}>
              UX Designer
            </strong>
            <span style={{ color: '#666' }}>DesignCo • 92% match</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes fillBar {
          0% { width: 0%; }
          100% { width: 98%; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
          60% { transform: translateY(-2px); }
        }
        
        @media (max-width: 768px) {
          section {
            flex-direction: column !important;
            padding: 4rem 1.5rem !important;
            gap: 2rem !important;
            text-align: center !important;
          }
          
          section > div:first-child {
            text-align: center !important;
          }
          
          section h1 {
            font-size: 2.2rem !important;
          }
          
          section > div:first-child > div:nth-child(3) {
            justify-content: center !important;
          }
          
          section > div:first-child > div:last-child {
            justify-content: center !important;
            flex-direction: column !important;
            width: 100% !important;
          }
          
          section > div:first-child > div:last-child > a,
          section > div:first-child > div:last-child > button {
            width: 100% !important;
            max-width: 280px !important;
            justify-content: center !important;
          }
          
          section > div:last-child {
            flex: none !important;
            width: 100% !important;
            max-width: 400px !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          section {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          
          @keyframes pulse { 0%, 100% { opacity: 1; } }
          @keyframes fillBar { 0%, 100% { width: 98%; } }
          @keyframes bounce { 0%, 100% { transform: translateY(0); } }
        }
      `}</style>
    </section>
  );
}