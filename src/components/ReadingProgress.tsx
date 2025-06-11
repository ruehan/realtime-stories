import React, { useState, useEffect } from 'react';
import { useReadingProgress } from '../hooks/useReadingProgress';

interface ReadingProgressProps {
  contentSelector?: string;
  showDetailedStats?: boolean;
  position?: 'top' | 'bottom' | 'fixed-top' | 'fixed-bottom';
  className?: string;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
  contentSelector = '.reading-content',
  showDetailedStats = false,
  position = 'fixed-top',
  className = ''
}) => {
  const {
    progress,
    timeSpent,
    scrollDirection,
    readingSpeed,
    currentSection,
    estimatedReadingTime,
    isReading
  } = useReadingProgress({ contentSelector });

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());

  // Auto-hide progress bar when not scrolling
  useEffect(() => {
    const now = Date.now();
    setLastScrollTime(now);

    const timer = setTimeout(() => {
      const timeSinceLastScroll = Date.now() - lastScrollTime;
      if (timeSinceLastScroll > 3000 && position.includes('fixed')) {
        setIsVisible(false);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [progress, lastScrollTime, position]);

  // Show progress bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true);
      setLastScrollTime(Date.now());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'fixed-top':
        return 'fixed top-0 left-0 right-0 z-50';
      case 'fixed-bottom':
        return 'fixed bottom-0 left-0 right-0 z-50';
      case 'top':
        return 'sticky top-0 z-40';
      case 'bottom':
        return 'sticky bottom-0 z-40';
      default:
        return '';
    }
  };

  const progressBarClasses = `
    ${getPositionClasses()}
    bg-white/95 backdrop-blur-sm border-b border-gray-200
    transition-all duration-300 ease-in-out
    ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
    ${className}
  `;

  return (
    <div className={progressBarClasses}>
      {/* Progress Bar */}
      <div className="relative">
        <div
          className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 bg-gray-200" style={{ zIndex: -1 }} />
      </div>

      {/* Detailed Stats */}
      {showDetailedStats && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600 max-w-6xl mx-auto">
            {/* Left side - Reading info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isReading ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-medium">
                  {Math.round(progress)}% read
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatTime(timeSpent)}</span>
              </div>

              {readingSpeed > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{readingSpeed} wpm</span>
                </div>
              )}
            </div>

            {/* Right side - Navigation */}
            <div className="flex items-center space-x-4">
              {currentSection && (
                <div className="text-xs text-gray-500 max-w-xs truncate">
                  Reading: {currentSection}
                </div>
              )}
              
              <div className="flex items-center space-x-1 text-xs">
                <span>~{estimatedReadingTime} min total</span>
                {scrollDirection !== 'none' && (
                  <div className={`flex items-center ${scrollDirection === 'down' ? 'text-blue-500' : 'text-purple-500'}`}>
                    <svg className={`w-3 h-3 ${scrollDirection === 'up' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Floating Reading Stats Component
export const FloatingReadingStats: React.FC<{
  contentSelector?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}> = ({ 
  contentSelector = '.reading-content',
  position = 'bottom-right'
}) => {
  const {
    progress,
    timeSpent,
    readingSpeed,
    estimatedReadingTime,
    isReading
  } = useReadingProgress({ contentSelector });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show when user starts reading
    if (progress > 5) {
      setIsVisible(true);
    } else if (progress === 0) {
      setIsVisible(false);
    }
  }, [progress]);

  const getPositionClasses = () => {
    const base = 'fixed z-50 transition-all duration-300';
    switch (position) {
      case 'bottom-right':
        return `${base} bottom-6 right-6`;
      case 'bottom-left':
        return `${base} bottom-6 left-6`;
      case 'top-right':
        return `${base} top-6 right-6`;
      case 'top-left':
        return `${base} top-6 left-6`;
      default:
        return `${base} bottom-6 right-6`;
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`${getPositionClasses()} ${isExpanded ? 'w-64' : 'w-16'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
        {!isExpanded ? (
          // Collapsed view - circular progress
          <div className="w-10 h-10 relative flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray={`${progress}, 100`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isReading ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        ) : (
          // Expanded view - detailed stats
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">Reading Progress</h4>
              <div className={`w-2 h-2 rounded-full ${isReading ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Time spent:</span>
                <span className="font-medium">{formatTime(timeSpent)}</span>
              </div>
              {readingSpeed > 0 && (
                <div className="flex justify-between">
                  <span>Reading speed:</span>
                  <span className="font-medium">{readingSpeed} wpm</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Est. total:</span>
                <span className="font-medium">~{estimatedReadingTime}m</span>
              </div>
            </div>
            
            {/* Mini progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingProgress;