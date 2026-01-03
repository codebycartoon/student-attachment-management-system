import { useState, useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "AttachPro eliminated manual placement chaos. We place students faster—and with better outcomes.",
    author: "Dr. Jennifer Martinez",
    role: "Career Services Director",
    company: "Public University",
    logo: "PU"
  },
  {
    quote: "The AI matching is incredibly accurate. Our placement success rate jumped from 73% to 91% in one semester.",
    author: "Michael Thompson",
    role: "Industry Relations Manager", 
    company: "State College",
    logo: "SC"
  },
  {
    quote: "Students love the real-time updates. No more 'where's my application?' emails flooding our inbox.",
    author: "Sarah Kim",
    role: "Academic Coordinator",
    company: "Tech Institute",
    logo: "TI"
  }
];

export default function SocialProofBar() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ students: 0, match: 0, nps: 0 });
  const sectionRef = useRef(null);

  // Intersection Observer for count-up animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          setIsVisible(true);
        }
      },
      { threshold: 0.6 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!isVisible) return;

    const targets = { students: 12000, match: 91, nps: 62 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts({
        students: Math.floor(targets.students * easeOut),
        match: Math.floor(targets.match * easeOut),
        nps: Math.floor(targets.nps * easeOut)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts(targets);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible]);

  // Rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const currentTest = testimonials[currentTestimonial];

  return (
    <section ref={sectionRef} className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Metrics (Count-Up Animation at 60% Visibility) */}
          <div className="grid grid-cols-3 gap-8 text-center lg:text-left">
            <div className={`count-up ${isVisible ? 'animate-in' : ''}`}>
              <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {counts.students.toLocaleString()}+
              </div>
              <div className="text-sm text-slate-600 font-medium">
                students placed
              </div>
            </div>
            
            <div className={`count-up ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {counts.match}%
              </div>
              <div className="text-sm text-slate-600 font-medium">
                average match accuracy
              </div>
            </div>
            
            <div className={`count-up ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.4s' }}>
              <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                NPS {counts.nps}
              </div>
              <div className="text-sm text-slate-600 font-medium">
                customer satisfaction
              </div>
            </div>
          </div>

          {/* Right: Rotating Testimonial */}
          <div className="relative">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {currentTest.logo}
                </div>
                
                <div className="flex-1">
                  {/* Quote */}
                  <Quote className="h-5 w-5 text-slate-400 mb-3" />
                  <blockquote className="text-slate-700 mb-4 leading-relaxed font-medium">
                    "{currentTest.quote}"
                  </blockquote>
                  
                  {/* 5-star row */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Author */}
                  <div>
                    <div className="font-semibold text-slate-900">{currentTest.author}</div>
                    <div className="text-sm text-slate-600">{currentTest.role}, {currentTest.company}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}