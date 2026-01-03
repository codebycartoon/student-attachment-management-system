import { Suspense, lazy } from 'react';
import Preloader from '../components/Preloader';
import MicroNav from '../components/MicroNav';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import RoleValueBlocks from '../components/RoleValueBlocks';
import LiveSystemProof from '../components/LiveSystemProof';
import SocialProofBar from '../components/SocialProofBar';
import PrivacyBanner from '../components/PrivacyBanner';

// Lazy load below-the-fold components for performance
const ValueProps = lazy(() => import('../components/ValueProps'));
const RiskReversal = lazy(() => import('../components/RiskReversal'));
const IntegrationsStrip = lazy(() => import('../components/IntegrationsStrip'));
const PricingAnchor = lazy(() => import('../components/PricingAnchor'));
const FinalCTA = lazy(() => import('../components/FinalCTA'));
const Footer = lazy(() => import('../components/Footer'));

// Loading fallback component
const SectionLoader = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function LandingPro() {
  return (
    <>
      {/* 1. Preloader (optional) - 200ms max fade-out */}
      <Preloader />
      
      {/* 2. Micro-nav (sticky, universal) */}
      <MicroNav />
      
      {/* 3. Hero (100vh, adapts perfectly) */}
      <Hero />
      
      {/* 4. How It Works (mapped to system architecture) */}
      <HowItWorks />
      
      {/* 5. Role-Based Value Blocks (your killer advantage) */}
      <RoleValueBlocks />
      
      {/* 6. Live System Proof (trust layer) */}
      <LiveSystemProof />
      
      {/* 7. Social-proof bar (immediately below fold) */}
      <SocialProofBar />
      
      {/* Below-the-fold sections - lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        {/* 8. Feature Deep Dive (matches backend) */}
        <ValueProps />
        
        {/* 9. Security & Compliance (enterprise trust) */}
        <RiskReversal />
        
        {/* 10. Integrations strip */}
        <IntegrationsStrip />
        
        {/* 11. Pricing (adaptive simplicity) */}
        <PricingAnchor />
        
        {/* 12. Final CTA (same message, reinforced) */}
        <FinalCTA />
        
        {/* 13. Footer (clean & predictable) */}
        <Footer />
      </Suspense>

      {/* 14. Post-footer widgets */}
      {/* Privacy banner - renamed to avoid ad blocker issues */}
      <PrivacyBanner />
      
      {/* Analytics tag placeholder */}
      {process.env.NODE_ENV === 'production' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // GA4 or Segment analytics tag
              console.log('Analytics initialized');
            `
          }}
        />
      )}
    </>
  );
}