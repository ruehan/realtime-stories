import React, { useEffect, useRef, useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useMouseInteraction } from '../hooks/useMouseInteraction';

interface HighlightAnimationProps {
  children: React.ReactNode;
  type?: 'underline' | 'background' | 'glow' | 'border' | 'gradient';
  color?: string;
  duration?: number;
  delay?: number;
  trigger?: 'scroll' | 'hover' | 'click' | 'auto';
  intensity?: 'subtle' | 'medium' | 'strong';
  direction?: 'left-to-right' | 'right-to-left' | 'center-out' | 'random';
  className?: string;
  onAnimationComplete?: () => void;
}

const HighlightAnimation: React.FC<HighlightAnimationProps> = ({
  children,
  type = 'underline',
  color = '#3b82f6',
  duration = 800,
  delay = 0,
  trigger = 'scroll',
  intensity = 'medium',
  direction = 'left-to-right',
  className = '',
  onAnimationComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationRef = useRef<HTMLSpanElement>(null);
  
  // Scroll-based animation
  const { ref: scrollRef, isVisible } = useScrollAnimation({
    threshold: 0.3,
    triggerOnce: trigger === 'scroll'
  });

  // Mouse interaction for hover/click triggers
  const { ref: mouseRef, isHovering, isClicking } = useMouseInteraction({
    enableHover: trigger === 'hover',
    enableClick: trigger === 'click'
  });

  // Combine refs
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (scrollRef.current && mouseRef.current && elementRef.current) {
      // Set both refs to the same element
      scrollRef.current = elementRef.current;
      mouseRef.current = elementRef.current;
    }
  }, []);

  // Determine when to trigger animation
  const shouldAnimate = (() => {
    switch (trigger) {
      case 'scroll':
        return isVisible && !hasAnimated;
      case 'hover':
        return isHovering;
      case 'click':
        return isClicking;
      case 'auto':
        return true;
      default:
        return false;
    }
  })();

  // Trigger animation
  useEffect(() => {
    if (shouldAnimate && !isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        if (trigger === 'scroll' || trigger === 'auto') {
          setHasAnimated(true);
        }

        // Complete animation after duration
        const completeTimer = setTimeout(() => {
          if (trigger === 'hover' || trigger === 'click') {
            setIsAnimating(false);
          }
          onAnimationComplete?.();
        }, duration);

        return () => clearTimeout(completeTimer);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, isAnimating, duration, delay, trigger, onAnimationComplete]);

  // Reset animation for hover/click triggers
  useEffect(() => {
    if ((trigger === 'hover' && !isHovering) || (trigger === 'click' && !isClicking)) {
      setIsAnimating(false);
    }
  }, [trigger, isHovering, isClicking]);

  // Get animation styles based on type
  const getAnimationStyles = () => {
    const intensityMap = {
      subtle: 0.7,
      medium: 1,
      strong: 1.3
    };

    const intensityFactor = intensityMap[intensity];
    const animationDuration = `${duration}ms`;

    const baseStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      transition: `all ${animationDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    const animationStyles: React.CSSProperties & { [key: string]: any } = {};

    switch (type) {
      case 'underline':
        animationStyles['--highlight-width'] = isAnimating ? '100%' : '0%';
        animationStyles['--highlight-color'] = color;
        animationStyles['--highlight-direction'] = direction;
        break;
      
      case 'background':
        animationStyles.backgroundColor = isAnimating ? color : 'transparent';
        animationStyles.color = isAnimating ? 'white' : 'inherit';
        animationStyles.padding = isAnimating ? '2px 4px' : '0';
        animationStyles.borderRadius = isAnimating ? '4px' : '0';
        break;
      
      case 'glow':
        animationStyles.textShadow = isAnimating 
          ? `0 0 ${8 * intensityFactor}px ${color}, 0 0 ${16 * intensityFactor}px ${color}`
          : 'none';
        animationStyles.color = isAnimating ? color : 'inherit';
        break;
      
      case 'border':
        animationStyles.border = isAnimating ? `2px solid ${color}` : '2px solid transparent';
        animationStyles.padding = '2px 4px';
        animationStyles.borderRadius = '4px';
        break;
      
      case 'gradient':
        animationStyles.background = isAnimating 
          ? `linear-gradient(45deg, ${color}, ${color}88)`
          : 'transparent';
        animationStyles.backgroundClip = 'text';
        animationStyles.WebkitBackgroundClip = 'text';
        animationStyles.color = isAnimating ? 'transparent' : 'inherit';
        break;
    }

    return { ...baseStyles, ...animationStyles };
  };

  // Get CSS classes for underline animation
  const getUnderlineClasses = () => {
    if (type !== 'underline') return '';
    
    const baseClass = 'highlight-underline';
    const directionClass = `highlight-${direction}`;
    const animatingClass = isAnimating ? 'highlight-animating' : '';
    
    return `${baseClass} ${directionClass} ${animatingClass}`.trim();
  };

  return (
    <>
      {/* CSS for underline animation */}
      {type === 'underline' && (
        <style>
          {`
            .highlight-underline {
              position: relative;
            }
            
            .highlight-underline::after {
              content: '';
              position: absolute;
              bottom: 0;
              height: 2px;
              background-color: var(--highlight-color, ${color});
              transition: width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
              width: var(--highlight-width, 0%);
            }
            
            .highlight-left-to-right::after {
              left: 0;
            }
            
            .highlight-right-to-left::after {
              right: 0;
            }
            
            .highlight-center-out::after {
              left: 50%;
              transform: translateX(-50%);
            }
            
            .highlight-random::after {
              left: ${Math.random() * 50}%;
            }
            
            .highlight-animating::after {
              width: 100%;
            }
          `}
        </style>
      )}

      <span
        ref={elementRef}
        className={`highlight-animation ${getUnderlineClasses()} ${className}`}
        style={getAnimationStyles()}
        data-highlight-type={type}
        data-highlight-trigger={trigger}
      >
        {children}
      </span>
    </>
  );
};

// Preset components for common use cases
export const ImportantText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <HighlightAnimation
    type="background"
    color="#fef3c7"
    trigger="scroll"
    intensity="medium"
    duration={600}
    className={`font-semibold ${className}`}
  >
    {children}
  </HighlightAnimation>
);

export const CodeHighlight: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <HighlightAnimation
    type="glow"
    color="#10b981"
    trigger="hover"
    intensity="subtle"
    duration={300}
    className={`font-mono bg-gray-100 px-2 py-1 rounded ${className}`}
  >
    {children}
  </HighlightAnimation>
);

export const QuoteHighlight: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <HighlightAnimation
    type="border"
    color="#8b5cf6"
    trigger="scroll"
    intensity="medium"
    duration={800}
    delay={200}
    className={`italic ${className}`}
  >
    {children}
  </HighlightAnimation>
);

export const LinkHighlight: React.FC<{ 
  children: React.ReactNode; 
  href?: string;
  className?: string;
}> = ({ 
  children, 
  href,
  className = '' 
}) => (
  <a href={href} className={`text-blue-600 hover:text-blue-800 ${className}`}>
    <HighlightAnimation
      type="underline"
      color="#3b82f6"
      trigger="hover"
      intensity="medium"
      duration={200}
      direction="left-to-right"
    >
      {children}
    </HighlightAnimation>
  </a>
);

// Batch highlight animation for multiple elements
export const BatchHighlight: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
  type?: HighlightAnimationProps['type'];
  color?: string;
}> = ({ 
  children, 
  staggerDelay = 100, 
  type = 'underline',
  color = '#3b82f6'
}) => {
  return (
    <>
      {children.map((child, index) => (
        <HighlightAnimation
          key={index}
          type={type}
          color={color}
          trigger="scroll"
          delay={index * staggerDelay}
          direction={index % 2 === 0 ? 'left-to-right' : 'right-to-left'}
        >
          {child}
        </HighlightAnimation>
      ))}
    </>
  );
};

export default HighlightAnimation;