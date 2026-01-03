// Professional Button Component System
export const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const getVariantStyles = (variant) => {
    const styles = {
      primary: {
        backgroundColor: disabled ? '#9ca3af' : '#111827',
        color: 'white',
        border: 'none',
        hover: { backgroundColor: '#374151' }
      },
      secondary: {
        backgroundColor: 'white',
        color: '#374151',
        border: '1px solid #d1d5db',
        hover: { backgroundColor: '#f9fafb' }
      },
      success: {
        backgroundColor: disabled ? '#9ca3af' : '#10b981',
        color: 'white',
        border: 'none',
        hover: { backgroundColor: '#059669' }
      },
      danger: {
        backgroundColor: disabled ? '#9ca3af' : '#ef4444',
        color: 'white',
        border: 'none',
        hover: { backgroundColor: '#dc2626' }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#6b7280',
        border: 'none',
        hover: { backgroundColor: '#f3f4f6', color: '#374151' }
      }
    };
    return styles[variant] || styles.primary;
  };

  const getSizeStyles = (size) => {
    const styles = {
      small: { padding: '6px 12px', fontSize: '12px', fontWeight: '500' },
      medium: { padding: '8px 16px', fontSize: '14px', fontWeight: '500' },
      large: { padding: '12px 24px', fontSize: '16px', fontWeight: '500' }
    };
    return styles[size] || styles.medium;
  };

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        fontFamily: 'inherit',
        outline: 'none',
        ...variantStyles,
        ...sizeStyles,
        opacity: disabled ? 0.6 : 1,
        ...props.style
      }}
      disabled={disabled}
      className={className}
      onMouseOver={(e) => {
        if (!disabled && variantStyles.hover) {
          Object.assign(e.target.style, variantStyles.hover);
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, variantStyles);
          Object.assign(e.target.style, sizeStyles);
          Object.assign(e.target.style, props.style || {});
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Icon Button
export const IconButton = ({ icon, children, ...props }) => {
  return (
    <Button {...props}>
      <span style={{ marginRight: children ? '8px' : '0' }}>{icon}</span>
      {children}
    </Button>
  );
};