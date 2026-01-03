import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Academic Coordinator",
    institution: "University of Technology",
    content: "This platform has transformed how we manage student placements. What used to take weeks now happens in days, with complete visibility throughout the process.",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "HR Director", 
    institution: "TechCorp Solutions",
    content: "Finding quality interns was always a challenge. Now we get pre-vetted candidates and can manage the entire hiring process in one place.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Computer Science Student",
    institution: "State University",
    content: "I found my dream internship through this platform. The application process was smooth, and I could track everything in real-time.",
    rating: 5,
    avatar: "ER"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Universities & Companies
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our users say about transforming their attachment processes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-8 border border-gray-200 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-5 right-5 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Quote className="h-4 w-4 text-blue-600" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.institution}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 p-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                500+
              </div>
              <div className="text-gray-600 font-medium">
                Students Placed
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                150+
              </div>
              <div className="text-gray-600 font-medium">
                Partner Companies
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                25+
              </div>
              <div className="text-gray-600 font-medium">
                Universities
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">
                95%
              </div>
              <div className="text-gray-600 font-medium">
                Success Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}