import { ArrowRight, Calendar, Shield } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Same headline as hero - reinforces message */}
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Match Students to Industry
          <br />
          Placements—Automatically
        </h2>
        
        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
          Start improving placement outcomes in days, not semesters.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-12">
          {/* Inline Calendly embed placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-xl border border-blue-200 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-slate-900">Book a Demo</span>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>15-minute personalized demo</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>See your use case in action</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Get implementation timeline</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Schedule Demo
            </button>
          </div>

          <div className="text-white text-lg font-medium">or</div>

          {/* Trial button */}
          <div className="text-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl inline-flex items-center gap-3">
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
            
            {/* Trust Note */}
            <div className="flex items-center justify-center gap-2 mt-4 text-blue-100">
              <Shield className="h-4 w-4" />
              <span className="text-sm">No credit card required • 14-day full access</span>
            </div>
          </div>
        </div>

        {/* Additional trust signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-white mb-2">12,000+</div>
            <div className="text-blue-200 text-sm">students placed successfully</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-2">87%</div>
            <div className="text-blue-200 text-sm">placement success rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-2">3×</div>
            <div className="text-blue-200 text-sm">faster matching process</div>
          </div>
        </div>
      </div>
    </section>
  );
}