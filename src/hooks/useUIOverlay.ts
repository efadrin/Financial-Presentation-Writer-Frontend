import { useContext } from 'react';
import { UIOverlayContext, UIOverlayContextType } from '@/contexts/UIOverlayContext';

export const useUIOverlay = (): UIOverlayContextType => {
  const context = useContext(UIOverlayContext);
  if (!context) {
    throw new Error('useUIOverlay must be used within a UIOverlayProvider');
  }
  return context;
};
