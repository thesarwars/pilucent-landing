'use Client'
import { useEffect } from 'react';

const useOutsideClick = (refs: React.RefObject<HTMLElement | null>[], callback: () => void) => {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Check if click is outside all provided refs
      if (refs.every(ref => ref.current && !ref.current.contains(event.target as Node))) {
        callback();
      }
    };

    // Listen for mouse clicks
    document.addEventListener('mousedown', handleOutsideClick);

    // Cleanup on component unmount
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [refs, callback]);
};

export default useOutsideClick;



