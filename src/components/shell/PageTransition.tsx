import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [key, setKey] = useState(loc.pathname);
  useEffect(() => { setKey(loc.pathname); }, [loc.pathname]);
  return (
    <div key={key} className="animate-rise-in">
      {children}
    </div>
  );
}
