import React, { useState, useRef, useEffect } from 'react';

interface InteractiveIllustrationProps {
  src: string;
  alt?: string;
  className?: string;
  enableParallax?: boolean;
  enableGlow?: boolean;
  enableTilt?: boolean;
  enableZoom?: boolean;
  parallaxIntensity?: number;
  glowColor?: string;
  maxTilt?: number;
}

const InteractiveIllustration: React.FC<InteractiveIllustrationProps> = ({
  src,
  alt = '',
  className = '',
  enableParallax = true,
  enableGlow = true,
  enableTilt = true,
  enableZoom = false,
  parallaxIntensity = 20,
  glowColor = '#3b82f6',
  maxTilt = 15
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset to center
    setTimeout(() => {
      if (!isHovered) {
        setMousePosition({ x: 0.5, y: 0.5 });
      }
    }, 300);
  };

  // Calculate transform values
  const calculateTransform = () => {
    const transforms = [];

    if (enableTilt) {
      const tiltX = (mousePosition.y - 0.5) * maxTilt;
      const tiltY = (mousePosition.x - 0.5) * -maxTilt;
      transforms.push(`perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`);
    }

    if (enableParallax) {
      const moveX = (mousePosition.x - 0.5) * parallaxIntensity;
      const moveY = (mousePosition.y - 0.5) * parallaxIntensity;
      transforms.push(`translate(${moveX}px, ${moveY}px)`);
    }

    if (enableZoom && isHovered) {
      transforms.push('scale(1.05)');
    }

    return transforms.join(' ');
  };

  // Calculate glow effect
  const calculateGlow = () => {
    if (!enableGlow || !isHovered) return {};

    const glowX = mousePosition.x * 100;
    const glowY = mousePosition.y * 100;
    const glowIntensity = 0.5;

    return {
      background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor}${Math.round(glowIntensity * 255).toString(16)}, transparent 50%)`,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow overlay */}
      {enableGlow && (
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
          style={{
            ...calculateGlow(),
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}

      {/* Image container */}
      <div
        className="relative w-full h-full transition-all duration-300 ease-out"
        style={{
          transform: calculateTransform(),
          willChange: 'transform',
        }}
      >
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Main image */}
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Reflection effect */}
        {enableTilt && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, ${
                0.1 + (mousePosition.x * 0.1)
              }) 45%, transparent 50%)`,
            }}
          />
        )}
      </div>

      {/* Interactive indicators */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex gap-1 z-20">
          {enableTilt && (
            <div className="w-2 h-2 bg-white rounded-full opacity-50" />
          )}
          {enableParallax && (
            <div className="w-2 h-2 bg-white rounded-full opacity-50" />
          )}
          {enableGlow && (
            <div className="w-2 h-2 bg-white rounded-full opacity-50" />
          )}
        </div>
      )}
    </div>
  );
};

// Hook for tracking mouse position globally
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
};

// Floating interactive element that follows mouse
export const FloatingInteractiveElement: React.FC<{
  children: React.ReactNode;
  offsetX?: number;
  offsetY?: number;
  delay?: number;
}> = ({ children, offsetX = 20, offsetY = 20, delay = 100 }) => {
  const mousePosition = useMousePosition();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosition({
        x: mousePosition.x + offsetX,
        y: mousePosition.y + offsetY,
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [mousePosition, offsetX, offsetY, delay]);

  useEffect(() => {
    // Show element when mouse moves
    const handleMouseMove = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-200 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {children}
    </div>
  );
};

export default InteractiveIllustration;