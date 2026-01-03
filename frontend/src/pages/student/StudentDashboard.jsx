import { useState } from 'react';
import { DashboardLayout, Sidebar, SidebarItem, Header, Grid } from '../../components/ui/Layout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, StatCard, StatusBadge } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';

export default function StudentDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'opportunities', label: 'Opportunities', icon: '🔍' },
    { id: 'applications', label: 'Applications', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const mockApplications = [
    { 
      id: 1, 
      company: 'TechCorp Solutions', 
      position: 'Software Engineering Intern', 
      status: 'pending', 
      appliedDate: '2024-01-15',
      location: 'Remote',
      type: 'Internship'
    },
    { 
      id: 2, 
      company: 'DataFlow Analytics', 
      position: 'Data Analyst Position', 
      status: 'under_review', 
      appliedDate: '2024-01-12',
      location: 'New York, NY',
      type: 'Full-time'
    },
    { 
      id: 3, 
      company: 'Innovation Labs', 
      position: 'Frontend Developer', 
      status: 'accepted', 
      appliedDate: '2024-01-10',
      location: 'San Francisco, CA',
      type: 'Internship'
    }
  ];

  const mockOpportunities = [
    { 
      id: 1, 
      company: 'TechCorp Solutions', 
      position: 'Backend Developer Intern', 
      location: 'Remote', 
      type: 'Internship',
      posted: '2 days ago',
      applicants: 23
    },
    { 
      id: 2, 
      company: 'Financial Services Inc', 
      position: 'Financial Analyst', 
      location: 'New York, NY', 
      type: 'Full-time',
      posted: '1 week ago',
      applicants: 45
    },
    { 
      id: 3, 
      company: 'Design Studio Pro', 
      position: 'UI/UX Designer', 
      location: 'San Francisco, CA', 
      type: 'Internship',
      posted: '3 days ago',
      applicants: 12
    }
  ];

  const sidebar = (
    <Sidebar title="Student Portal" user={user} onLogout={onLogout}>
      {navigationItems.map((item) => (
        <SidebarItem
          key={item.id}
          icon={item.icon}
          active={activeSection === item.id}
          onClick={() => setActiveSection(item.id)}
        >
          {item.label}
        </SidebarItem>
      ))}
    </Sidebar>
  );

  const getPageTitle = () => {
    const titles = {
      overview: 'Overview',
      opportunities: 'Browse Opportunities',
      applications: 'My Applications',
      profile: 'Profile',
      settings: 'Settings'
    };
    return titles[activeSection] || 'Dashboard';
  };

  const getPageDescription = () => {
    const descriptions = {
      overview: 'Track your application progress and discover new opportunities',
      opportunities: 'Find internships and full-time positions from verified companies',
      applications: 'Monitor the status of your submitted applications',
      profile: 'Manage your profile information and preferences',
      settings: 'Configure your account settings and notifications'
    };
    return descriptions[activeSection] || '';
  };

  const header = (
    <Header 
      title={getPageTitle()} 
      description={getPageDescription()}
      actions={
        activeSection === 'opportunities' ? (
          <Button variant="primary">
            Post Alert
          </Button>
        ) : null
      }
    />
  );

  const renderOverview = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Stats Grid */}
      <Grid cols={3} gap="20px">
        <StatCard
          title="Total Applications"
          value="3"
          description="Submitted this month"
          icon="📝"
        />
        <StatCard
          title="Accepted"
          value="1"
          description="Awaiting confirmation"
          icon="✅"
        />
        <StatCard
          title="In Review"
          value="2"
          description="Companies reviewing"
          icon="⏳"
        />
      </Grid>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="small" onClick={() => setActiveSection('applications')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '16px' }}>
            {mockApplications.slice(0, 3).map((app) => (
              <div key={app.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #f3f4f6'
              }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                    {app.position}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {app.company} • Applied {app.appliedDate}
                  </div>
                </div>
                <StatusBadge status={app.status}>
                  {app.status === 'pending' ? 'Pending' : 
                   app.status === 'under_review' ? 'Under Review' : 
                   app.status === 'accepted' ? 'Accepted' : 'Rejected'}
                </StatusBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <Grid cols={2} gap="12px">
            <Button variant="primary" onClick={() => setActiveSection('opportunities')}>
              Browse Opportunities
            </Button>
            <Button variant="secondary" onClick={() => setActiveSection('profile')}>
              Update Profile
            </Button>
            <Button variant="secondary">
              Upload Resume
            </Button>
            <Button variant="secondary">
              Set Job Alerts
            </Button>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );

  const renderApplications = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>Track the status of your submitted applications</CardDescription>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="small">Filter</Button>
              <Button variant="secondary" size="small">Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '20px' }}>
            {mockApplications.map((app) => (
              <div key={app.id} style={{ 
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                      {app.position}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                      {app.company} • {app.location} • {app.type}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      Applied on {app.appliedDate}
                    </p>
                  </div>
                  <StatusBadge status={app.status}>
                    {app.status === 'pending' ? 'Pending' : 
                     app.status === 'under_review' ? 'Under Review' : 
                     app.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </StatusBadge>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <Button variant="secondary" size="small">View Details</Button>
                  <Button variant="ghost" size="small">Message Company</Button>
                  {app.status === 'accepted' && (
                    <Button variant="success" size="small">Accept Offer</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOpportunities = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Search Opportunities
              </label>
              <input
                type="text"
                placeholder="Search by company, position, or keywords..."
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <select style={{ 
              padding: '10px 12px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}>
              <option>All Locations</option>
              <option>Remote</option>
              <option>New York</option>
              <option>San Francisco</option>
            </select>
            <select style={{ 
              padding: '10px 12px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}>
              <option>All Types</option>
              <option>Internship</option>
              <option>Full-time</option>
              <option>Part-time</option>
            </select>
            <Button variant="primary">Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {mockOpportunities.map((opp) => (
          <Card key={opp.id}>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                    {opp.position}
                  </h4>
                  <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 4px 0' }}>
                    {opp.company}
                  </p>
                  <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 16px 0' }}>
                    {opp.location} • {opp.type} • Posted {opp.posted} • {opp.applicants} applicants
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="success" size="medium">Apply Now</Button>
                    <Button variant="secondary" size="medium">View Details</Button>
                    <Button variant="ghost" size="medium">Save</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'applications':
        return renderApplications();
      case 'opportunities':
        return renderOpportunities();
      case 'profile':
      case 'settings':
        return (
          <Card>
            <CardContent>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>
                  {activeSection === 'profile' ? 'Profile management coming soon' : 'Settings panel coming soon'}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout sidebar={sidebar} header={header}>
      {renderContent()}
    </DashboardLayout>
  );
}