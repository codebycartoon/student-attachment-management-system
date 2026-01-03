import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

export default function NavbarMinimal() {
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
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 1rem', 
        height: '72px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Logo />
        
        {/* Desktop Navigation */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2rem'
        }} className="desktop-nav">
          <a 
            style={{ 
              color: '#555', 
              textDecoration: 'none', 
              fontSize: '0.95rem', 
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }} 
            href="#features"
            onMouseOver={(e) => e.target.style.color = '#000'}
            onMouseOut={(e) => e.target.style.color = '#555'}
          >
            Features
          </a>
          <a 
            style={{ 
              color: '#555', 
              textDecoration: 'none', 
              fontSize: '0.95rem', 
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }} 
            href="#how-it-works"
            onMouseOver={(e) => e.target.style.color = '#000'}
            onMouseOut={(e) => e.target.style.color = '#555'}
          >
            How it Works
          </a>
          <a 
            style={{ 
              color: '#555', 
              textDecoration: 'none', 
              fontSize: '0.95rem', 
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }} 
            href="#contact"
            onMouseOver={(e) => e.target.style.color = '#000'}
            onMouseOut={(e) => e.target.style.color = '#555'}
          >
            Contact
          </a>
          
          {/* Version Switcher - Development Only */}
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#999',
            borderLeft: '1px solid #e5e7eb',
            paddingLeft: '1rem',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Pro</a>
            <span>|</span>
            <a href="/landing-enterprise" style={{ color: '#999', textDecoration: 'none' }}>Enterprise</a>
            <span>|</span>
            <a href="/landing-professional" style={{ color: '#999', textDecoration: 'none' }}>Professional</a>
            <span>|</span>
            <a href="/landing-cool" style={{ color: '#999', textDecoration: 'none' }}>Cool</a>
            <span>|</span>
            <a href="/landing-standard" style={{ color: '#999', textDecoration: 'none' }}>Standard</a>
          </div>
        </div>

        {/* Desktop CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
          <a
            href="/login"
            style={{ 
              color: '#555', 
              textDecoration: 'none', 
              fontSize: '0.95rem', 
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#000'}
            onMouseOut={(e) => e.target.style.color = '#555'}
          >
            Sign In
          </a>
          <a
            href="/register"
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#000',
              color: 'white', 
              borderRadius: '6px', 
              fontSize: '0.95rem', 
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
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
            Get Started
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#555'
          }}
          className="mobile-menu-btn"
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
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem'
        }} className="mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a 
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                color: '#555', 
                textDecoration: 'none', 
                fontSize: '1rem', 
                fontWeight: '500',
                padding: '0.5rem 0'
              }}
            >
              Features
            </a>
            <a 
              href="#how-it-works"
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                color: '#555', 
                textDecoration: 'none', 
                fontSize: '1rem', 
                fontWeight: '500',
                padding: '0.5rem 0'
              }}
            >
              How it Works
            </a>
            <a 
              href="#contact"
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                color: '#555', 
                textDecoration: 'none', 
                fontSize: '1rem', 
                fontWeight: '500',
                padding: '0.5rem 0'
              }}
            >
              Contact
            </a>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <a
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  color: '#555', 
                  textDecoration: 'none', 
                  fontSize: '1rem', 
                  fontWeight: '500',
                  padding: '0.75rem 0',
                  textAlign: 'center'
                }}
              >
                Sign In
              </a>
              <a
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  padding: '0.75rem 1rem', 
                  backgroundColor: '#000',
                  color: 'white', 
                  borderRadius: '6px', 
                  fontSize: '1rem', 
                  fontWeight: '500',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}