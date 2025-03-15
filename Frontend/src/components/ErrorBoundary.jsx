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
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border-2 border-red-200 bg-red-50 rounded-xl">
          <h3 className="text-lg font-semibold text-red-700">Something went wrong</h3>
          <p className="text-red-600">{this.state.error?.toString()}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import ErrorBoundary from '../components/ErrorBoundary';

<ErrorBoundary>
  <div className="prose prose-indigo max-w-none">
    {renderMarkdownContent(msg.text)}
  </div>
</ErrorBoundary>