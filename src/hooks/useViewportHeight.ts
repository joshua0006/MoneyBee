import { useState, useEffect } from 'react';

interface ViewportHeight {
  viewportHeight: number;
  isKeyboardOpen: boolean;
  actualHeight: number;
}

export const useViewportHeight = (): ViewportHeight => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [initialHeight, setInitialHeight] = useState(window.innerHeight);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // Set initial height on mount
    const initial = window.innerHeight;
    setInitialHeight(initial);
    setViewportHeight(initial);

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;
      
      // Keyboard is considered open if height decreased by more than 150px
      const keyboardThreshold = 150;
      const keyboardOpen = heightDifference > keyboardThreshold;
      
      setViewportHeight(currentHeight);
      setIsKeyboardOpen(keyboardOpen);
      
      // Add class to body for keyboard handling
      if (keyboardOpen) {
        document.body.classList.add('keyboard-is-open');
      } else {
        document.body.classList.remove('keyboard-is-open');
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for visual viewport changes (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      document.body.classList.remove('keyboard-is-open');
    };
  }, [initialHeight]);

  return {
    viewportHeight,
    isKeyboardOpen,
    actualHeight: window.innerHeight
  };
};