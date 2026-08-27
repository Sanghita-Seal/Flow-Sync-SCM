import { cn } from "../../lib/utils";

function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function SelectOption({ ...props }) {
  return <option {...props} />;
}

export { Select, SelectOption };
