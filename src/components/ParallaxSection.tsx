import React, { ReactNode } from 'react';
import { useParallax } from '../hooks/useScrollAnimation';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // -1 to 1, negative for reverse
  offset?: number;
  className?: string;
  backgroundImage?: string;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  offset = 0,
  className = '',
  backgroundImage,
  overlay = false,
  overlayColor = '#000000',
  overlayOpacity = 0.5
}) => {
  const { ref, transform } = useParallax({ speed, offset });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {backgroundImage && (
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="absolute inset-0 w-full h-full"
          style={{
            transform,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform'
          }}
        />
      )}
      
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity
          }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Multi-layer parallax component
export const MultiLayerParallax: React.FC<{
  layers: Array<{
    content: ReactNode;
    speed: number;
    offset?: number;
    zIndex?: number;
    className?: string;
  }>;
  className?: string;
}> = ({ layers, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {layers.map((layer, index) => (
        <ParallaxLayer
          key={index}
          speed={layer.speed}
          offset={layer.offset || 0}
          zIndex={layer.zIndex || index}
          className={layer.className}
        >
          {layer.content}
        </ParallaxLayer>
      ))}
    </div>
  );
};

// Individual parallax layer
const ParallaxLayer: React.FC<{
  children: ReactNode;
  speed: number;
  offset?: number;
  zIndex?: number;
  className?: string;
}> = ({ children, speed, offset = 0, zIndex = 0, className = '' }) => {
  const { ref, transform } = useParallax({ speed, offset });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`absolute inset-0 ${className}`}
      style={{
        transform,
        zIndex,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
};

// Individual text element with parallax
const ParallaxTextElement: React.FC<{
  text: string;
  speed: number;
  offset: number;
  staggerDelay: number;
  marginRight: string;
}> = ({ text, speed, offset, staggerDelay, marginRight }) => {
  const { ref, transform } = useParallax({ speed, offset });
  
  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className="inline-block"
      style={{
        transform,
        transitionDelay: `${staggerDelay}ms`,
        marginRight
      }}
    >
      {text}
    </span>
  );
};

// Text parallax component with split animations
export const ParallaxText: React.FC<{
  text: string;
  speed?: number;
  splitBy?: 'word' | 'char';
  staggerDelay?: number;
  className?: string;
}> = ({ 
  text, 
  speed = 0.3, 
  splitBy = 'word',
  staggerDelay = 50,
  className = '' 
}) => {
  const elements = splitBy === 'word' ? text.split(' ') : text.split('');
  
  return (
    <div className={`flex flex-wrap ${className}`}>
      {elements.map((element, index) => {
        const elementSpeed = speed * (1 + index * 0.1);
        
        return (
          <ParallaxTextElement
            key={index}
            text={element}
            speed={elementSpeed}
            offset={index * 10}
            staggerDelay={index * staggerDelay}
            marginRight={splitBy === 'word' ? '0.25em' : '0'}
          />
        );
      })}
    </div>
  );
};

// Floating elements with parallax
export const FloatingElements: React.FC<{
  elements: Array<{
    content: ReactNode;
    speed: number;
    position: { top?: string; left?: string; right?: string; bottom?: string };
    size?: string;
    rotate?: boolean;
  }>;
  className?: string;
}> = ({ elements, className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element, index) => (
        <FloatingElement
          key={index}
          speed={element.speed}
          position={element.position}
          size={element.size}
          rotate={element.rotate}
        >
          {element.content}
        </FloatingElement>
      ))}
    </div>
  );
};

const FloatingElement: React.FC<{
  children: ReactNode;
  speed: number;
  position: { top?: string; left?: string; right?: string; bottom?: string };
  size?: string;
  rotate?: boolean;
}> = ({ children, speed, position, size = '50px', rotate = false }) => {
  const { ref, transform } = useParallax({ speed });
  
  const rotateClass = rotate ? 'floating-element' : '';

  return (
    <>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`absolute ${rotateClass}`}
        style={{
          ...position,
          width: size,
          height: size,
          transform
        }}
      >
        {children}
      </div>
      
      {rotate && (
        <style>{`
          @keyframes float-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .floating-element {
            animation: float-rotate 20s linear infinite;
          }
        `}</style>
      )}
    </>
  );
};

export default ParallaxSection;