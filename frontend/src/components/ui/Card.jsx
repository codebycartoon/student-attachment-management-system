// Professional Card Component System
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        ...props.style
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      style={{
        padding: '20px 24px 16px 24px',
        borderBottom: '1px solid #f3f4f6',
        ...props.style
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      style={{
        padding: '20px 24px',
        ...props.style
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 
      style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        margin: 0,
        lineHeight: '1.5',
        ...props.style
      }}
      className={className}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p 
      style={{
        fontSize: '14px',
        color: '#6b7280',
        margin: '4px 0 0 0',
        lineHeight: '1.5',
        ...props.style
      }}
      className={className}
      {...props}
    >
      {children}
    </p>
  );
};

// Stat Card for metrics
export const StatCard = ({ title, value, description, icon, trend, ...props }) => {
  return (
    <Card {...props}>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
              {title}
            </p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              {value}
            </p>
            {description && (
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Status Badge Component
export const StatusBadge = ({ status, children, ...props }) => {
  const getStatusStyles = (status) => {
    const styles = {
      pending: { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fbbf24' },
      accepted: { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#10b981' },
      rejected: { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#ef4444' },
      active: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#3b82f6' },
      inactive: { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#9ca3af' },
      default: { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#9ca3af' }
    };
    return styles[status] || styles.default;
  };

  const statusStyles = getStatusStyles(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '500',
        border: `1px solid ${statusStyles.borderColor}`,
        backgroundColor: statusStyles.backgroundColor,
        color: statusStyles.color,
        ...props.style
      }}
      {...props}
    >
      {children}
    </span>
  );
};