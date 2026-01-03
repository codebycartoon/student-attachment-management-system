import { GraduationCap, Building, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoleValueBlocks() {
  const roles = [
    {
      icon: GraduationCap,
      title: 'Students',
      description: 'Find your perfect placement opportunity',
      features: [
        'Browse verified opportunities',
        'One-click applications', 
        'Track status in real time'
      ],
      cta: 'Try Student Demo',
      route: '/register?role=student',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Building,
      title: 'Companies', 
      description: 'Connect with top student talent',
      features: [
        'Post roles easily',
        'Review matched candidates',
        'Manage applications efficiently'
      ],
      cta: 'View Company Demo',
      route: '/register?role=company', 
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Settings,
      title: 'Admins',
      description: 'Complete system control and insights',
      features: [
        'Full system oversight',
        'Analytics & exports',
        'Secure role management'
      ],
      cta: 'View Admin Dashboard',
      route: '/login',
      color: 'purple', 
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Built for every stakeholder
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're a student, company, or administrator, AttachPro has the tools you need
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {roles.map((role, index) => {
            const Icon = role.icon;
            
            return (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:shadow-xl hover:border-gray-300 transition-all duration-300"
              >
                
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${role.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{role.title}</h3>
                <p className="text-gray-600 mb-6">{role.description}</p>
                
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className={`w-2 h-2 bg-${role.color}-600 rounded-full flex-shrink-0`}></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <Link
                  to={role.route}
                  className={`group/cta inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${role.gradient} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 w-full justify-center sm:w-auto`}
                >
                  {role.cta}
                  <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
                </Link>
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Note */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-sm text-gray-500">
            All roles work together seamlessly • Perfect for universities, companies, and students
          </p>
        </div>
      </div>
    </section>
  );
}