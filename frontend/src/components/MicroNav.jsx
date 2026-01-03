import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';

export default function MicroNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`micro-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Wordmark */}
        <Link to="/" className="flex items-center gap-2 focus-ring rounded-lg">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">AttachPro</span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#product" className="hover:text-gray-900 transition-colors focus-ring rounded px-2 py-1">Product</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors focus-ring rounded px-2 py-1">How It Works</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors focus-ring rounded px-2 py-1">Pricing</a>
          <a href="#security" className="hover:text-gray-900 transition-colors focus-ring rounded px-2 py-1">Security</a>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-3">
          {/* Login - Always visible */}
          <Link 
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-ring rounded px-3 py-2"
          >
            Login
          </Link>
          
          {/* Primary CTA - Always visible */}
          <Link
            to="/register"
            className="cta-primary inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg focus-ring"
          >
            Book Demo
          </Link>

          {/* Mobile Menu Button - Only on mobile */}
          <button
            className="lg:hidden p-2 focus-ring rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            <a href="#product" className="block text-gray-600 hover:text-gray-900 focus-ring rounded px-2 py-2">Product</a>
            <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900 focus-ring rounded px-2 py-2">How It Works</a>
            <a href="#pricing" className="block text-gray-600 hover:text-gray-900 focus-ring rounded px-2 py-2">Pricing</a>
            <a href="#security" className="block text-gray-600 hover:text-gray-900 focus-ring rounded px-2 py-2">Security</a>
          </div>
        </div>
      )}
    </nav>
  );
}