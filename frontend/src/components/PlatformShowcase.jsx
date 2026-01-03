import { GraduationCap, Building2, ShieldCheck, Search, FileCheck, BarChart3, MessageSquare, Calendar, Users } from "lucide-react";

const experiences = [
  {
    title: "Student Experience",
    subtitle: "Find & Apply for Attachments",
    icon: GraduationCap,
    color: "#2563eb",
    features: [
      { icon: Search, text: "Browse verified opportunities" },
      { icon: FileCheck, text: "One-click applications" },
      { icon: BarChart3, text: "Real-time status tracking" },
      { icon: FileCheck, text: "Document management (CV, transcripts)" },
      { icon: MessageSquare, text: "Company reviews & ratings" }
    ],
    mockup: {
      title: "Student Dashboard",
      stats: [
        { label: "Applications", value: "12" },
        { label: "Interviews", value: "3" },
        { label: "Offers", value: "1" }
      ],
      recentActivity: [
        "Applied to TechCorp - Software Intern",
        "Interview scheduled with DataFlow",
        "Offer received from Innovation Labs"
      ]
    }
  },
  {
    title: "Company Experience", 
    subtitle: "Hire Top Student Talent",
    icon: Building2,
    color: "#059669",
    features: [
      { icon: FileCheck, text: "Post attachment opportunities" },
      { icon: Users, text: "Review & filter applications" },
      { icon: Calendar, text: "Schedule interviews" },
      { icon: Users, text: "Manage multiple students" },
      { icon: BarChart3, text: "Compliance dashboard" }
    ],
    mockup: {
      title: "Company Portal",
      stats: [
        { label: "Active Posts", value: "5" },
        { label: "Applications", value: "47" },
        { label: "Hired", value: "8" }
      ],
      recentActivity: [
        "New application for Backend Developer",
        "Interview completed - Sarah Johnson",
        "Offer accepted by Michael Chen"
      ]
    }
  },
  {
    title: "Admin Experience",
    subtitle: "Oversee & Coordinate Placements", 
    icon: ShieldCheck,
    color: "#7c3aed",
    features: [
      { icon: FileCheck, text: "Approve companies & opportunities" },
      { icon: BarChart3, text: "Monitor all placements" },
      { icon: FileCheck, text: "Generate reports" },
      { icon: MessageSquare, text: "Handle conflicts" },
      { icon: ShieldCheck, text: "Ensure compliance" }
    ],
    mockup: {
      title: "Admin Panel",
      stats: [
        { label: "Total Users", value: "1,247" },
        { label: "Active Placements", value: "89" },
        { label: "Pending Approvals", value: "12" }
      ],
      recentActivity: [
        "New company registration - TechStart Inc",
        "Placement completed - John Doe at DataCorp",
        "Compliance report generated"
      ]
    }
  }
];

export default function PlatformShowcase() {
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
            One Platform, Three Perfect Experiences
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Tailored interfaces designed specifically for each user type
          </p>
        </div>

        <div style={{ display: 'grid', gap: '48px' }}>
          {experiences.map((exp, index) => {
            const IconComponent = exp.icon;
            const isReversed = index % 2 === 1;
            
            return (
              <div
                key={exp.title}
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: isReversed ? '1fr 1fr' : '1fr 1fr',
                  gap: '48px',
                  alignItems: 'center'
                }}
              >
                {/* Content */}
                <div style={{ order: isReversed ? 2 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: exp.color,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <IconComponent size={28} />
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#111827',
                        margin: '0 0 4px 0'
                      }}>
                        {exp.title}
                      </h3>
                      <p style={{ 
                        fontSize: '16px', 
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {exp.subtitle}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    {exp.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FeatureIcon size={16} style={{ color: exp.color }} />
                          <span style={{ fontSize: '16px', color: '#374151' }}>
                            {feature.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mockup */}
                <div style={{ order: isReversed ? 1 : 2 }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}>
                    {/* Mockup Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '20px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#ef4444', 
                        borderRadius: '50%' 
                      }}></div>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#f59e0b', 
                        borderRadius: '50%' 
                      }}></div>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#10b981', 
                        borderRadius: '50%' 
                      }}></div>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#6b7280',
                        marginLeft: '12px'
                      }}>
                        {exp.mockup.title}
                      </span>
                    </div>

                    {/* Stats */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '16px',
                      marginBottom: '20px'
                    }}>
                      {exp.mockup.stats.map((stat, idx) => (
                        <div key={idx} style={{ textAlign: 'center' }}>
                          <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '700', 
                            color: exp.color,
                            marginBottom: '4px'
                          }}>
                            {stat.value}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#6b7280',
                            fontWeight: '500'
                          }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151',
                        marginBottom: '12px'
                      }}>
                        Recent Activity
                      </h4>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {exp.mockup.recentActivity.map((activity, idx) => (
                          <div key={idx} style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            padding: '8px 12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            borderLeft: `3px solid ${exp.color}`
                          }}>
                            {activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}