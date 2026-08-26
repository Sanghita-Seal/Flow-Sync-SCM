export default function LoadingSpinner({ size = 20 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
