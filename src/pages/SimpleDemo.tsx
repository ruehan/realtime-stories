import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import HighlightAnimation from '../components/HighlightAnimation';
import ReadingProgress from '../components/ReadingProgress';

const SimpleDemo: React.FC = () => {
  const { ref: section1Ref, isVisible: section1Visible } = useScrollAnimation({
    threshold: 0.3,
    triggerOnce: true
  });

  const { ref: section2Ref, isVisible: section2Visible } = useScrollAnimation({
    threshold: 0.3,
    triggerOnce: true,
    delay: 300
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ReadingProgress 
        contentSelector=".demo-content"
        showDetailedStats={true}
        position="fixed-top"
      />

      <div className="demo-content max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center py-20">
          <div
            ref={section1Ref as React.RefObject<HTMLDivElement>}
            className={`transition-all duration-1000 ease-out ${
              section1Visible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              몰입형 읽기 경험 데모
            </h1>
            <p className="text-xl text-gray-600">
              스크롤 기반 애니메이션과 인터랙티브 요소들을 체험해보세요
            </p>
          </div>
        </section>

        {/* Animation Test Section */}
        <section>
          <div
            ref={section2Ref as React.RefObject<HTMLDivElement>}
            className={`transition-all duration-800 ease-out ${
              section2Visible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
          >
            <h2 className="text-3xl font-bold mb-8">스크롤 애니메이션 테스트</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">
                  <HighlightAnimation type="underline" color="#3b82f6" trigger="scroll">
                    하이라이트 애니메이션
                  </HighlightAnimation>
                </h3>
                <p className="text-gray-600">
                  이 텍스트는 스크롤할 때 자동으로 하이라이트됩니다.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">
                  <HighlightAnimation type="glow" color="#10b981" trigger="hover">
                    호버 효과
                  </HighlightAnimation>
                </h3>
                <p className="text-gray-600">
                  제목에 마우스를 올려보세요!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        {[1, 2, 3, 4, 5].map((num) => (
          <ContentSection key={num} number={num} />
        ))}
      </div>
    </div>
  );
};

const ContentSection: React.FC<{ number: number }> = ({ number }) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: number * 100
  });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`bg-white p-8 rounded-lg shadow-lg transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-12 scale-95'
      }`}
    >
      <h3 className="text-2xl font-bold mb-4">섹션 {number}</h3>
      <p className="text-gray-600 mb-4">
        이것은 스크롤 기반 애니메이션 테스트 섹션입니다. 각 섹션은 화면에 나타날 때 
        부드럽게 fade-in과 slide-up 효과가 적용됩니다.
      </p>
      <div className="space-y-2">
        <HighlightAnimation type="background" color="#fef3c7" trigger="scroll">
          <span className="font-semibold">중요한 텍스트</span>
        </HighlightAnimation>
        는 자동으로 하이라이트되고, <br />
        <HighlightAnimation type="glow" color="#8b5cf6" trigger="hover">
          호버 효과가 있는 텍스트
        </HighlightAnimation>
        도 있습니다.
      </div>
    </section>
  );
};

export default SimpleDemo;