import { TrendingDown, Eye, TrendingUp, Target, Clock, Users } from "lucide-react";

const benefits = [
  {
    category: "For Universities",
    icon: Eye,
    color: "#7c3aed",
    stats: [
      { value: "80%", label: "reduction in paperwork", icon: TrendingDown },
      { value: "100%", label: "visibility into placements", icon: Eye },
      { value: "60%", label: "improved success tracking", icon: TrendingUp },
      { value: "3x", label: "better company relationships", icon: Users }
    ]
  },
  {
    category: "For Companies", 
    icon: Target,
    color: "#059669",
    stats: [
      { value: "Pre-vetted", label: "student candidates", icon: Users },
      { value: "75%", label: "faster hiring process", icon: Clock },
      { value: "50%", label: "less admin burden", icon: TrendingDown },
      { value: "90%", label: "better candidate matching", icon: Target }
    ]
  },
  {
    category: "For Students",
    icon: TrendingUp,
    color: "#2563eb", 
    stats: [
      { value: "All-in-one", label: "opportunity discovery", icon: Eye },
      { value: "1-click", label: "application process", icon: Clock },
      { value: "Real-time", label: "communication channels", icon: Users },
      { value: "100%", label: "progress tracking", icon: TrendingUp }
    ]
  }
];

export default function BenefitsSection() {
  return (
    <section style={{ padding: '96px 0', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Why Choose Our Platform?
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Measurable improvements for every stakeholder in the attachment process
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '32px' 
        }}>
          {benefits.map((benefit) => {
            const CategoryIcon = benefit.icon;
            return (
              <div
                key={benefit.category}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Category Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: benefit.color + '15',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CategoryIcon size={24} style={{ color: benefit.color }} />
                  </div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#111827',
                    margin: 0
                  }}>
                    {benefit.category}
                  </h3>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gap: '20px' }}>
                  {benefit.stats.map((stat, index) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #f3f4f6'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: benefit.color + '10',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <StatIcon size={20} style={{ color: benefit.color }} />
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '20px', 
                            fontWeight: '700', 
                            color: benefit.color,
                            marginBottom: '2px'
                          }}>
                            {stat.value}
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#6b7280',
                            fontWeight: '500'
                          }}>
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '64px',
          padding: '48px',
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Ready to Transform Your Attachment Process?
          </h3>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            marginBottom: '32px',
            maxWidth: '500px',
            margin: '0 auto 32px auto'
          }}>
            Join hundreds of institutions already streamlining their placement programs
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/register"
              style={{ 
                padding: '12px 32px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Get Started Free
            </a>
            <a
              href="/login"
              style={{ 
                padding: '12px 32px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                color: '#374151', 
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: 'white',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}