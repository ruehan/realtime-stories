import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface SmoothTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'custom';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  easing?: string;
  className?: string;
  customTransform?: {
    from: string;
    to: string;
  };
}

const SmoothTransition: React.FC<SmoothTransitionProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 800,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  className = '',
  customTransform
}) => {
  const { ref, isVisible, progress } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
    delay
  });

  const getTransformStyle = () => {
    if (!isVisible) {
      // Initial state (hidden)
      switch (type) {
        case 'fade':
          return { opacity: 0 };
        case 'slide':
          const slideDistance = '30px';
          switch (direction) {
            case 'up':
              return { opacity: 0, transform: `translateY(${slideDistance})` };
            case 'down':
              return { opacity: 0, transform: `translateY(-${slideDistance})` };
            case 'left':
              return { opacity: 0, transform: `translateX(${slideDistance})` };
            case 'right':
              return { opacity: 0, transform: `translateX(-${slideDistance})` };
            default:
              return { opacity: 0 };
          }
        case 'scale':
          return { opacity: 0, transform: 'scale(0.9)' };
        case 'rotate':
          return { opacity: 0, transform: 'rotate(-5deg) scale(0.95)' };
        case 'blur':
          return { opacity: 0, filter: 'blur(10px)' };
        case 'custom':
          return customTransform ? { transform: customTransform.from } : {};
        default:
          return {};
      }
    } else {
      // Final state (visible)
      switch (type) {
        case 'fade':
          return { opacity: 1 };
        case 'slide':
        case 'scale':
        case 'rotate':
          return { opacity: 1, transform: 'none' };
        case 'blur':
          return { opacity: 1, filter: 'blur(0px)' };
        case 'custom':
          return customTransform ? { transform: customTransform.to } : {};
        default:
          return {};
      }
    }
  };

  const style = {
    ...getTransformStyle(),
    transition: `all ${duration}ms ${easing}`,
    willChange: 'transform, opacity, filter'
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className} style={style}>
      {children}
    </div>
  );
};

// Staggered transitions for multiple elements
export const StaggeredTransition: React.FC<{
  children: ReactNode[];
  type?: SmoothTransitionProps['type'];
  direction?: SmoothTransitionProps['direction'];
  duration?: number;
  staggerDelay?: number;
  className?: string;
}> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 600,
  staggerDelay = 100,
  className = ''
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <SmoothTransition
          type={type}
          direction={direction}
          duration={duration}
          delay={index * staggerDelay}
        >
          {child}
        </SmoothTransition>
      ))}
    </div>
  );
};

// Page transition component
export const PageTransition: React.FC<{
  children: ReactNode;
  isActive: boolean;
  type?: 'fade' | 'slide' | 'zoom';
  duration?: number;
  className?: string;
}> = ({
  children,
  isActive,
  type = 'fade',
  duration = 500,
  className = ''
}) => {
  const getPageTransitionStyle = () => {
    const baseStyle = {
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      position: 'absolute' as const,
      width: '100%',
      height: '100%'
    };

    if (!isActive) {
      switch (type) {
        case 'fade':
          return { ...baseStyle, opacity: 0, pointerEvents: 'none' as const };
        case 'slide':
          return { 
            ...baseStyle, 
            opacity: 0, 
            transform: 'translateX(100%)',
            pointerEvents: 'none' as const 
          };
        case 'zoom':
          return { 
            ...baseStyle, 
            opacity: 0, 
            transform: 'scale(0.8)',
            pointerEvents: 'none' as const 
          };
        default:
          return baseStyle;
      }
    }

    return { ...baseStyle, opacity: 1, transform: 'none' };
  };

  return (
    <div className={className} style={getPageTransitionStyle()}>
      {children}
    </div>
  );
};

// Morphing transition between elements
export const MorphTransition: React.FC<{
  from: ReactNode;
  to: ReactNode;
  isTransitioning: boolean;
  duration?: number;
  className?: string;
}> = ({
  from,
  to,
  isTransitioning,
  duration = 600,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        width: dimensions.width || 'auto',
        height: dimensions.height || 'auto',
        transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
          transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        }}
      >
        {from}
      </div>
      <div
        className="absolute inset-0"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transform: isTransitioning ? 'scale(1)' : 'scale(1.05)',
          transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        }}
      >
        {to}
      </div>
    </div>
  );
};

// Reveal animation with mask
export const RevealTransition: React.FC<{
  children: ReactNode;
  revealDirection?: 'horizontal' | 'vertical' | 'diagonal';
  duration?: number;
  className?: string;
}> = ({
  children,
  revealDirection = 'horizontal',
  duration = 1000,
  className = ''
}) => {
  const { ref, isVisible, progress } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true
  });

  const getMaskStyle = () => {
    const percentage = progress * 100;
    
    switch (revealDirection) {
      case 'horizontal':
        return {
          clipPath: `inset(0 ${100 - percentage}% 0 0)`
        };
      case 'vertical':
        return {
          clipPath: `inset(${100 - percentage}% 0 0 0)`
        };
      case 'diagonal':
        return {
          clipPath: `polygon(0 0, ${percentage}% 0, 0 ${percentage}%, 0 0)`
        };
      default:
        return {};
    }
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      <div
        style={{
          ...getMaskStyle(),
          transition: `clip-path ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SmoothTransition;