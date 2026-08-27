import { useEffect, useRef, useState } from "react";

export default function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const t = window.setTimeout(() => setShown(true), delay);
          io.disconnect();
          return () => window.clearTimeout(t);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const visibility = shown ? "opacity-100" : "opacity-0";

  return (
    <div ref={ref} className={"transition-opacity duration-700 ease-out " + visibility + " " + className}>
      {children}
    </div>
  );
}
