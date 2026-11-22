import React from 'react';

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white border border-[#E9E1D5] p-8 text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-[#C5A46D] font-medium">
              AKSHARA LIFESTYLE
            </p>
            <h1 className="mt-3 font-editorial text-3xl text-[#171717]">
              Something interrupted your view
            </h1>
            <p className="mt-3 text-sm text-[#85817B] leading-relaxed">
              {this.state.message || 'An unexpected interface error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase hover:bg-[#0B0B0B] transition-colors"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
