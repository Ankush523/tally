import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';

/** Respects system Reduce Motion (iOS/Android) for optional animation gating */
export function useReducedMotionPreference(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => {
      if (mounted) {
        setReduce(v);
      }
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', v => {
      setReduce(v);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduce;
}
