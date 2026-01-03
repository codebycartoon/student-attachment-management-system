import { Shield, Lock, Globe, Zap, CheckCircle } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'SOC 2 Type II',
    subtitle: 'Certified',
    description: 'Annual security audits'
  },
  {
    icon: Globe,
    title: 'GDPR',
    subtitle: 'Compliant',
    description: 'EU data protection'
  },
  {
    icon: Zap,
    title: '99.9% SLA',
    subtitle: 'Uptime',
    description: 'Enterprise reliability'
  },
  {
    icon: Lock,
    title: 'SSO Ready',
    subtitle: 'Integration',
    description: 'SAML & OAuth support'
  }
];

export default function RiskReversal() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Enterprise badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="enterprise-badge bg-white rounded-xl p-6 text-center border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <badge.icon className="h-6 w-6 text-slate-700" />
              </div>
              <div className="font-semibold text-slate-900 mb-1">{badge.title}</div>
              <div className="text-sm text-blue-600 font-medium mb-2">{badge.subtitle}</div>
              <div className="text-xs text-slate-600">{badge.description}</div>
            </div>
          ))}
        </div>

        {/* Security statement */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 border border-slate-200 shadow-sm">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-slate-700 font-medium">
              Bank-level security for your data and your students.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}