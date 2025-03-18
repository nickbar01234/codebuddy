import React, { useEffect, useRef, useState } from "react";

export const Ripple = React.memo(function Ripple({
  numCircles = 8,
  mainCircleOpacity = 0.24,
}: {
  numCircles?: number;
  mainCircleOpacity?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mainCircleSize, setMainCircleSize] = useState(210);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        setMainCircleSize(height * 0.2); // Adjust the scaling factor as needed
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]"
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * (mainCircleSize * 0.33);
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 5 + i * 5;

        return (
          <div
            key={i}
            className={`animate-ripple bg-foreground/25 absolute rounded-full border shadow-xl [--i:${i}]`}
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: "1px",
                borderColor: `hsl(var(--foreground), ${borderOpacity / 100})`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
});
