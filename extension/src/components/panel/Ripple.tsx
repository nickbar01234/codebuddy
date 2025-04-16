import { cn } from "@cb/utils/cn";
import React from "react";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
  distanceBetweenCircles?: number;
  delay?: number;
  opacityDecrement?: number;
  unit?: string;
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  distanceBetweenCircles = 70,
  delay = 0.06,
  opacityDecrement = 0.03,
  unit = "px",
}: RippleProps) {
  return (
    <div
      className={
        "absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]"
      }
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * distanceBetweenCircles;
        const opacity = mainCircleOpacity - i * opacityDecrement;
        const animationDelay = `${i * delay}s`;
        const borderStyle = "solid";
        const borderOpacity = 5 + i * 5;

        return (
          <div
            key={i}
            className={cn(
              "animate-ripple absolute rounded-full border shadow-xl bg-foreground dark:bg-foreground/25"
            )}
            style={
              {
                width: `${size}` + unit,
                height: `${size}` + unit,
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
