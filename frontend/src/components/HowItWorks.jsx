import { Search, Shield, Activity } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: Search,
      title: 'Discover',
      description: 'Students explore opportunities, companies post placements, admins monitor system health',
      details: [
        'Students browse verified opportunities',
        'Companies post roles easily', 
        'Admins get full system oversight'
      ]
    },
    {
      number: '2', 
      icon: Shield,
      title: 'Authenticate',
      description: 'Secure login/registration with role-based access for Student, Company, or Admin',
      details: [
        'JWT-based secure authentication',
        'Role-based permissions',
        'Encrypted password protection'
      ]
    },
    {
      number: '3',
      icon: Activity,
      title: 'Operate', 
      description: 'Apply, review, approve, and track progress in real time across the entire platform',
      details: [
        'One-click applications',
        'Real-time status tracking',
        'Automated workflow management'
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            From first visit to successful placement
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our streamlined process works for every stakeholder in the placement ecosystem
          </p>
        </div>

        {/* Steps - Responsive Layout */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <div key={index} className="relative">
                
                {/* Mobile/Tablet: Vertical Layout */}
                <div className="lg:hidden flex gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Desktop: Horizontal Layout */}
                <div className="hidden lg:block text-center">
                  <div className="relative">
                    
                    {/* Step Number Circle */}
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-lg">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-6">{step.description}</p>
                    
                    {/* Details */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-8 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2 z-0">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}