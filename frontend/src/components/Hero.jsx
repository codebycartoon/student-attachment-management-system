import { ArrowRight, Play, Users, Building, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [currentView, setCurrentView] = useState(0);
  
  const demoViews = [
    {
      role: 'Student',
      icon: Users,
      color: 'blue',
      data: { name: 'Sarah Chen', action: 'Applied to Google', match: '98%' }
    },
    {
      role: 'Company', 
      icon: Building,
      color: 'green',
      data: { name: 'TechCorp', action: 'Reviewing 12 candidates', match: '5 matches' }
    },
    {
      role: 'Admin',
      icon: BarChart3, 
      color: 'purple',
      data: { name: 'System', action: '87% placement success', match: '2.3k active' }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % demoViews.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white pt-20 pb-16 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          
          {/* Headline - Always 1-2 lines */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            One Platform.{' '}
            <span className="text-blue-600">Every Student Placement.</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Match students to real industry opportunities with AI-powered workflows and real-time tracking.
          </p>
          
          {/* Proof Line */}
          <p className="text-sm sm:text-base text-gray-500 mb-8 sm:mb-10">
            87% placement success • Used by universities & employers
          </p>
          
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
            <Link 
              to="/register"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <button className="px-6 sm:px-8 py-3 sm:py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
              <Play className="h-4 w-4" />
              Book Demo
            </button>
          </div>
          
          {/* Responsive Visual */}
          <div className="max-w-4xl mx-auto">
            
            {/* Mobile: Static UI Mock */}
            <div className="block sm:hidden">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Sarah Chen</div>
                      <div className="text-sm text-gray-500">Applied to Google</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">98%</div>
                </div>
              </div>
            </div>
            
            {/* Tablet: Carousel Views */}
            <div className="hidden sm:block lg:hidden">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-6">
                  {demoViews.map((_, index) => (
                    <div 
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentView === index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  {(() => {
                    const view = demoViews[currentView];
                    const Icon = view.icon;
                    const colorClasses = {
                      blue: 'bg-blue-100 text-blue-600',
                      green: 'bg-green-100 text-green-600', 
                      purple: 'bg-purple-100 text-purple-600'
                    };
                    
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[view.color]}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">{view.data.name}</div>
                            <div className="text-sm text-gray-500">{view.data.action}</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{view.data.match}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            {/* Desktop: Live Animated Demo */}
            <div className="hidden lg:block">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Live System Demo</h3>
                  <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Processing Real Data
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {demoViews.map((view, index) => {
                    const Icon = view.icon;
                    const isActive = currentView === index;
                    const colorClasses = {
                      blue: 'from-blue-500 to-blue-600',
                      green: 'from-green-500 to-green-600',
                      purple: 'from-purple-500 to-purple-600'
                    };
                    
                    return (
                      <div 
                        key={index}
                        className={`bg-white rounded-xl p-6 border transition-all duration-500 ${
                          isActive ? 'border-blue-200 shadow-lg scale-105' : 'border-gray-200'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${colorClasses[view.color]} flex items-center justify-center mb-4 ${
                          isActive ? 'animate-pulse' : ''
                        }`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-500 mb-1">{view.role}</div>
                          <div className="font-semibold text-gray-900 mb-2">{view.data.name}</div>
                          <div className="text-sm text-gray-600 mb-3">{view.data.action}</div>
                          <div className={`text-2xl font-bold ${
                            isActive ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {view.data.match}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}