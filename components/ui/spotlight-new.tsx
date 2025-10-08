"use client"

import React from "react"

type CSSVars = React.CSSProperties & { [key: string]: string | number }

type SpotlightProps = {
  gradientFirst?: string
  gradientSecond?: string
  gradientThird?: string
  translateY?: number
  width?: number
  height?: number
  smallWidth?: number
  duration?: number
  xOffset?: number
  className?: string
}

export function Spotlight({
  gradientFirst =
    "radial-gradient(60% 70% at 50% 50%, hsla(152, 85%, 65%, .35) 0%, hsla(152, 80%, 60%, .28) 15%, hsla(152, 75%, 55%, .22) 30%, hsla(152, 70%, 50%, .18) 45%, hsla(152, 65%, 45%, .12) 60%, hsla(152, 60%, 40%, .08) 75%, hsla(152, 55%, 35%, .04) 90%, transparent 100%)",
  gradientSecond =
    "radial-gradient(60% 70% at 50% 50%, hsla(210, 95%, 70%, .35) 0%, hsla(210, 90%, 65%, .28) 15%, hsla(210, 85%, 60%, .22) 30%, hsla(210, 80%, 55%, .18) 45%, hsla(210, 75%, 50%, .12) 60%, hsla(210, 70%, 45%, .08) 75%, hsla(210, 65%, 40%, .04) 90%, transparent 100%)",
  gradientThird =
    "radial-gradient(50% 50% at 50% 50%, hsla(186, 85%, 70%, .25) 0%, hsla(186, 80%, 65%, .18) 20%, hsla(186, 75%, 60%, .12) 40%, hsla(186, 70%, 55%, .08) 60%, hsla(186, 65%, 50%, .05) 80%, transparent 100%)",
  translateY = 0,
  width = 760,
  height = 980,
  smallWidth = 200,
  duration = 7,
  xOffset = 80,
  className,
}: SpotlightProps) {
  return (
    <div className={"pointer-events-none absolute inset-0 " + (className ?? "")}
      aria-hidden
    >
      {/* Left main spotlight */}
      <div
        className="absolute opacity-90"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: gradientFirst,
          filter: "blur(40px)",
          borderRadius: "50%",
          willChange: "transform",
          animation: `oscillateLeft ${duration}s ease-in-out infinite alternate`,
          mixBlendMode: "screen",
          "--tx": `${xOffset}px`,
          "--ty": `${translateY}px`,
          "--rot": "-12deg",
          left: "12%",
          top: "auto",
          bottom: "-100px",
          transform: `rotate(-12deg) translateY(${translateY}px)`,
        } as CSSVars}
      />

      {/* Right main spotlight */}
      <div
        className="absolute opacity-90"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: gradientSecond,
          filter: "blur(40px)",
          borderRadius: "50%",
          willChange: "transform",
          animation: `oscillateRight ${duration}s ease-in-out infinite alternate`,
          mixBlendMode: "screen",
          "--tx": `${xOffset}px`,
          "--ty": `${translateY}px`,
          "--rot": "12deg",
          right: "12%",
          top: "auto",
          bottom: "-100px",
          transform: `rotate(12deg) translateY(${translateY}px)`,
        } as CSSVars}
      />

      {/* Subtle small accent spots */}
      <div
        className="absolute left-[10%] top-[10%] opacity-80"
        style={{
          width: `${smallWidth}px`,
          height: `${smallWidth}px`,
          backgroundImage: gradientThird,
          filter: "blur(30px)",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute right-[12%] top-[16%] opacity-80"
        style={{
          width: `${smallWidth}px`,
          height: `${smallWidth}px`,
          backgroundImage: gradientThird,
          filter: "blur(30px)",
          borderRadius: "50%",
        }}
      />

      {/* Central accent to ensure visible meet */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"
        style={{
          width: `${Math.round(width * 0.45)}px`,
          height: `${Math.round(width * 0.45)}px`,
          backgroundImage: gradientThird,
          filter: "blur(40px)",
          borderRadius: "50%",
          mixBlendMode: "screen",
        }}
      />

      {/* keyframes */}
      <style jsx>{`
        @keyframes oscillateLeft {
          from { transform: rotate(var(--rot)) translateX(0) translateY(var(--ty)); }
          to { transform: rotate(var(--rot)) translateX(var(--tx)) translateY(var(--ty)); }
        }
        @keyframes oscillateRight {
          from { transform: rotate(var(--rot)) translateX(0) translateY(var(--ty)); }
          to { transform: rotate(var(--rot)) translateX(calc(var(--tx) * -1)) translateY(var(--ty)); }
        }
      `}</style>
    </div>
  )
}

export default Spotlight


