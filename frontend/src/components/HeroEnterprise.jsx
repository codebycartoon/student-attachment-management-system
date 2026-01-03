import { useState, useEffect } from 'react';
import '../styles/hero.css';

export default function HeroEnterprise() {
  const [cardsLoaded, setCardsLoaded] = useState(false);

  // Simulate loading state for cards (could be replaced with real API call)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCardsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDemoClick = () => {
    // Scroll to demo section or open modal
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const placementData = [
    { role: 'Software Engineer', company: 'TechCorp', match: '98%' },
    { role: 'Product Design', company: 'AlphaBank', match: '95%' },
    { role: 'Cyber Security', company: 'NovaHealth', match: '93%' }
  ];

  return (
    <section className="hero" role="main" aria-labelledby="hero-heading">
      <div className="hero__text">
        <h1 id="hero-heading">
          Place every student in the right seat.
        </h1>
        
        <p>
          AI-driven matching, enterprise security, and real-time analytics 
          trusted by 500+ leading universities worldwide.
        </p>
        
        <div className="hero__actions">
          <button 
            className="btn-primary"
            onClick={handleDemoClick}
            aria-describedby="demo-description"
          >
            Book a Demo
          </button>
          <a 
            className="btn-secondary" 
            href="/register"
            aria-label="Start free trial - no credit card required"
          >
            Start Free Trial →
          </a>
        </div>
        
        <div id="demo-description" className="sr-only">
          Schedule a personalized demo to see how AttachPro can transform your student placement process
        </div>
      </div>

      <div className="hero__visual" role="complementary" aria-label="Live placement examples">
        <div className="sr-only">
          Current live placement matches showing high compatibility scores
        </div>
        
        {placementData.map((placement, index) => (
          <div 
            key={index}
            className={`card ${!cardsLoaded ? 'loading' : ''}`}
            role="article"
            aria-label={`Placement match: ${placement.role} at ${placement.company}, ${placement.match} compatibility`}
          >
            {cardsLoaded ? (
              <>
                {placement.role} — {placement.company}
                <span aria-label={`${placement.match} match score`}>
                  {placement.match} match
                </span>
              </>
            ) : (
              <div aria-label="Loading placement data">
                Loading...
              </div>
            )}
          </div>
        ))}
        
        {cardsLoaded && (
          <div 
            style={{
              fontSize: '0.85rem',
              color: 'var(--hero-text-secondary)',
              textAlign: 'center',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            aria-live="polite"
          >
            <div 
              style={{
                width: '6px',
                height: '6px',
                background: 'var(--nav-accent)',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}
              aria-hidden="true"
            />
            Live placement board - Updated in real-time
          </div>
        )}
      </div>

      {/* Screen reader only content */}
      <div className="sr-only">
        <h2>Key Benefits</h2>
        <ul>
          <li>AI-powered matching algorithm with 98% accuracy</li>
          <li>Enterprise-grade security and compliance</li>
          <li>Real-time analytics and reporting</li>
          <li>Trusted by over 500 universities worldwide</li>
        </ul>
      </div>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}