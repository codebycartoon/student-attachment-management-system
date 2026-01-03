import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How do students get started on the platform?",
    answer: "Students can register with their university email, complete their profile with academic information, upload their CV, and immediately start browsing verified attachment opportunities from approved companies."
  },
  {
    question: "What verification process do companies go through?",
    answer: "Companies must provide their registration number and business details. Our admin team reviews each application to ensure legitimacy before approval. Only verified companies can post opportunities."
  },
  {
    question: "How does the application tracking work?",
    answer: "Students can see real-time status updates: Submitted → Under Review → Interview Scheduled → Decision Made. Both students and companies receive notifications at each stage."
  },
  {
    question: "Can administrators monitor all placements?",
    answer: "Yes, administrators have full visibility into all placements, can generate reports, approve companies, manage users, and ensure compliance with university policies."
  },
  {
    question: "Is there a cost to use the platform?",
    answer: "The platform is free for students and universities. Companies pay a small fee per successful placement to maintain the quality of the service and platform development."
  },
  {
    question: "How secure is student data?",
    answer: "We use industry-standard encryption, secure authentication, and comply with data protection regulations. Student information is only shared with companies they apply to."
  },
  {
    question: "Can the platform integrate with existing university systems?",
    answer: "Yes, we offer API integrations and can work with your IT team to connect with existing student information systems and academic databases."
  },
  {
    question: "What support is available for users?",
    answer: "We provide comprehensive onboarding, user guides, email support, and dedicated account management for universities and large companies."
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

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
            Frequently Asked Questions
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Everything you need to know about the platform and how it works
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {faqs.map((faq, index) => {
              const isOpen = openItems.has(index);
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    style={{
                      width: '100%',
                      padding: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <span>{faq.question}</span>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginLeft: '16px'
                    }}>
                      {isOpen ? (
                        <Minus size={20} style={{ color: '#6b7280' }} />
                      ) : (
                        <Plus size={20} style={{ color: '#6b7280' }} />
                      )}
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div style={{
                      padding: '0 24px 24px 24px',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        margin: '16px 0 0 0'
                      }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact CTA */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '64px',
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#111827',
            marginBottom: '8px'
          }}>
            Still have questions?
          </h3>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Our team is here to help you get started
          </p>
          <a
            href="mailto:support@attach.com"
            style={{ 
              padding: '12px 24px', 
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
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}