"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <div className={cn("relative p-[6px] group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-100 group-hover:opacity-100 blur-md transition duration-500 will-change-transform",
          " bg-[radial-gradient(circle_farthest-side_at_0_100%,rgba(16,185,129,0.95),transparent),radial-gradient(circle_farthest-side_at_100%_0,rgba(135,206,235,0.9),transparent),radial-gradient(circle_farthest-side_at_100%_100%,rgba(34,197,94,0.85),transparent),radial-gradient(circle_farthest-side_at_0_0,rgba(173,216,230,0.8),transparent),radial-gradient(circle_farthest-side_at_50%_50%,rgba(80,200,120,0.7),transparent),radial-gradient(circle_farthest-side_at_25%_75%,rgba(144,238,144,0.6),transparent)]"
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-95 will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,rgba(16,185,129,0.85),transparent),radial-gradient(circle_farthest-side_at_100%_0,rgba(135,206,235,0.8),transparent),radial-gradient(circle_farthest-side_at_100%_100%,rgba(34,197,94,0.75),transparent),radial-gradient(circle_farthest-side_at_0_0,rgba(173,216,230,0.7),transparent),radial-gradient(circle_farthest-side_at_50%_50%,rgba(80,200,120,0.65),transparent),radial-gradient(circle_farthest-side_at_25%_75%,rgba(144,238,144,0.55),rgba(20,19,22,0.2))]"
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
