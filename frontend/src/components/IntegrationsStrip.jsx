import { useRef, useEffect } from 'react';

const integrations = [
  { name: 'Canvas LMS', logo: 'Canvas' },
  { name: 'Blackboard', logo: 'Blackboard' },
  { name: 'Moodle', logo: 'Moodle' },
  { name: 'Google Workspace', logo: 'Google' },
  { name: 'Microsoft 365', logo: 'Microsoft' },
  { name: 'Slack', logo: 'Slack' },
  { name: 'Zoom', logo: 'Zoom' },
  { name: 'Teams', logo: 'Teams' },
  { name: 'Salesforce', logo: 'Salesforce' },
  { name: 'Workday', logo: 'Workday' },
  { name: 'BambooHR', logo: 'BambooHR' },
  { name: 'Greenhouse', logo: 'Greenhouse' },
  { name: 'Lever', logo: 'Lever' },
  { name: 'Calendly', logo: 'Calendly' },
  { name: 'Outlook', logo: 'Outlook' },
  { name: 'Google Calendar', logo: 'GCal' },
  { name: 'Okta', logo: 'Okta' },
  { name: 'Auth0', logo: 'Auth0' },
  { name: 'Azure AD', logo: 'Azure' },
  { name: 'SAML SSO', logo: 'SAML' }
];

export default function IntegrationsStrip() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollInterval = 30;

    const autoScroll = () => {
      scrollAmount += scrollStep;
      if (scrollAmount >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0;
      }
      scrollContainer.scrollLeft = scrollAmount;
    };

    const interval = setInterval(autoScroll, scrollInterval);

    // Pause on hover
    const handleMouseEnter = () => clearInterval(interval);
    const handleMouseLeave = () => {
      clearInterval(interval);
      setInterval(autoScroll, scrollInterval);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(interval);
      scrollContainer?.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section id="integrations" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Works seamlessly with your existing stack
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            No rip-and-replace. AttachPro fits into your current ecosystem.
          </p>
        </div>

        {/* Scrolling logo wall */}
        <div 
          ref={scrollRef}
          className="horizontal-scroll overflow-x-auto pb-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex items-center gap-8 w-max">
            {/* Duplicate the array for seamless loop */}
            {[...integrations, ...integrations].map((integration, index) => (
              <div 
                key={`${integration.name}-${index}`}
                className="flex-shrink-0 w-32 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors group shadow-sm"
                title={integration.name}
              >
                <div className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors text-center px-2">
                  {integration.logo}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 text-center">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-xl font-bold text-slate-900 mb-2">LMS Platforms</div>
            <div className="text-sm text-slate-600">Learning Management Systems</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-xl font-bold text-slate-900 mb-2">HR Systems</div>
            <div className="text-sm text-slate-600">Human Resources Tools</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-xl font-bold text-slate-900 mb-2">Calendar Tools</div>
            <div className="text-sm text-slate-600">Scheduling & Meetings</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-xl font-bold text-slate-900 mb-2">SSO Providers</div>
            <div className="text-sm text-slate-600">Identity Management</div>
          </div>
        </div>
      </div>
    </section>
  );
}