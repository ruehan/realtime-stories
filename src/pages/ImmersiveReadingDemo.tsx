import React from 'react';
import {
  InteractiveIllustration,
  ParallaxSection,
  MultiLayerParallax,
  FloatingElements,
  SmoothTransition,
  StaggeredTransition,
  RevealTransition,
  TypingEffect,
  MultiTypingEffect,
  TerminalTypingEffect,
  ReadingProgress,
  FloatingReadingStats,
  HighlightAnimation,
  ImportantText,
  CodeHighlight,
  QuoteHighlight,
  useScrollAnimation
} from '../components/ImmersiveReading';

const ImmersiveReadingDemo: React.FC = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Reading Progress Bar */}
      <ReadingProgress 
        contentSelector=".demo-content"
        showDetailedStats={true}
        position="fixed-top"
      />

      {/* Hero Section with Parallax */}
      <ParallaxSection
        className="h-screen flex items-center justify-center"
        backgroundImage="/api/placeholder/1920/1080"
        overlay={true}
        overlayOpacity={0.6}
        speed={0.5}
      >
        <div ref={heroRef as React.RefObject<HTMLDivElement>} className="text-center z-10 px-4">
          <SmoothTransition type="scale" duration={1000}>
            <h1 className="text-6xl font-bold mb-6">
              <TypingEffect
                text="몰입형 읽기 경험"
                speed={100}
                trigger="auto"
                cursor={true}
                highlightWords={['몰입형', '경험']}
                highlightColor="#3b82f6"
              />
            </h1>
          </SmoothTransition>
          
          <SmoothTransition type="fade" delay={1500} duration={800}>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              스크롤 기반 애니메이션, 동적 콘텐츠 로딩, 인터랙티브 요소들로
              구성된 차세대 읽기 경험을 제공합니다.
            </p>
          </SmoothTransition>
        </div>

        {/* Floating Elements */}
        <FloatingElements
          elements={[
            {
              content: <div className="w-20 h-20 bg-blue-500 rounded-full opacity-20" />,
              speed: 0.3,
              position: { top: '20%', left: '10%' },
              size: '80px',
              rotate: true
            },
            {
              content: <div className="w-16 h-16 bg-purple-500 rounded-lg opacity-20" />,
              speed: -0.2,
              position: { bottom: '30%', right: '15%' },
              size: '64px',
              rotate: false
            }
          ]}
        />
      </ParallaxSection>

      {/* Main Content */}
      <div className="demo-content max-w-4xl mx-auto px-4 py-16 space-y-32">
        {/* Interactive Illustrations Section */}
        <section>
          <RevealTransition revealDirection="horizontal" duration={1000}>
            <h2 className="text-4xl font-bold mb-8">인터랙티브 일러스트레이션</h2>
          </RevealTransition>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SmoothTransition type="slide" direction="left">
              <InteractiveIllustration
                src="/api/placeholder/600/400"
                alt="Interactive Demo 1"
                className="w-full h-64 rounded-lg shadow-2xl"
                enableParallax={true}
                enableGlow={true}
                enableTilt={true}
                glowColor="#3b82f6"
              />
            </SmoothTransition>
            
            <SmoothTransition type="slide" direction="right">
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-semibold mb-4">
                  <HighlightAnimation type="underline" color="#10b981" trigger="scroll">
                    마우스를 따라 움직이는 이미지
                  </HighlightAnimation>
                </h3>
                <p className="text-gray-300">
                  마우스 위치에 따라 이미지가 기울어지고, 빛나며, 움직입니다.
                  각 요소는 사용자의 상호작용에 즉각적으로 반응합니다.
                </p>
              </div>
            </SmoothTransition>
          </div>
        </section>

        {/* Typing Effects Section */}
        <section>
          <SmoothTransition type="fade">
            <h2 className="text-4xl font-bold mb-8">타이핑 효과</h2>
          </SmoothTransition>
          
          <div className="space-y-8">
            <div className="bg-gray-700 rounded-lg p-6">
              <MultiTypingEffect
                texts={[
                  "첫 번째 메시지가 타이핑됩니다...",
                  "그 다음 두 번째 메시지가 나타납니다.",
                  "마지막으로 세 번째 메시지가 표시됩니다!"
                ]}
                speed={50}
                pauseBetween={1000}
                trigger="scroll"
                className="text-lg"
              />
            </div>

            <TerminalTypingEffect
              commands={[
                { command: "npm install immersive-reading", output: "✓ Dependencies installed" },
                { command: "npm run dev", output: "Server running on http://localhost:3000" },
                { command: "echo 'Hello, World!'", output: "Hello, World!" }
              ]}
              className="text-sm"
            />
          </div>
        </section>

        {/* Staggered Animations Section */}
        <section>
          <SmoothTransition type="fade">
            <h2 className="text-4xl font-bold mb-8">순차적 애니메이션</h2>
          </SmoothTransition>
          
          <StaggeredTransition
            type="slide"
            direction="up"
            staggerDelay={100}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-2">카드 {item}</h3>
                <p className="text-gray-200">
                  순차적으로 나타나는 카드 애니메이션
                </p>
              </div>
            ))}
          </StaggeredTransition>
        </section>

        {/* Highlight Animations Section */}
        <section>
          <SmoothTransition type="fade">
            <h2 className="text-4xl font-bold mb-8">하이라이트 애니메이션</h2>
          </SmoothTransition>
          
          <div className="space-y-6 text-lg">
            <p>
              이것은 <ImportantText>중요한 텍스트</ImportantText>입니다.
              스크롤하면 자동으로 하이라이트됩니다.
            </p>
            
            <p>
              코드 예제: <CodeHighlight>const result = await fetchData()</CodeHighlight>
              마우스를 올리면 빛납니다.
            </p>
            
            <QuoteHighlight>
              "훌륭한 사용자 경험은 세부사항에서 시작됩니다."
            </QuoteHighlight>
          </div>
        </section>

        {/* Multi-layer Parallax Section */}
        <section className="relative h-96">
          <SmoothTransition type="fade">
            <h2 className="text-4xl font-bold mb-8 relative z-10">다층 패럴랙스</h2>
          </SmoothTransition>
          
          <MultiLayerParallax
            layers={[
              {
                content: (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 bg-blue-500 rounded-full opacity-30" />
                  </div>
                ),
                speed: 0.2
              },
              {
                content: (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 bg-purple-500 rounded-full opacity-40" />
                  </div>
                ),
                speed: 0.5
              },
              {
                content: (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-pink-500 rounded-full opacity-50" />
                  </div>
                ),
                speed: 0.8
              }
            ]}
            className="absolute inset-0"
          />
        </section>
      </div>

      {/* Floating Reading Stats */}
      <FloatingReadingStats contentSelector=".demo-content" position="bottom-right" />
    </div>
  );
};

export default ImmersiveReadingDemo;