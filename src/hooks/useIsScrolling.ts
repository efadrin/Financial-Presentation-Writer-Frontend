import { useCallback, useEffect, useRef, useState } from 'react';

const useIsScrolling = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  useEffect(() => {
    const div = scrollRef.current;
    if (div) div.addEventListener('scroll', handleScroll);
    return () => {
      if (div) div.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { isScrolling, scrollRef };
};

export default useIsScrolling;
