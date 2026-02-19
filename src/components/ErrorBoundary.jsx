import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleClearData = () => {
    if (window.confirm('This will clear your local history to fix the error. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          maxWidth: '600px', 
          margin: '2rem auto', 
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: 'var(--surface, white)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#ef4444', marginTop: 0 }}>Something went wrong</h2>
          <p style={{ color: '#374151', marginBottom: '1.5rem' }}>
            The application encountered an unexpected error.
          </p>
          
          <button 
            onClick={this.handleClearData}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Clear Data & Reload
          </button>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: '#f3f4f6', 
            borderRadius: '6px',
            textAlign: 'left',
            overflow: 'auto'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280' }}>
              Error Details (share this if reporting a bug):
            </p>
            <code style={{ fontSize: '0.8rem', color: '#ef4444', display: 'block' }}>
              {this.state.error?.toString()}
            </code>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
