export default function PageWrapper({ title, description, actions, children }) {
  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-5">
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {title && <h1 className="text-lg font-semibold text-slate-900">{title}</h1>}
            {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
