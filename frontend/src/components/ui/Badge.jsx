import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-slate-900 text-slate-50",
  secondary: "bg-slate-100 text-slate-900",
  destructive: "bg-rose-500 text-slate-50",
  outline: "text-slate-950 border border-slate-200",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  blue: "bg-blue-100 text-blue-700",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
