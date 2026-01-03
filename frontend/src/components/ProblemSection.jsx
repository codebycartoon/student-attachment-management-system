import { AlertCircle, Users, FileText } from "lucide-react";

const problems = [
  {
    title: "For Students",
    description: "Scattered opportunities, unclear requirements, no tracking",
    icon: Users,
    color: "#2563eb"
  },
  {
    title: "For Companies", 
    description: "Manual applications, difficult screening, poor communication",
    icon: FileText,
    color: "#059669"
  },
  {
    title: "For Administrators",
    description: "Paperwork overload, no visibility, compliance headaches",
    icon: AlertCircle,
    color: "#7c3aed"
  }
];

export default function ProblemSection() {
  return (
    <section style={{ padding: '96px 0', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            The Attachment Process is Complex & Fragmented
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Current systems create friction for everyone involved in the placement process
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px',
          marginBottom: '64px'
        }}>
          {problems.map((problem) => {
            const IconComponent = problem.icon;
            return (
              <div
                key={problem.title}
                style={{ 
                  padding: '32px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: problem.color + '10',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <IconComponent size={28} style={{ color: problem.color }} />
                </div>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#111827',
                  marginBottom: '12px'
                }}>
                  {problem.title}
                </h3>
                <p style={{ 
                  color: '#6b7280',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Before/After Visual */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          gap: '32px',
          alignItems: 'center',
          padding: '48px',
          backgroundColor: '#f9fafb',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px',
              opacity: 0.6
            }}>
              📊❌
            </div>
            <h4 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#ef4444',
              marginBottom: '8px'
            }}>
              Before: Fragmented
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Multiple systems, manual processes, poor communication
            </p>
          </div>

          <div style={{ 
            width: '48px', 
            height: '48px',
            backgroundColor: '#2563eb',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            →
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px'
            }}>
              ✨📈
            </div>
            <h4 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#059669',
              marginBottom: '8px'
            }}>
              After: Centralized
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              One platform, automated workflows, clear communication
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}