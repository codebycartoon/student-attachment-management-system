import { GraduationCap, Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Security', href: '#security' },
    { name: 'API Docs', href: '/docs' }
  ],
  Resources: [
    { name: 'Help Center', href: '/help' },
    { name: 'Blog', href: '/blog' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Webinars', href: '/webinars' },
    { name: 'Status', href: '/status' }
  ],
  Company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Partners', href: '/partners' },
    { name: 'Press Kit', href: '/press' }
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
    { name: 'Security', href: '/security' }
  ]
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/attachpro' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/attachpro' },
  { name: 'GitHub', icon: Github, href: 'https://github.com/attachpro' },
  { name: 'Email', icon: Mail, href: 'mailto:hello@attachpro.com' }
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">AttachPro</span>
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">
              The AI-powered platform that connects students with their dream internships 
              and helps universities achieve 94% placement success rates.
            </p>
            
            {/* Social icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors focus-ring"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm focus-ring rounded"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-sm">
            © 2026 AttachPro. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="/privacy" className="text-slate-400 hover:text-white transition-colors focus-ring rounded">
              Privacy
            </a>
            <a href="/terms" className="text-slate-400 hover:text-white transition-colors focus-ring rounded">
              Terms
            </a>
            <a href="/cookies" className="text-slate-400 hover:text-white transition-colors focus-ring rounded">
              Cookies
            </a>
          </div>
        </div>
      </div>

      {/* Hidden JSON-LD schemas for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AttachPro",
            "description": "AI-powered student placement platform for universities and companies",
            "url": "https://attachpro.com",
            "applicationCategory": "EducationApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "247"
            }
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does the AI matching work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our AI analyzes student profiles, skills, preferences, and company requirements to create highly accurate matches. The system learns from successful placements to continuously improve matching quality."
                }
              },
              {
                "@type": "Question", 
                "name": "Can we integrate with our existing LMS?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, AttachPro integrates with all major LMS platforms including Canvas, Blackboard, and Moodle. We also support SAML SSO and can work with your existing authentication systems."
                }
              }
            ]
          })
        }}
      />
    </footer>
  );
}