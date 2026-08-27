import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export default function FloatingCard({ children, className, float = 5 }) {
  return (
    <motion.div
      animate={{ y: [0, -float, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}
    >
      {children}
    </motion.div>
  );
}
