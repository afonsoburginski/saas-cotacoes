"use client";
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface VerticalInfiniteCardsProps {
  items: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    color: string;
  }[];
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
}

export function VerticalInfiniteCards({
  items,
  speed = "slow",
  pauseOnHover = true,
}: VerticalInfiniteCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      // Duplicamos 1x para um loop contínuo perfeito com translateY(-50%)
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getSpeed();
      setStart(true);
    }
  }

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "28s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "56s");
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let rafId = 0;
    const minScale = 0.85;
    const maxScale = 1.088; // próximo ao valor do exemplo

    const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep

    const frame = () => {
      const container = containerRef.current!;
      const cards = scrollerRef.current?.querySelectorAll<HTMLElement>('.feature-card') || [];
      const rect = container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const cardCenter = r.top + r.height / 2;
        const distance = Math.abs(cardCenter - centerY);

        // normaliza dist para 0..1 (0 = centro, 1 = periferia)
        const norm = Math.min(distance / (rect.height * 0.75), 1);
        const closeness = 1 - norm; // 1 no centro
        const t = ease(closeness);

        const scale = minScale + (maxScale - minScale) * t;
        const opacity = 0.85 + 0.15 * t;
        const blur = 0.15 * (1 - t);
        const shadowStrong = 40 * t; // intensidade
        // Azul claro progressivo (sem puxar para rosa)
        const red = Math.round(245 - 10 * t);
        const green = Math.round(248 - 6 * t);
        const blue = 255;

        const inner = card.querySelector<HTMLElement>('.feature-card-inner');
        if (inner) {
          inner.style.transform = `scale(${scale.toFixed(6)})`;
          inner.style.opacity = opacity.toFixed(3);
          inner.style.filter = `blur(${blur.toFixed(2)}px)`;
          inner.style.boxShadow = `0 24px ${Math.max(22, shadowStrong)}px -18px rgba(0, 82, 255, ${0.22 + 0.18 * t})`;
          // Azul claro apenas no miolo do card
          inner.style.background = `linear-gradient(90deg, rgba(${red}, ${green}, ${blue}, ${0.55 * t}) 0%, rgba(${red}, ${green}, ${blue}, ${0.35 * t}) 40%, rgba(${red}, ${green}, ${blue}, ${0.55 * t}) 100%)`;
          inner.style.zIndex = t > 0.6 ? '2' : t > 0.3 ? '1' : '0';
        }
        // Mantém a borda sempre visível e nítida
        card.style.borderColor = 'rgb(229, 231, 235)';
        card.style.backgroundColor = 'white';
      });

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [start]);

  return (
    <div
      ref={containerRef}
      className="relative h-[320px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white_20%,white_80%,transparent)]"
    >
      <div
        ref={scrollerRef}
        className={cn(
          "relative z-0 flex flex-col gap-2 w-full",
          start && "animate-vertical-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="feature-card relative rounded-lg border border-gray-200 bg-white flex-shrink-0 overflow-hidden"
          >
            <div className="feature-card-inner rounded-md p-2.5 bg-white transition-[transform,box-shadow,opacity,filter,background] duration-500 ease-out will-change-transform">
              <div className="flex items-start gap-2.5">
                <div className={`${item.color} rounded-lg p-1.5 w-8 h-8 flex-shrink-0`}>
                  <item.icon className="w-full h-full text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[11px] font-bold text-gray-900 mb-0.5 font-marlin leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[9px] text-gray-600 leading-snug font-montserrat line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Fades nas bordas (topo/baixo/esq/dir) para simular a máscara do exemplo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent z-10"></div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent z-10"></div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent z-10"></div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent z-10"></div>

      {/* Central highlight removed per request */}
    </div>
  );
}

