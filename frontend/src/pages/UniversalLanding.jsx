import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Menu, X, Play, ArrowRight, 
  Search, Shield, Activity, Users, Building, Settings,
  TrendingUp, Zap, Database, Lock, CheckCircle, Star
} from 'lucide-react';

export default function UniversalLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Demo views for responsive visual
  const demoViews = [
    {
      role: 'Student',
      icon: Users,
      data: { name: 'Sarah Chen', action: 'Applied to Google', match: '98%' },
      color: 'blue'
    },
    {
      role: 'Company', 
      icon: Building,
      data: { name: 'TechCorp', action: 'Reviewing candidates', match: '5 matches' },
      color: 'green'
    },
    {
      role: 'Admin',
      icon: Settings,
      data: { name: 'System', action: '87% success rate', match: '2.3k active' },
      color: 'purple'
    }
  ];

  const testimonials = [
    {
      quote: "AttachPro eliminated manual placement chaos for our university.",
      author: "Dr. Sarah Johnson",
      role: "Career Services Director",
      university: "State University"
    },
    {
      quote: "We found qualified candidates 3x faster than before.",
      author: "Michael Chen",
      role: "HR Director", 
      university: "TechCorp Solutions"
    }
  ];

  useEffect(() => {
    const demoTimer = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoViews.length);
    }, 3000);

    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      clearInterval(demoTimer);
      clearInterval(testimonialTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Micro Navigation (Universal, Minimal) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: AttachPro wordmark */}
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AttachPro</span>
            </Link>

            {/* Desktop: Full nav */}
            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#product" className="hover:text-gray-900 transition-colors">Product</a>
              <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#security" className="hover:text-gray-900 transition-colors">Security</a>
            </div>

            {/* Right: CTAs */}
            <div className="flex items-center gap-3">
              {/* Secondary: Login (text) */}
              <Link 
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
              >
                Login
              </Link>
              
              {/* Primary CTA: Book Demo */}
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Book Demo
              </Link>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4">
              <div className="space-y-4">
                <a href="#product" className="block text-gray-600 hover:text-gray-900 px-2 py-1">Product</a>
                <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900 px-2 py-1">How it Works</a>
                <a href="#pricing" className="block text-gray-600 hover:text-gray-900 px-2 py-1">Pricing</a>
                <a href="#security" className="block text-gray-600 hover:text-gray-900 px-2 py-1">Security</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 2. Hero Section (Clean, Modern, Conversion-First) */}
      <section className="pt-16 min-h-screen flex items-center bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            
            {/* Headline (Short. Strong. Universal.) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              One Platform for{' '}
              <span className="text-blue-600">Every Student Placement.</span>
            </h1>
            
            {/* Subheadline (Outcome-Driven) */}
            <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              Automatically match students to real industry opportunities, manage applications, and track placements—all in one secure system.
            </p>
            
            {/* Proof Line (Single, Fast Scan) */}
            <p className="text-sm sm:text-base text-gray-500 mb-8">
              87% placement success • Role-based dashboards • Real-time tracking
            </p>
            
            {/* CTA Strategy (Conversion-Optimized) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2">
                <Play className="h-4 w-4" />
                Book Demo
              </button>
            </div>
          </div>
          
          {/* Hero Visual (Adaptive, No Redesign Needed) */}
          <div className="max-w-5xl mx-auto">
            
            {/* Mobile: Single Student Match Card */}
            <div className="block sm:hidden">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-500">Computer Science</div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Google</div>
                      <div className="text-sm text-gray-500">Software Engineer</div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      Matched
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tablet: Swipeable Carousel */}
            <div className="hidden sm:block lg:hidden">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
                <div className="flex justify-center gap-2 mb-6">
                  {['Student', 'Company', 'Admin'].map((_, index) => (
                    <div 
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentDemo === index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="min-h-[140px] flex items-center justify-center">
                  {currentDemo === 0 && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-gray-900 mb-2">Student View</div>
                      <div className="text-sm text-gray-600">Browse opportunities</div>
                      <div className="text-sm text-gray-600">Apply with one click</div>
                    </div>
                  )}
                  
                  {currentDemo === 1 && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-gray-900 mb-2">Company Review</div>
                      <div className="text-sm text-gray-600">Review applications</div>
                      <div className="text-sm text-gray-600">Select candidates</div>
                    </div>
                  )}
                  
                  {currentDemo === 2 && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Settings className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-gray-900 mb-2">Admin Analytics</div>
                      <div className="text-sm text-gray-600">System oversight</div>
                      <div className="text-sm text-gray-600">Export reports</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Desktop: Live Animated UI */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
                
                {/* Step 1: Student Applies */}
                <div className={`bg-white rounded-2xl shadow-xl border p-6 transition-all duration-1000 ${
                  currentDemo === 0 ? 'border-blue-200 shadow-blue-100 scale-105' : 'border-gray-100'
                }`}>
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      currentDemo === 0 ? 'animate-pulse' : ''
                    }`}>
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900 mb-2">Student Applies</div>
                    <div className="text-sm text-gray-600 mb-4">Sarah Chen submits application</div>
                    
                    {currentDemo === 0 && (
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Step 2: AI Matches */}
                <div className={`bg-white rounded-2xl shadow-xl border p-6 transition-all duration-1000 ${
                  currentDemo === 1 ? 'border-green-200 shadow-green-100 scale-105' : 'border-gray-100'
                }`}>
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      currentDemo === 1 ? 'animate-pulse' : ''
                    }`}>
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900 mb-2">AI Matches</div>
                    <div className="text-sm text-gray-600 mb-4">92% compatibility found</div>
                    
                    {currentDemo === 1 && (
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Analyzing...
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Step 3: Company Accepts */}
                <div className={`bg-white rounded-2xl shadow-xl border p-6 transition-all duration-1000 ${
                  currentDemo === 2 ? 'border-purple-200 shadow-purple-100 scale-105' : 'border-gray-100'
                }`}>
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      currentDemo === 2 ? 'animate-pulse' : ''
                    }`}>
                      <Building className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900 mb-2">Company Accepts</div>
                    <div className="text-sm text-gray-600 mb-4">Google reviews & approves</div>
                    
                    {currentDemo === 2 && (
                      <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                        Matched ✨
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-4">
                  {[0, 1, 2].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full transition-colors ${
                        currentDemo >= step ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                      {step < 2 && (
                        <div className={`w-12 h-0.5 transition-colors ${
                          currentDemo > step ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust Strip (Directly Under Hero) */}
      <section className="py-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">Used by universities & industry partners</p>
            
            {/* Trust Logos (Monochrome) */}
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Stanford</div>
              <div className="text-2xl font-bold text-gray-400">MIT</div>
              <div className="text-2xl font-bold text-gray-400">Google</div>
              <div className="text-2xl font-bold text-gray-400">Microsoft</div>
              <div className="text-2xl font-bold text-gray-400">Amazon</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "How It Works" (Mapped to Your Architecture) */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              From first visit to successful placement
            </h2>
          </div>

          {/* 3-Step Flow (Vertical → Horizontal) */}
          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            
            {/* Step 1: Discover */}
            <div className="relative">
              <div className="lg:text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto lg:mx-auto mb-6">
                  1
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Discover</h3>
                <p className="text-gray-600 mb-4">Students explore opportunities, companies post placements, admins monitor system health</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Students explore opportunities</li>
                  <li>• Companies post placements</li>
                  <li>• Admins monitor system health</li>
                </ul>
              </div>
            </div>

            {/* Step 2: Authenticate */}
            <div className="relative">
              <div className="lg:text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6">
                  2
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Authenticate</h3>
                <p className="text-gray-600 mb-4">Secure login / registration with role-based access (Student | Company | Admin)</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Secure login / registration</li>
                  <li>• Role-based access</li>
                  <li>• Student | Company | Admin</li>
                </ul>
              </div>
            </div>

            {/* Step 3: Operate */}
            <div className="relative">
              <div className="lg:text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6">
                  3
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Operate</h3>
                <p className="text-gray-600 mb-4">Apply, review, approve and track progress in real time</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Apply, review, approve</li>
                  <li>• Track progress in real time</li>
                  <li>• Complete workflow automation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Role-Based Value Blocks (Your Killer Advantage) */}
      <section id="role-blocks" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for every stakeholder
            </h2>
          </div>

          {/* Role Cards */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Students */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🎓 Students</h3>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li>• Browse verified opportunities</li>
                <li>• One-click applications</li>
                <li>• Track status in real time</li>
              </ul>
              
              <Link
                to="/register?role=student"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all w-full justify-center"
              >
                Try Student Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Companies */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🏢 Companies</h3>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li>• Post roles easily</li>
                <li>• Review matched candidates</li>
                <li>• Manage applications efficiently</li>
              </ul>
              
              <Link
                to="/register?role=company"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all w-full justify-center"
              >
                View Company Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Admins */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Settings className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🛠 Admins</h3>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li>• Full system oversight</li>
                <li>• Analytics & exports</li>
                <li>• Secure role management</li>
              </ul>
              
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all w-full justify-center"
              >
                View Admin Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live System Proof (Trust Layer) */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Mobile: Numbers only */}
          <div className="block lg:hidden text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Proven Results</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-1">12,000+</div>
                <div className="text-sm text-gray-600">students placed</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-1">91%</div>
                <div className="text-sm text-gray-600">match accuracy</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-purple-600 mb-1">99.9%</div>
                <div className="text-sm text-gray-600">uptime</div>
              </div>
            </div>
          </div>

          {/* Desktop: Numbers + testimonial */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Metrics */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Proven results across the board</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">12,000+</div>
                    <div className="text-gray-600">students placed</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">91%</div>
                    <div className="text-gray-600">match accuracy</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">99.9%</div>
                    <div className="text-gray-600">uptime</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Rotating testimonial */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-4xl text-blue-600 mb-4">"</div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {testimonials[currentTestimonial].quote}
              </p>
              
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
                
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      currentTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Deep Dive (Matches Your Backend) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful features that match your needs
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* AI Matching Engine */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Matching Engine</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Skill-based ranking</li>
                <li>• Smart recommendations</li>
                <li>• Live matching preview</li>
              </ul>
            </div>

            {/* Workflow Automation */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Workflow Automation</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Applications</li>
                <li>• Reviews</li>
                <li>• Approvals</li>
              </ul>
            </div>

            {/* Analytics & Monitoring */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Monitoring</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Placement stats</li>
                <li>• System health</li>
                <li>• Exportable reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Security & Compliance (Enterprise Trust) */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Enterprise-grade security
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            JWT authentication • Role-based access • Encrypted passwords • PostgreSQL relational integrity
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900">GDPR</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Lock className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900">Secure Auth</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900">99.9% SLA</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Database className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900">PostgreSQL</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing (Adaptive Simplicity) */}
      <section id="pricing" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
          </div>

          {/* Mobile: One card at a time */}
          <div className="block lg:hidden space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-4">Students & small pilots</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-500">/month</span></div>
              <Link to="/register" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center">
                Get Started
              </Link>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-600 mb-4">Universities & companies</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$99<span className="text-lg text-gray-500">/month</span></div>
              <Link to="/register" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center">
                Start Trial
              </Link>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-4">Full admin control</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">Custom</div>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>

          {/* Desktop: Side-by-side comparison */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-4">Students & small pilots</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-500">/month</span></div>
              <Link to="/register" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center">
                Get Started
              </Link>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-600 mb-4">Universities & companies</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$99<span className="text-lg text-gray-500">/month</span></div>
              <Link to="/register" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center">
                Start Trial
              </Link>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-4">Full admin control</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">Custom</div>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final CTA (Same Message, Reinforced) */}
      <section className="py-16 sm:py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start placing students smarter—today
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <Play className="h-4 w-4" />
              Book Demo
            </button>
          </div>
          
          <p className="text-blue-100">
            No credit card • Full access • Cancel anytime
          </p>
        </div>
      </section>

      {/* 10. Footer (Clean & Predictable) */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <GraduationCap className="h-6 w-6 text-blue-400" />
              <span className="font-bold">AttachPro</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2026 AttachPro — Privacy • Terms • Cookies
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}