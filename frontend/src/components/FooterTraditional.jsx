import React from 'react';
import './FooterTraditional.css';

const FooterTraditional = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/features">Features</a></li>
            <li><a href="/pricing">Pricing</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Platform</h3>
          <ul>
            <li><a href="/register">For Students</a></li>
            <li><a href="/register">For Companies</a></li>
            <li><a href="/register">For Universities</a></li>
            <li><a href="/api-docs">API Documentation</a></li>
            <li><a href="/help">Help Center</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <div className="contact-info">
            <p><strong>Email:</strong> support@attachpro.com</p>
            <p><strong>Phone:</strong> +1 (555) 012-3456</p>
            <p><strong>Address:</strong><br />
               123 Innovation Drive<br />
               Tech Valley, CA 94025
            </p>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-media">
            <a href="https://facebook.com" aria-label="Facebook">
              <img src="/facebook_icon.png" alt="Facebook" />
            </a>
            <a href="https://twitter.com" aria-label="Twitter">
              <img src="/twitter_icon.png" alt="Twitter" />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn">
              <img src="/linkedin_icon.png" alt="LinkedIn" />
            </a>
            <a href="https://github.com" aria-label="GitHub">
              <img src="/github_icon.png" alt="GitHub" />
            </a>
          </div>
          
          <div className="newsletter">
            <h4>Newsletter</h4>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required 
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 AttachPro. All rights reserved.</p>
        <p>Made with ❤️ for better student outcomes</p>
      </div>
    </footer>
  );
};

export default FooterTraditional;