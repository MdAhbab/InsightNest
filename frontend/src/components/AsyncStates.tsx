type LoadingProps = { label?: string };

export const Loading = ({ label = "Loading…" }: LoadingProps) => (
  <div className="async-loading" role="status" aria-label={label}>
    <span className="async-spinner" aria-hidden="true" />
    <span className="async-loading-text">{label}</span>
  </div>
);

type ErrorStateProps = { message?: string; retry?: () => void };

export const ErrorState = ({ message = "Something went wrong.", retry }: ErrorStateProps) => (
  <div className="async-error">
    <p className="async-error-msg">{message}</p>
    {retry && (
      <button type="button" className="btn btn-ghost" onClick={retry}>
        Try again
      </button>
    )}
  </div>
);

type EmptyStateProps = { title?: string; hint?: string };

export const EmptyState = ({ title = "Nothing here yet.", hint }: EmptyStateProps) => (
  <div className="async-empty">
    <p className="async-empty-title">{title}</p>
    {hint && <p className="async-empty-hint">{hint}</p>}
  </div>
);
