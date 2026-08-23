export default function PageWrapper({ title, description, actions, children }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-lg font-semibold text-slate-900">{title}</h1>}
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
