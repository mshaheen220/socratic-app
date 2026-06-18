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
        <div className="error-boundary-container">
          <h2 className="error-boundary-title">Something went wrong</h2>
          <p className="error-boundary-text">
            The application encountered an unexpected error.
          </p>
          
          <button 
            onClick={this.handleClearData}
            className="nav-btn danger"
          >
            Clear Data & Reload
          </button>

          <div className="error-boundary-details">
            <p className="error-boundary-details-title">
              Error Details (share this if reporting a bug):
            </p>
            <code className="error-boundary-details-code">
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
