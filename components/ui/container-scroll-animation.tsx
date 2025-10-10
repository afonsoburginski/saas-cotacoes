"use client";
import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Use a consistent initial value for SSR and initial client render to avoid hydration mismatch.
  // After mount, update based on viewport width.
  const [scaleRange, setScaleRange] = useState<[number, number]>([1.1, 0.98]);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setScaleRange([1.15, 0.95]);
    }
  }, []);

  const rotate = useTransform(scrollYProgress, [0.1, 0.6], [20, 0]);
  const scale = useTransform(scrollYProgress, [0.1, 0.7], scaleRange);
  const translate = useTransform(scrollYProgress, [0.1, 0.6], [0, -100]);

  return (
    <div
      className="flex items-center justify-center relative"
      ref={containerRef}
    >
      <div
        className="w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="max-w-5xl mx-auto text-center mb-10"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({ rotate, scale, translate, children }: any) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        translateY: translate,
      }}
      className="max-w-5xl mx-auto w-full border-4 border-gray-200 rounded-[30px] shadow-2xl overflow-hidden"
    >
      <div className="bg-white w-full overflow-hidden rounded-[26px]">
        {children}
      </div>
    </motion.div>
  );
};

