import { Shield, Zap, Users, Target, Award, Globe, CheckCircle, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <section id="about" style={{ 
      padding: '96px 0', 
      backgroundColor: '#f8fafc',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '-10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }}></div>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 32px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '80px',
          alignItems: 'center',
          marginBottom: '80px'
        }}>
          {/* Left Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '50px',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              marginBottom: '24px'
            }}>
              <Target size={16} style={{ color: '#667eea' }} />
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#667eea',
                letterSpacing: '0.5px'
              }}>
                ABOUT ATTACHPRO
              </span>
            </div>

            <h2 style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              color: '#1e293b',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              Revolutionizing Student
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Placement Programs
              </span>
            </h2>
            
            <p style={{ 
              fontSize: '18px', 
              color: '#64748b',
              lineHeight: '1.7',
              marginBottom: '32px'
            }}>
              AttachPro is a comprehensive platform designed to streamline the entire student 
              attachment process. We connect students with their dream opportunities while 
              providing universities and companies with powerful tools to manage placements efficiently.
            </p>

            <p style={{ 
              fontSize: '16px', 
              color: '#64748b',
              lineHeight: '1.6',
              marginBottom: '40px'
            }}>
              Built by education technology experts, our platform addresses the real challenges 
              faced by academic institutions, students, and employers in today's competitive 
              placement landscape.
            </p>

            {/* Key Points */}
            <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
              {[
                'Streamlined application and approval workflows',
                'Real-time tracking and communication tools',
                'Advanced analytics and reporting capabilities',
                'Secure, scalable, and user-friendly interface'
              ].map((point, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CheckCircle size={14} style={{ color: 'white' }} />
                  </div>
                  <span style={{ 
                    fontSize: '16px', 
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="#features"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
              }}
            >
              Explore Features
              <ArrowRight size={20} />
            </a>
          </div>

          {/* Right Visual - Stats & Values */}
          <div style={{ position: 'relative' }}>
            {/* Main Stats Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              zIndex: 2
            }}>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1e293b',
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                Platform Impact
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '32px',
                marginBottom: '32px'
              }}>
                {[
                  { value: '500K+', label: 'Students Connected', color: '#667eea' },
                  { value: '2,500+', label: 'Partner Companies', color: '#10b981' },
                  { value: '98%', label: 'Success Rate', color: '#f59e0b' },
                  { value: '150+', label: 'Universities', color: '#ef4444' }
                ].map((stat, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: '800', 
                      color: stat.color,
                      marginBottom: '8px'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      fontWeight: '500',
                      lineHeight: '1.4'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bars */}
              <div style={{ display: 'grid', gap: '20px' }}>
                {[
                  { label: 'Student Satisfaction', percentage: 98, color: '#667eea' },
                  { label: 'Company Retention', percentage: 95, color: '#10b981' },
                  { label: 'Placement Success', percentage: 92, color: '#f59e0b' }
                ].map((metric, index) => (
                  <div key={index}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151'
                      }}>
                        {metric.label}
                      </span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        color: metric.color
                      }}>
                        {metric.percentage}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${metric.percentage}%`,
                        height: '100%',
                        backgroundColor: metric.color,
                        borderRadius: '4px',
                        transition: 'width 1s ease-in-out'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Achievement Cards */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              zIndex: 3
            }}>
              <Award size={24} style={{ color: '#f59e0b', marginBottom: '8px' }} />
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#1e293b'
              }}>
                Industry Leader
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: '#64748b'
              }}>
                EdTech Awards 2024
              </div>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              width: '140px',
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              zIndex: 3
            }}>
              <Shield size={24} style={{ color: '#10b981', marginBottom: '8px' }} />
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#1e293b'
              }}>
                SOC 2 Certified
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: '#64748b'
              }}>
                Enterprise Security
              </div>
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div style={{
          padding: '64px 48px',
          backgroundColor: 'white',
          borderRadius: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h3 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Our Core Values
            </h3>
            <p style={{ 
              fontSize: '18px', 
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              The principles that guide everything we do at AttachPro
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '40px'
          }}>
            {[
              {
                icon: Users,
                title: 'Student-Centric',
                description: 'Every feature is designed with student success in mind, ensuring they have the best tools to find their perfect career opportunity.',
                color: '#667eea'
              },
              {
                icon: Shield,
                title: 'Trust & Security',
                description: 'We maintain the highest standards of data protection and privacy, ensuring all stakeholder information remains secure.',
                color: '#10b981'
              },
              {
                icon: Zap,
                title: 'Innovation',
                description: 'We continuously evolve our platform with cutting-edge technology to stay ahead of industry needs.',
                color: '#f59e0b'
              },
              {
                icon: Globe,
                title: 'Accessibility',
                description: 'Our platform is designed to be inclusive and accessible to users of all backgrounds and abilities.',
                color: '#ef4444'
              }
            ].map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} style={{
                  textAlign: 'center',
                  padding: '32px 24px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: `${value.color}15`,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto'
                  }}>
                    <IconComponent size={36} style={{ color: value.color }} />
                  </div>
                  <h4 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#1e293b',
                    marginBottom: '16px'
                  }}>
                    {value.title}
                  </h4>
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#64748b',
                    lineHeight: '1.6'
                  }}>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          section[id="about"] > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
            text-align: center;
          }
        }
        
        @media (max-width: 768px) {
          section[id="about"] h2 {
            font-size: 36px !important;
          }
          
          section[id="about"] > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}