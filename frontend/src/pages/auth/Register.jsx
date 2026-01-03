import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Role selection, 2: Registration form
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Here you would call your registration API
      console.log('Registration data:', { role: selectedRole, ...formData });
      // For now, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🎓</span>
              <h1 style={{ fontWeight: 'bold', fontSize: '20px', color: '#0f172a', margin: 0 }}>
                Student Attachment System
              </h1>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
              Create Account
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
              Choose your account type to get started
            </p>
          </div>

          {/* Role Selection Cards */}
          <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
            
            {/* Student Card */}
            <button
              onClick={() => handleRoleSelect('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = 'white';
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#dbeafe', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ fontSize: '24px' }}>👨‍🎓</span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>Student</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Find and apply for attachment opportunities</p>
              </div>
            </button>

            {/* Company Card */}
            <button
              onClick={() => handleRoleSelect('company')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = 'white';
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#dcfce7', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ fontSize: '24px' }}>🏢</span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>Company</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Post opportunities and hire students</p>
              </div>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => handleRoleSelect('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#8b5cf6';
                e.target.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = 'white';
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#f3e8ff', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>Administrator</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Manage the platform (invite only)</p>
              </div>
            </button>
          </div>

          {/* Back to login */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '500' }}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => setStep(1)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'none', 
              border: 'none', 
              color: '#64748b', 
              fontSize: '14px', 
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            ← Back to role selection
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>
              {selectedRole === 'student' && '👨‍🎓'}
              {selectedRole === 'company' && '🏢'}
              {selectedRole === 'admin' && '🛡️'}
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Registration
            </h2>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              onChange={handleInputChange}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={handleInputChange}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              onChange={handleInputChange}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Role-specific fields */}
          {selectedRole === 'student' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="ST2024001"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Department
                </label>
                <select
                  name="department"
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {selectedRole === 'company' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="TechCorp Inc."
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="REG123456"
                  required
                />
              </div>
              <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fbbf24' }}>
                <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                  ⚠️ Company accounts require admin approval before activation
                </p>
              </div>
            </>
          )}

          {selectedRole === 'admin' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Invite Code
              </label>
              <input
                type="text"
                name="inviteCode"
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter admin invite code"
                required
              />
            </div>
          )}

          {error && (
            <div style={{ fontSize: '14px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              backgroundColor: loading ? '#9ca3af' : '#0f172a', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxSizing: 'border-box'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}