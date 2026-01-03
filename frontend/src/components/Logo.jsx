import { GraduationCap, Zap } from "lucide-react";

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Modern Logo Icon */}
      <div style={{ 
        position: 'relative',
        width: '36px',
        height: '36px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <GraduationCap size={20} style={{ color: 'white' }} />
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '12px',
          height: '12px',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white'
        }}>
          <Zap size={6} style={{ color: 'white' }} />
        </div>
      </div>
      
      {/* Brand Name */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ 
          fontSize: '24px', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px'
        }}>
          Attach
        </span>
        <span style={{
          fontSize: '10px',
          fontWeight: '600',
          color: '#f093fb',
          marginLeft: '4px',
          marginTop: '-8px'
        }}>
          PRO
        </span>
      </div>
    </div>
  );
}