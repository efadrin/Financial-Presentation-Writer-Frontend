import { useState, useRef, useEffect } from 'react';

const useLoadingProgress = (isLoading: boolean) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingStartTime = useRef<number | null>(null);
  const minDisplayTime = 800;

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      loadingStartTime.current = Date.now();

      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }

      timeoutRef.current = setTimeout(() => {
        setProgress(50);
        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev < 99) {
              let increment: number;
              if (prev < 30)       increment = 8;
              else if (prev < 60)  increment = 6;
              else if (prev < 80)  increment = 3;
              else if (prev < 90)  increment = 1;
              else if (prev < 95)  increment = Math.random() > 0.8 ? 1 : 0;
              else                 increment = Math.random() > 0.9 ? 1 : 0;
              return Math.round(Math.min(prev + increment, 99));
            }
            return 99;
          });
        }, 150);
      }, 50);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }

      if (loadingStartTime.current) {
        const elapsed = Date.now() - loadingStartTime.current;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        if (remaining > 0) {
          timeoutRef.current = setTimeout(() => {
            setProgress(100);
            setTimeout(() => setProgress(0), 300);
          }, remaining);
        } else {
          setProgress(100);
          timeoutRef.current = setTimeout(() => setProgress(0), 300);
        }
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading]);

  return { progress };
};

export default useLoadingProgress;
