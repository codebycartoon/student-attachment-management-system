import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function NavbarPro() {
  return (
    <nav style={{ 
      width: '100%', 
      borderBottom: '1px solid #e5e7eb', 
      backgroundColor: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 1.5rem', 
        height: '4rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap style={{ height: '1.5rem', width: '1.5rem', color: '#2563eb' }} />
          <span style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#111827' 
          }}>
            AttachPro
          </span>
        </div>

        {/* Navigation */}
        <div style={{ 
          display: 'none', 
          alignItems: 'center', 
          gap: '2rem', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: '#6b7280' 
        }} className="md:flex">
          <a href="#features" style={{ color: '#6b7280', textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" style={{ color: '#6b7280', textDecoration: 'none' }}>How it works</a>
          <a href="#roles" style={{ color: '#6b7280', textDecoration: 'none' }}>Who it's for</a>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/login"
            style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#6b7280',
              textDecoration: 'none'
            }}
          >
            Sign in
          </Link>
          
          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '0.375rem',
              backgroundColor: '#2563eb',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#ffffff',
              textDecoration: 'none'
            }}
          >
            Get started
          </Link>
        </div>
       
      </div>
    </nav>
  );
}