import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 1px 20px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 32px', 
        height: '72px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Logo />
        
        {/* Desktop Navigation Links */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '40px'
        }} className="mobile-hidden">
          <a 
            style={{ 
              color: '#64748b', 
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              transition: 'all 0.3s ease',
              position: 'relative'
            }} 
            href="#features"
            onMouseOver={(e) => {
              e.target.style.color = '#1e293b';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#64748b';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Features
          </a>
          <a 
            style={{ 
              color: '#64748b', 
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }} 
            href="#how-it-works"
            onMouseOver={(e) => {
              e.target.style.color = '#1e293b';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#64748b';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            How it Works
          </a>
          <a 
            style={{ 
              color: '#64748b', 
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }} 
            href="#testimonials"
            onMouseOver={(e) => {
              e.target.style.color = '#1e293b';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#64748b';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Testimonials
          </a>
          <a 
            style={{ 
              color: '#64748b', 
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }} 
            href="#pricing"
            onMouseOver={(e) => {
              e.target.style.color = '#1e293b';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#64748b';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Pricing
          </a>
        </div>

        {/* Desktop CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="mobile-hidden">
          <a
            href="/login"
            style={{ 
              color: '#64748b', 
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.color = '#1e293b';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#64748b';
            }}
          >
            Sign In
          </a>
          <a
            href="/register"
            style={{ 
              padding: '10px 24px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              borderRadius: '12px', 
              fontSize: '15px', 
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              border: 'none'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            Get Started Free
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b'
          }}
          className="mobile-only"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          padding: '24px 32px'
        }} className="mobile-only">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <a 
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                color: '#64748b', 
                textDecoration: 'none', 
                fontSize: '16px', 
                fontWeight: '500',
                padding: '8px 0'
              }}
            >
              Features
            </a>
            <a 
              href="#how-it-works"
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                color: '#64748b', 
                textDecoration: 'none', 
                fontSize: '16px', 
                fontWeight: '500',
                padding: '8px 0'
              }}
            >
              How it Works
            </a>
            <a 
              href="#testimonials"
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                color: '#64748b', 
                textDecoration: 'none', 
                fontSize: '16px', 
                fontWeight: '500',
                padding: '8px 0'
              }}
            >
              Testimonials
            </a>
            <a 
              href="#pricing"
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                color: '#64748b', 
                textDecoration: 'none', 
                fontSize: '16px', 
                fontWeight: '500',
                padding: '8px 0'
              }}
            >
              Pricing
            </a>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <a
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  color: '#64748b', 
                  textDecoration: 'none', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  padding: '12px 0',
                  textAlign: 'center'
                }}
              >
                Sign In
              </a>
              <a
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  padding: '12px 24px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white', 
                  borderRadius: '12px', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-specific styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-hidden {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}