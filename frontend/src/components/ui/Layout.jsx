// Professional Layout Components
export const DashboardLayout = ({ children, sidebar, header }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex' }}>
      {sidebar}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {header}
        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export const Sidebar = ({ children, title, user, onLogout }) => {
  return (
    <div style={{ 
      width: '280px', 
      backgroundColor: 'white', 
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {/* Logo/Title */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#111827',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            S
          </div>
          <span style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>
            {title}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {children}
      </nav>

      {/* User Section */}
      {user && (
        <div style={{ padding: '20px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#6b7280',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export const SidebarItem = ({ icon, children, active = false, onClick, ...props }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px 20px',
        border: 'none',
        backgroundColor: active ? '#f3f4f6' : 'transparent',
        color: active ? '#111827' : '#6b7280',
        fontSize: '14px',
        fontWeight: active ? '500' : '400',
        cursor: 'pointer',
        textAlign: 'left',
        borderRight: active ? '3px solid #111827' : 'none',
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.target.style.backgroundColor = '#f9fafb';
          e.target.style.color = '#374151';
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#6b7280';
        }
      }}
      {...props}
    >
      {icon && <span style={{ fontSize: '16px', minWidth: '16px' }}>{icon}</span>}
      {children}
    </button>
  );
};

export const Header = ({ title, description, actions, ...props }) => {
  return (
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '20px 24px',
      ...props.style 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 4px 0',
            lineHeight: '1.3'
          }}>
            {title}
          </h1>
          {description && (
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: 0,
              lineHeight: '1.4'
            }}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export const PageContainer = ({ children, maxWidth = '1200px', ...props }) => {
  return (
    <div style={{ 
      maxWidth, 
      margin: '0 auto', 
      width: '100%',
      ...props.style 
    }}>
      {children}
    </div>
  );
};

export const Grid = ({ children, cols = 1, gap = '20px', ...props }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
      ...props.style
    }}>
      {children}
    </div>
  );
};