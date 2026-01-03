import { 
  Users, 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  FileText, 
  Bell, 
  Search,
  Calendar,
  MessageSquare,
  Award,
  Globe,
  Lock,
  Smartphone,
  Database,
  CheckCircle
} from 'lucide-react';

const mainFeatures = [
  {
    icon: Users,
    title: 'Student Applications',
    description: 'Students can easily browse opportunities, apply with one click, and track their application status in real-time.',
    benefits: ['One-click applications', 'Real-time status tracking', 'Profile management', 'Document uploads']
  },
  {
    icon: Building2,
    title: 'Company Opportunities',
    description: 'Companies can post opportunities, manage applications, and find the perfect candidates efficiently.',
    benefits: ['Easy opportunity posting', 'Candidate filtering', 'Application management', 'Interview scheduling']
  },
  {
    icon: ShieldCheck,
    title: 'Admin Approvals',
    description: 'Administrators have complete oversight with approval workflows and comprehensive reporting.',
    benefits: ['Approval workflows', 'User management', 'System oversight', 'Compliance tracking']
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Get detailed insights into placement trends, success rates, and performance metrics.',
    benefits: ['Placement analytics', 'Success metrics', 'Trend analysis', 'Custom reports']
  }
];

const additionalFeatures = [
  { icon: Zap, title: 'AI-Powered Matching', desc: 'Smart algorithms match students with perfect opportunities' },
  { icon: Bell, title: 'Real-time Notifications', desc: 'Stay updated with instant alerts and status changes' },
  { icon: Search, title: 'Advanced Search', desc: 'Find opportunities with powerful filtering and search' },
  { icon: Calendar, title: 'Interview Scheduling', desc: 'Seamless calendar integration for interview management' },
  { icon: MessageSquare, title: 'Communication Hub', desc: 'Built-in messaging between all stakeholders' },
  { icon: FileText, title: 'Document Management', desc: 'Secure storage and sharing of important documents' },
  { icon: Award, title: 'Performance Tracking', desc: 'Monitor student progress and placement success' },
  { icon: Globe, title: 'Multi-University Support', desc: 'Manage multiple institutions from one platform' },
  { icon: Lock, title: 'Enterprise Security', desc: 'Bank-level security with data encryption' },
  { icon: Smartphone, title: 'Mobile Responsive', desc: 'Full functionality on all devices and screen sizes' },
  { icon: Database, title: 'Data Export', desc: 'Export data in multiple formats for reporting' },
  { icon: CheckCircle, title: 'Compliance Ready', desc: 'Built-in compliance with educational standards' }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600 tracking-wide">
            POWERFUL FEATURES
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
          Everything You Need for
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Successful Placements
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          A comprehensive platform designed to streamline every aspect of student attachment management, 
          from application to placement success.
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mainFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Benefits List */}
                <div className="space-y-3">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gray-50 rounded-3xl p-12 border border-gray-200">
          <div className="text-center mb-14">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Plus Many More Features
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover additional capabilities that make AttachPro the most comprehensive 
              student placement platform available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="text-center p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Placement Process?
          </h3>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of universities and companies already using AttachPro 
            to streamline their student placement programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Start Free Trial
              <CheckCircle className="h-5 w-5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white rounded-lg font-semibold border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Contact Sales
              <MessageSquare className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}