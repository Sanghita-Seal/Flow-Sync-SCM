import { cn } from "../../lib/utils";

export default function GradientCard({ children, className, gradient = "from-blue-500/10 to-purple-500/10" }) {
  return (
    <div className={cn("relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
