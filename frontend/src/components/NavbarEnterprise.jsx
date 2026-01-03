import { useState, useEffect } from 'react';
import useScrollLock from '../hooks/useScrollLock';
import '../styles/navbar.css';

export default function NavbarEnterprise() {
  const [open, setOpen] = useState(false);
  
  // Prevent body scroll when menu is open
  useScrollLock(open);

  // Close menu on escape key and window resize > mobile
  useEffect(() => {
    const closeMenu = () => setOpen(false);
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };
    
    const handleResize = () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMenuToggle = () => {
    setOpen(prev => !prev);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <header className="nav" role="banner">
      <div className="nav__container">
        {/* Logo - Always Visible */}
        <a href="/" className="nav__logo" aria-label="AttachPro Home">
          AttachPro
        </a>

        {/* Desktop Navigation Links */}
        <nav className="nav__links" data-open={open} role="navigation" aria-label="Main navigation">
          <a href="#features" onClick={handleLinkClick}>Features</a>
          <a href="#universities" onClick={handleLinkClick}>Universities</a>
          <a href="#pricing" onClick={handleLinkClick}>Pricing</a>
          <a href="#demo" className="nav__demo" onClick={handleLinkClick}>Book Demo</a>
        </nav>

        {/* Primary CTA - Always Visible */}
        <a href="/register" className="nav__cta" aria-label="Start free trial">
          Start Free Trial
        </a>

        {/* Mobile Hamburger Menu */}
        <button
          className="nav__burger"
          onClick={handleMenuToggle}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          aria-controls="main-navigation"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}