"use client";
import { useEffect, useState } from "react";

interface ViewportState {
  height: number;
}

export function useViewportHeight(): ViewportState {
  const [height, setHeight] = useState<number>(() => window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(() => {
        setHeight(window.innerHeight);
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { height };
}
