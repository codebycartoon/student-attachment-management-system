import { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';

export default function LiveSystemProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      quote: "AttachPro eliminated manual placement chaos for our university.",
      author: "Dr. Sarah Johnson",
      role: "Career Services Director",
      university: "State University",
      rating: 5
    },
    {
      quote: "We found qualified candidates 3x faster than traditional methods.",
      author: "Michael Chen", 
      role: "HR Director",
      university: "TechCorp Solutions",
      rating: 5
    },
    {
      quote: "The analytics dashboard gives us insights we never had before.",
      author: "Lisa Rodriguez",
      role: "System Administrator", 
      university: "Regional College",
      rating: 5
    }
  ];

  const metrics = [
    {
      icon: Users,
      value: '12,000+',
      label: 'students placed',
      color: 'blue'
    },
    {
      icon: TrendingUp, 
      value: '91%',
      label: 'match accuracy',
      color: 'green'
    },
    {
      icon: Zap,
      value: '99.9%',
      label: 'uptime',
      color: 'purple'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Mobile: Numbers Only */}
        <div className="block lg:hidden">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Trusted by thousands
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const colorClasses = {
                blue: 'text-blue-600 bg-blue-100',
                green: 'text-green-600 bg-green-100', 
                purple: 'text-purple-600 bg-purple-100'
              };
              
              return (
                <div key={index} className="text-center bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 ${colorClasses[metric.color]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{metric.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: Numbers + Testimonial */}
        <div className="hidden lg:block">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Metrics */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                Proven results across the board
              </h2>
              
              <div className="space-y-6">
                {metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  const colorClasses = {
                    blue: 'text-blue-600 bg-blue-100',
                    green: 'text-green-600 bg-green-100',
                    purple: 'text-purple-600 bg-purple-100'
                  };
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colorClasses[metric.color]}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                        <div className="text-gray-600">{metric.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Right: Rotating Testimonial */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                
                {/* Quote */}
                <div className="mb-6">
                  <div className="text-4xl text-blue-600 mb-4">"</div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {testimonials[currentTestimonial].quote}
                  </p>
                </div>
                
                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonials[currentTestimonial].university}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <div key={i} className="w-5 h-5 text-yellow-400">★</div>
                    ))}
                  </div>
                </div>
                
                {/* Testimonial Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-500 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}