"use client";
import React, { useEffect, useRef, useState } from "react";

/**
 * Renders children at a fixed "paper" width and scales them down to fit the container.
 * Used for live editor preview and template gallery thumbnails.
 */
export default function ScaledPreview({
  children,
  paperWidth = 860,
  maxHeight,
  className = "",
}: {
  children: React.ReactNode;
  paperWidth?: number;
  maxHeight?: number;
  className?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const update = () => {
      const s = Math.min(1, outer.clientWidth / paperWidth);
      setScale(s);
      setHeight(inner.scrollHeight * s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [paperWidth]);

  return (
    <div
      ref={outerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: maxHeight ? Math.min(height, maxHeight) : height }}
    >
      <div
        ref={innerRef}
        className="absolute left-0 top-0 origin-top-left bg-white text-left"
        style={{ width: paperWidth, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
