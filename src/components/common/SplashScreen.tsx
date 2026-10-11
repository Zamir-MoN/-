import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoBoxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLDivElement>(null);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const dismiss = () => {
    setIsVisible(false);
    onFinishRef.current?.();
  };

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      dismiss();
      return;
    }

    // Safety timeout to ensure splash never hangs
    const safetyTimer = setTimeout(() => {
      dismiss();
    }, 2200);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(safetyTimer);
          dismiss();
        },
      });

      // 1. Initial State
      gsap.set(logoBoxRef.current, { scale: 0.6, opacity: 0 });
      gsap.set(titleRef.current, { y: 14, opacity: 0 });
      gsap.set(statusTextRef.current, { opacity: 0, y: 6 });
      gsap.set(progressBarRef.current, { scaleX: 0, transformOrigin: 'left center' });

      // 2. Logo & Rings pop-in
      tl.to(
        logoBoxRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.55,
          ease: 'back.out(1.8)',
        },
        0.05
      );

      // 3. Title reveal
      tl.to(
        titleRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
        },
        '-=0.25'
      );

      // 4. Status ticker fade in
      tl.to(
        statusTextRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: 'power1.out',
        },
        '-=0.15'
      );

      // 5. Laser progress bar fill
      tl.to(
        progressBarRef.current,
        {
          scaleX: 1,
          duration: 0.65,
          ease: 'power2.inOut',
        },
        '-=0.15'
      );

      // 6. Smooth exit transition: fade out and subtle scale
      tl.to(
        containerRef.current,
        {
          opacity: 0,
          scale: 1.04,
          duration: 0.4,
          ease: 'power2.inOut',
          delay: 0.15,
        }
      );
    });

    return () => {
      clearTimeout(safetyTimer);
      ctx.revert();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      onClick={dismiss}
      role="button"
      tabIndex={0}
      title="Click or press any key to skip"
      className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer"
    >
      {/* Background ambient radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9929EA]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#08CB00]/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Center Animated Logo Unit */}
      <div className="relative flex flex-col items-center">
        {/* Animated SVG Outer Tech Rings */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 120 120"
          >
            <defs>
              <linearGradient id="splashPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9929EA" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#9929EA" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#08CB00" stopOpacity="1" />
              </linearGradient>

              <filter id="splashGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle background static circle */}
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="#1A1A1A"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 6"
            />

            {/* Glowing animated orbiting ring */}
            <circle
              ref={ringRef}
              cx="60"
              cy="60"
              r="52"
              stroke="url(#splashPurpleGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="160 50 80 36"
              className="animate-spin-slow origin-center"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(153, 41, 234, 0.8))',
              }}
            />

            {/* Secondary pulsing counter-ring */}
            <circle
              cx="60"
              cy="60"
              r="44"
              stroke="#08CB00"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="16 16"
              className="opacity-50 animate-spin-reverse origin-center"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(8, 203, 0, 0.6))',
              }}
            />
          </svg>

          {/* Central Logo (Pure Logo, No Card Container) */}
          <div
            ref={logoBoxRef}
            className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative z-10"
          >
            <img
              src="/logo.png"
              alt="Pengo Stats"
              className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(8,203,0,0.7)]"
            />
          </div>
        </div>

        {/* Brand Name */}
        <div ref={titleRef} className="mt-5 text-center">
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center justify-center gap-0.5">
            <span>Pengo</span>
            <span className="text-[#9929EA]">Stats</span>
          </h1>
          <p className="text-[11px] font-mono text-[#66666F] mt-1 tracking-wider uppercase">
            Real-Time Monitor Dashboard
          </p>
        </div>

        {/* Laser Loading Bar */}
        <div className="mt-6 w-44 sm:w-52 h-1 bg-[#121212] rounded-full overflow-hidden border border-[#242424] relative">
          <div
            ref={progressBarRef}
            className="w-full h-full origin-left rounded-full bg-gradient-to-r from-[#9929EA] via-[#A855F7] to-[#08CB00] shadow-[0_0_12px_#9929EA]"
          />
        </div>

        {/* Status ticker */}
        <div
          ref={statusTextRef}
          className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#08CB00]"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#08CB00] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#08CB00]" />
          </span>
          <span className="tracking-widest uppercase">INITIALIZING ENGINE</span>
        </div>
      </div>
    </div>
  );
};
