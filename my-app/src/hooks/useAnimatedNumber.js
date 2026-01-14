import { useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

// Custom hook to animate a number
export function useAnimatedNumber(value) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, {
    stiffness: 10, // Even lower stiffness for much slower animation
    damping: 5,     // Even lower damping
    mass: 1,
    restDelta: 0.01,
    restSpeed: 0.01
  });

  // Update the motion value when the target value changes
  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return spring;
}

// Custom hook to animate a number and format it as a percentage
export function useAnimatedPercentage(value, total) {
    const motionValue = useMotionValue(value);
    const totalMotionValue = useMotionValue(total);
    const spring = useSpring(motionValue, {
      stiffness: 10, // Even lower stiffness for much slower animation
      damping: 5,     // Even lower damping
      mass: 1,
      restDelta: 0.01,
      restSpeed: 0.01
    });

    // Update the motion value when the target value changes
    useEffect(() => {
      motionValue.set(value);
      totalMotionValue.set(total);
    }, [value, total, motionValue, totalMotionValue]);

    // Calculate percentage from animated values
    const percentage = useTransform([spring, useSpring(totalMotionValue)], ([v, t]) =>
      t > 0 ? Math.round((v / t) * 100) : 0
    );

    return percentage;
}
