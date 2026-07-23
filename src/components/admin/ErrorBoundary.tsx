import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/**
 * Catches render-time exceptions in the admin tree. The dashboard mounts as
 * `client:only` with no server fallback, so without this any unhandled throw
 * during render would unmount the whole app and leave a blank white page.
 * Here it degrades to a readable message + a reload escape hatch instead.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the stack in the console for debugging the crash.
    console.error('Admin render crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4 py-16">
        <div className="w-full max-w-md bg-surface border-l-4 border-red-500 p-8 md:p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-red-600 font-semibold mb-3">Admin</p>
          <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink leading-tight">Something went wrong.</h1>
          <p className="mt-3 text-sm text-ink/65">
            The dashboard hit an unexpected error and stopped rendering. Your data is safe — reload to continue.
          </p>
          <p className="mt-4 text-xs font-mono text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 break-words">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
