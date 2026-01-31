import { useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function useAnimatedNumber(value) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, {
    stiffness: 10,
    damping: 5,
    mass: 1,
    restDelta: 0.01,
    restSpeed: 0.01
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return spring;
}

export function useAnimatedPercentage(value, total) {
    const motionValue = useMotionValue(value);
    const totalMotionValue = useMotionValue(total);
    const spring = useSpring(motionValue, {
      stiffness: 10,
      damping: 5,
      mass: 1,
      restDelta: 0.01,
      restSpeed: 0.01
    });

    useEffect(() => {
      motionValue.set(value);
      totalMotionValue.set(total);
    }, [value, total, motionValue, totalMotionValue]);

    const percentage = useTransform([spring, useSpring(totalMotionValue)], ([v, t]) =>
      t > 0 ? Math.round((v / t) * 100) : 0
    );

    return percentage;
}
