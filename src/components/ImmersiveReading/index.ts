// Export all immersive reading components
export { default as InteractiveIllustration, FloatingInteractiveElement, useMousePosition } from '../InteractiveIllustration';
export { default as ParallaxSection, MultiLayerParallax, ParallaxText, FloatingElements } from '../ParallaxSection';
export { default as SmoothTransition, StaggeredTransition, PageTransition, MorphTransition, RevealTransition } from '../SmoothTransition';
export { default as TypingEffect, MultiTypingEffect, TerminalTypingEffect } from '../TypingEffect';

// Re-export existing components that are part of immersive reading
export { default as ReadingProgress, FloatingReadingStats } from '../ReadingProgress';
export { 
  default as HighlightAnimation, 
  ImportantText, 
  CodeHighlight, 
  QuoteHighlight, 
  LinkHighlight, 
  BatchHighlight 
} from '../HighlightAnimation';

// Export hooks
export { useScrollAnimation, useStaggeredAnimation, useParallax } from '../../hooks/useScrollAnimation';
export { useReadingProgress } from '../../hooks/useReadingProgress';
export { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
export { useAdaptiveLoading } from '../../hooks/useAdaptiveLoading';
export { useMouseInteraction, useSharedMouseContext } from '../../hooks/useMouseInteraction';

// Export utilities
export { parseContentIntoChunks, renderChunk } from '../../utils/contentChunker';
export type { ContentChunk } from '../../utils/contentChunker';