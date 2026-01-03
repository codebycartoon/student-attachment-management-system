import { GraduationCap, Building2, ShieldCheck } from "lucide-react";

const roles = [
  {
    title: "Students",
    description: "Browse opportunities, apply for attachments, and track application status.",
    icon: GraduationCap,
  },
  {
    title: "Companies", 
    description: "Post attachment opportunities and manage student applications.",
    icon: Building2,
  },
  {
    title: "Administrators",
    description: "Approve companies, oversee placements, and manage the system.",
    icon: ShieldCheck,
  },
];

export default function Roles() {
  return (
    <section id="roles" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ 
          fontSize: '36px', 
          fontWeight: '600', 
          textAlign: 'center', 
          marginBottom: '64px',
          color: '#111827'
        }}>
          Built for Every Role
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px' 
        }}>
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <div
                key={role.title}
                style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '32px',
                  backgroundColor: 'white',
                  transition: 'box-shadow 0.2s ease-in-out'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <IconComponent 
                  size={32} 
                  style={{ color: '#2563eb', marginBottom: '16px' }} 
                />
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '500', 
                  marginBottom: '8px',
                  color: '#111827'
                }}>
                  {role.title}
                </h3>
                <p style={{ 
                  color: '#6b7280',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {role.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}