import gsap from 'gsap';

export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const animateAppEntrance = (
  containerRef: HTMLElement | null,
  headerRef: HTMLElement | null,
  statsRef: HTMLElement | null,
  contentRef: HTMLElement | null
) => {
  if (isReducedMotion() || !containerRef) return;

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.fromTo(
    containerRef,
    { opacity: 0 },
    { opacity: 1, duration: 0.35 }
  );

  if (headerRef) {
    tl.fromTo(
      headerRef,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3 },
      '-=0.2'
    );
  }

  if (statsRef && statsRef.children.length > 0) {
    tl.fromTo(
      Array.from(statsRef.children),
      { opacity: 0, y: 15, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.35,
        stagger: 0.06,
      },
      '-=0.15'
    );
  }

  if (contentRef) {
    tl.fromTo(
      contentRef,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35 },
      '-=0.2'
    );
  }

  return tl;
};

export const animateNumberTicker = (element: HTMLElement | null, endValue: number, prefix: string = '', suffix: string = '') => {
  if (!element) return;
  if (isReducedMotion()) {
    element.textContent = `${prefix}${endValue}${suffix}`;
    return;
  }

  const obj = { val: 0 };
  gsap.to(obj, {
    val: endValue,
    duration: 0.7,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
    },
  });
};

export const animateViewTransition = (container: HTMLElement | null, onComplete?: () => void) => {
  if (!container) return;
  if (isReducedMotion()) {
    if (onComplete) onComplete();
    return;
  }

  gsap.fromTo(
    container,
    { opacity: 0, y: 8 },
    {
      opacity: 1,
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
      onComplete,
    }
  );
};
