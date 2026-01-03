import { useState } from 'react';
import { Check, ArrowRight, Star, ChevronDown, ChevronUp } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Small cohorts',
    features: [
      'Up to 50 students',
      'Core matching',
      'Limited analytics',
      'Email support',
      'Basic templates'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Growth',
    price: { monthly: 49, yearly: 41 },
    description: 'Most Popular',
    features: [
      'Unlimited students',
      'Advanced workflows',
      'Full analytics',
      'Priority support',
      'Custom branding',
      'API access',
      'Integrations'
    ],
    cta: 'Start Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'Large institutions',
    features: [
      'Custom integrations',
      'SSO & SAML',
      'Dedicated success manager',
      'SLA & compliance support',
      'White-label solution',
      'Advanced security',
      'Training included'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

const faqs = [
  {
    question: 'Is AttachPro compliant with data protection laws?',
    answer: 'Yes, AttachPro maintains SOC 2 Type II certification and is fully GDPR compliant. We use bank-level encryption and store all data in secure, geographically distributed data centers with 99.9% uptime SLA.'
  },
  {
    question: 'Can we migrate from spreadsheets?',
    answer: 'Absolutely. Our team provides complimentary data migration services for Enterprise customers, and we offer guided migration tools for Growth plans. Most universities complete their migration within 2-3 weeks.'
  },
  {
    question: 'Do employers need accounts?',
    answer: 'Employers can participate without creating accounts through our guest portal. However, companies that create accounts get access to advanced features like candidate filtering, interview scheduling, and detailed analytics.'
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'Free plans include email support and documentation. Growth plans get priority support with faster response times. Enterprise customers receive dedicated success managers, phone support, and SLA guarantees.'
  },
  {
    question: 'How quickly can we get started?',
    answer: 'Free and Growth plans are self-service and can be set up in minutes. Enterprise implementations typically take 2-4 weeks including data migration, integrations, and team training.'
  }
];

export default function PricingAnchor() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Choose the plan that fits your institution's needs
          </p>
          
          {/* Yearly toggle */}
          <div className="inline-flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setIsYearly(true)}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl border-2 p-8 ${
                plan.popular 
                  ? 'border-blue-600 shadow-xl scale-105' 
                  : 'border-slate-200 hover:border-slate-300'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  {typeof plan.price.monthly === 'number' ? (
                    <>
                      <span className="text-4xl font-bold text-slate-900">
                        ${isYearly ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span className="text-slate-600 ml-2">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price.monthly}
                    </span>
                  )}
                </div>

                <button className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'cta-primary text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}>
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 ml-2 inline" />
                </button>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-100 transition-colors focus-ring"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}