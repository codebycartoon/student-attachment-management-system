import { ArrowRight, Users, Building2, BarChart3 } from "lucide-react";

export default function HeroPro() {
  return (
    <section style={{ 
      minHeight: 'calc(100vh - 4rem)', 
      display: 'flex', 
      alignItems: 'center', 
      backgroundColor: '#f9fafb' 
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 1.5rem', 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '4rem', 
        alignItems: 'center' 
      }}>
        
        {/* CONTENT */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '700', 
            color: '#111827', 
            lineHeight: '1.1',
            marginBottom: '1.5rem'
          }}>
            Manage Student Attachments <br />
            <span style={{ color: '#2563eb' }}>in One Platform</span>
          </h1>
          
          <p style={{ 
            marginTop: '1.5rem', 
            fontSize: '1.25rem', 
            color: '#6b7280', 
            maxWidth: '42rem',
            margin: '1.5rem auto'
          }}>
            A centralized system that connects students, companies, and institutions
            to manage industrial attachments with clarity, transparency, and control.
          </p>
          
          <div style={{ 
            marginTop: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '0.375rem',
                backgroundColor: '#2563eb',
                padding: '0.75rem 1.5rem',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none'
              }}
            >
              Get started
              <ArrowRight style={{ height: '1rem', width: '1rem' }} />
            </a>
            
            <a
              href="/login"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                textDecoration: 'none'
              }}
            >
              Sign in
            </a>
          </div>
          
          {/* Trust line */}
          <p style={{ 
            marginTop: '1.5rem', 
            fontSize: '0.875rem', 
            color: '#9ca3af' 
          }}>
            Built for students, companies, and university administrators.
          </p>
        </div>

        {/* VISUAL */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginTop: '3rem'
        }}>
          <div style={{ 
            borderRadius: '0.75rem', 
            border: '1px solid #e5e7eb', 
            backgroundColor: '#ffffff', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', 
            overflow: 'hidden',
            maxWidth: '32rem',
            width: '100%'
          }}>
            {/* Dashboard Header */}
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#111827',
                  margin: 0
                }}>Live Dashboard</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '0.5rem', 
                    height: '0.5rem', 
                    backgroundColor: '#10b981', 
                    borderRadius: '50%' 
                  }}></div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Live</span>
                </div>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Stats Row */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1rem', 
                marginBottom: '1.5rem' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '2rem', 
                    height: '2rem', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '0.5rem', 
                    margin: '0 auto 0.5rem auto' 
                  }}>
                    <Users style={{ height: '1rem', width: '1rem', color: '#2563eb' }} />
                  </div>
                  <div style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    color: '#111827' 
                  }}>2,847</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Students</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '2rem', 
                    height: '2rem', 
                    backgroundColor: '#dcfce7', 
                    borderRadius: '0.5rem', 
                    margin: '0 auto 0.5rem auto' 
                  }}>
                    <Building2 style={{ height: '1rem', width: '1rem', color: '#16a34a' }} />
                  </div>
                  <div style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    color: '#111827' 
                  }}>156</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Companies</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '2rem', 
                    height: '2rem', 
                    backgroundColor: '#f3e8ff', 
                    borderRadius: '0.5rem', 
                    margin: '0 auto 0.5rem auto' 
                  }}>
                    <BarChart3 style={{ height: '1rem', width: '1rem', color: '#9333ea' }} />
                  </div>
                  <div style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    color: '#111827' 
                  }}>94%</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Success Rate</div>
                </div>
              </div>
              
              {/* Recent Matches */}
              <div>
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#111827', 
                  marginBottom: '0.75rem' 
                }}>Recent Matches</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '0.5rem' 
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        color: '#111827' 
                      }}>Software Engineer</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>TechCorp Solutions</div>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      color: '#16a34a', 
                      backgroundColor: '#dcfce7', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem' 
                    }}>
                      98% match
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '0.5rem' 
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        color: '#111827' 
                      }}>Data Analyst</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>DataFlow Inc</div>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      color: '#16a34a', 
                      backgroundColor: '#dcfce7', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem' 
                    }}>
                      95% match
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
       
      </div>
    </section>
  );
}