import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a24 0%, #000000 70%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        backgroundColor: '#0a0a0a',
        border: '1px solid #222222',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        textAlign: 'center'
      }}>
        
        {/* Minimalist Logo/Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#ffffff', 
            borderRadius: '8px',
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#000000', fontWeight: '900', fontSize: '20px' }}>P</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Placement Prep
          </h1>
          <p style={{ color: '#888888', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
            Technical interview preparation, powered by AI.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e5e5e5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
          >
            Log In
          </button>

          <button 
            onClick={() => navigate('/register')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #333333',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#666666';
              e.target.style.backgroundColor = '#111111';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#333333';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Create an Account
          </button>
        </div>

        {/* Footer Link */}
        <div style={{ marginTop: '32px', fontSize: '12px', color: '#666666' }}>
          By continuing, you agree to our Terms of Service.
        </div>

      </div>
    </div>
  );
}