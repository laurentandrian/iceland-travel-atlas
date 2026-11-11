import { useEffect, useRef, useState, type ReactNode } from "react";

// Mounts children only once the placeholder approaches the viewport (keeps maps off the critical path).
export function InView({ children, placeholder, margin = "300px" }: { children: ReactNode; placeholder: ReactNode; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (show || !ref.current) return;
    if (!("IntersectionObserver" in window)) { setShow(true); return; }
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setShow(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show, margin]);
  return <div ref={ref}>{show ? children : placeholder}</div>;
}
