import { Brain, Workflow, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const valueProps = [
  {
    id: 'ai-matching',
    icon: Brain,
    title: 'The right student. The right placement. Every time.',
    description: 'AttachPro analyzes skills, preferences, requirements, and historical outcomes to automatically match students with the most suitable organizations.',
    features: ['Skills-based matching', 'Historical outcome analysis', 'Preference optimization', 'Success prediction'],
    visual: 'video',
    layout: 'left'
  },
  {
    id: 'workflows',
    icon: Workflow,
    title: 'From application to placement—without the spreadsheets.',
    description: 'Manage approvals, submissions, company feedback, and reporting in one guided workflow designed for universities and employers.',
    features: ['Guided approval process', 'Automated submissions', 'Real-time feedback', 'Integrated reporting'],
    visual: 'steps',
    layout: 'right'
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'See what\'s working. Fix what\'s not.',
    description: 'Track placement rates, employer engagement, and student outcomes with dashboards built for academic leadership.',
    features: ['Placement rate tracking', 'Employer engagement metrics', 'Student outcome analysis', 'Leadership dashboards'],
    visual: 'dashboard',
    layout: 'left'
  }
];

export default function ValueProps() {
  return (
    <section id="product" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {valueProps.map((prop, index) => (
          <div 
            key={prop.id}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32 last:mb-0 ${
              prop.layout === 'right' ? 'lg:grid-flow-col-dense' : ''
            }`}
          >
            {/* Content */}
            <div className={prop.layout === 'right' ? 'lg:col-start-2' : ''}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <prop.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-blue-600 tracking-wide">
                  {index === 0 ? 'AI-POWERED MATCHING' : index === 1 ? 'STRUCTURED WORKFLOWS' : 'REAL-TIME ANALYTICS'}
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                {prop.title}
              </h3>
              
              <p className="text-lg text-slate-700 mb-8 leading-relaxed">
                {prop.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {prop.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Learn more
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Visual */}
            <div className={prop.layout === 'right' ? 'lg:col-start-1' : ''}>
              {prop.visual === 'video' && (
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center border border-slate-200 relative overflow-hidden">
                  {/* Looping 6-second Lottie/video showing: Inputs → AI scoring → ranked matches */}
                  <div className="text-center">
                    <div className="relative">
                      <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium">AI Matching Engine</p>
                    <p className="text-sm text-slate-500">Skills → Preferences → Perfect Match</p>
                  </div>
                </div>
              )}
              
              {prop.visual === 'steps' && (
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                  <div className="space-y-6">
                    {[
                      { step: '1', title: 'Student applies', desc: 'One-click application with profile matching' },
                      { step: '2', title: 'University reviews', desc: 'Streamlined approval with smart recommendations' },
                      { step: '3', title: 'Company confirms', desc: 'Automated placement confirmation and tracking' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                          <p className="text-slate-600 text-sm">{item.desc}</p>
                          {i < 2 && (
                            <div className="w-px h-6 bg-slate-300 ml-4 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {prop.visual === 'dashboard' && (
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
                  {/* Dark-mode dashboard screenshot with glowing KPIs */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 relative">
                      <div className="absolute inset-0 bg-green-500/10 rounded-lg animate-pulse"></div>
                      <div className="relative">
                        <div className="text-2xl font-bold text-green-400">87%</div>
                        <div className="text-slate-400 text-sm">Placement Rate</div>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 relative">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-lg animate-pulse"></div>
                      <div className="relative">
                        <div className="text-2xl font-bold text-blue-400">3×</div>
                        <div className="text-slate-400 text-sm">Faster Matching</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="h-32 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-slate-600" />
                  </div>
                  
                  <p className="text-slate-400 text-center mt-4 text-sm">Real-time analytics dashboard</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}