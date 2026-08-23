export default function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
