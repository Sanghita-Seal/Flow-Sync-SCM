import { useState, useRef } from "react";
import { cn } from "../../lib/utils";

export default function SpotlightCard({ children, className, spotlightColor = "rgba(59, 130, 246, 0.1)" }) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden", className)}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 rounded-xl"
        style={{
          opacity,
          background: `radial-gradient(250px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
