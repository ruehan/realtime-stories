import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface TypingEffectProps {
  text: string;
  speed?: number; // ms per character
  delay?: number; // initial delay before typing starts
  cursor?: boolean; // show cursor
  cursorChar?: string;
  trigger?: 'scroll' | 'auto' | 'manual';
  onComplete?: () => void;
  className?: string;
  cursorClassName?: string;
  highlightWords?: string[]; // words to highlight after typing
  highlightColor?: string;
  typewriterSound?: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  cursorChar = '|',
  trigger = 'scroll',
  onComplete,
  className = '',
  cursorClassName = '',
  highlightWords = [],
  highlightColor = '#3b82f6',
  typewriterSound = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(cursor);
  
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.3,
    triggerOnce: true
  });
  
  const indexRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typewriterSound && typeof Audio !== 'undefined') {
      // Create a simple typing sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createTypeSound = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.02);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.02);
      };

      audioRef.current = {
        play: createTypeSound
      } as any;
    }
  }, [typewriterSound]);

  const typeNextCharacter = useCallback(() => {
    if (indexRef.current < text.length) {
      const nextChar = text[indexRef.current];
      setDisplayedText(prev => prev + nextChar);
      
      // Play typing sound
      if (typewriterSound && audioRef.current && nextChar !== ' ') {
        try {
          audioRef.current.play();
        } catch (e) {
          // Ignore audio errors
        }
      }
      
      indexRef.current++;
      
      // Variable speed for more natural typing
      const nextSpeed = nextChar === ' ' ? speed * 0.5 : 
                       nextChar === '.' || nextChar === '!' || nextChar === '?' ? speed * 3 :
                       speed * (0.8 + Math.random() * 0.4);
      
      typingTimeoutRef.current = setTimeout(typeNextCharacter, nextSpeed);
    } else {
      setIsTyping(false);
      setIsComplete(true);
      onComplete?.();
    }
  }, [text, speed, onComplete, typewriterSound]);

  const startTyping = useCallback(() => {
    if (!isTyping && displayedText.length === 0) {
      setIsTyping(true);
      indexRef.current = 0;
      
      setTimeout(() => {
        typeNextCharacter();
      }, delay);
    }
  }, [isTyping, displayedText, delay, typeNextCharacter]);

  // Trigger typing based on prop
  useEffect(() => {
    const shouldStart = trigger === 'auto' || (trigger === 'scroll' && isVisible);
    
    if (shouldStart) {
      startTyping();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [trigger, isVisible, startTyping]);

  // Cursor blinking effect
  useEffect(() => {
    if (cursor && !isTyping && isComplete) {
      const blinkInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);

      return () => clearInterval(blinkInterval);
    } else if (cursor && isTyping) {
      setShowCursor(true);
    }
  }, [cursor, isTyping, isComplete]);

  // Highlight words after typing
  const highlightText = (text: string) => {
    if (!isComplete || highlightWords.length === 0) return text;

    let result = text;
    highlightWords.forEach(word => {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      result = result.replace(regex, `<span style="color: ${highlightColor}; font-weight: bold;">$1</span>`);
    });

    return result;
  };

  const elementRef = trigger === 'scroll' ? ref : undefined;

  return (
    <span ref={elementRef as React.RefObject<HTMLSpanElement>} className={className}>
      {isComplete && highlightWords.length > 0 ? (
        <span dangerouslySetInnerHTML={{ __html: highlightText(displayedText) }} />
      ) : (
        <span>{displayedText}</span>
      )}
      {cursor && showCursor && (
        <span className={`typing-cursor ${cursorClassName}`}>
          {cursorChar}
        </span>
      )}
      
      <style>{`
        .typing-cursor {
          animation: blink 1s infinite;
          font-weight: bold;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
};

// Multiple text typing effect with queue
export const MultiTypingEffect: React.FC<{
  texts: string[];
  speed?: number;
  delay?: number;
  pauseBetween?: number;
  trigger?: 'scroll' | 'auto' | 'manual';
  className?: string;
}> = ({
  texts,
  speed = 50,
  delay = 0,
  pauseBetween = 1000,
  trigger = 'scroll',
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCurrent, setShowCurrent] = useState(true);

  const handleComplete = useCallback(() => {
    if (currentIndex < texts.length - 1) {
      setTimeout(() => {
        setShowCurrent(false);
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setShowCurrent(true);
        }, 300); // Fade transition time
      }, pauseBetween);
    }
  }, [currentIndex, texts.length, pauseBetween]);

  if (currentIndex >= texts.length) return null;

  return (
    <div className={`transition-opacity duration-300 ${showCurrent ? 'opacity-100' : 'opacity-0'} ${className}`}>
      <TypingEffect
        text={texts[currentIndex]}
        speed={speed}
        delay={delay}
        trigger={trigger}
        onComplete={handleComplete}
        cursor={currentIndex === texts.length - 1}
      />
    </div>
  );
};

// Terminal-style typing effect
export const TerminalTypingEffect: React.FC<{
  commands: Array<{ prompt?: string; command: string; output?: string }>;
  speed?: number;
  className?: string;
}> = ({
  commands,
  speed = 30,
  className = ''
}) => {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'prompt' | 'command' | 'output'>('prompt');
  const [lines, setLines] = useState<Array<{ type: string; content: string }>>([]);

  const currentCommand = commands[currentCommandIndex];

  const handleComplete = useCallback(() => {
    if (!currentCommand) return;

    if (currentPhase === 'prompt') {
      setLines(prev => [...prev, { type: 'prompt', content: currentCommand.prompt || '$ ' }]);
      setCurrentPhase('command');
    } else if (currentPhase === 'command') {
      setLines(prev => [...prev, { type: 'command', content: currentCommand.command }]);
      if (currentCommand.output) {
        setCurrentPhase('output');
      } else if (currentCommandIndex < commands.length - 1) {
        setCurrentCommandIndex(prev => prev + 1);
        setCurrentPhase('prompt');
      }
    } else if (currentPhase === 'output' && currentCommand.output) {
      setLines(prev => [...prev, { type: 'output', content: currentCommand.output || '' }]);
      if (currentCommandIndex < commands.length - 1) {
        setCurrentCommandIndex(prev => prev + 1);
        setCurrentPhase('prompt');
      }
    }
  }, [currentCommand, currentCommandIndex, currentPhase, commands.length]);

  const getTextForCurrentPhase = () => {
    if (!currentCommand) return '';
    
    switch (currentPhase) {
      case 'prompt':
        return currentCommand.prompt || '$ ';
      case 'command':
        return currentCommand.command;
      case 'output':
        return currentCommand.output || '';
      default:
        return '';
    }
  };

  return (
    <div className={`font-mono bg-gray-900 text-green-400 p-4 rounded-lg ${className}`}>
      {lines.map((line, index) => (
        <div key={index} className={`mb-1 ${line.type === 'output' ? 'text-gray-300' : ''}`}>
          {line.content}
        </div>
      ))}
      <div className="flex">
        {currentPhase === 'prompt' && (
          <TypingEffect
            text={getTextForCurrentPhase()}
            speed={speed}
            trigger="auto"
            cursor={false}
            onComplete={handleComplete}
          />
        )}
        {currentPhase === 'command' && (
          <>
            <span>{currentCommand.prompt || '$ '}</span>
            <TypingEffect
              text={getTextForCurrentPhase()}
              speed={speed}
              trigger="auto"
              cursor={true}
              onComplete={handleComplete}
            />
          </>
        )}
        {currentPhase === 'output' && currentCommand.output && (
          <TypingEffect
            text={getTextForCurrentPhase()}
            speed={speed / 2}
            trigger="auto"
            cursor={false}
            onComplete={handleComplete}
            className="text-gray-300"
          />
        )}
      </div>
    </div>
  );
};

export default TypingEffect;