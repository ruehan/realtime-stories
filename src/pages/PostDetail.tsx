import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Post, postService, TableOfContentsItem } from '../services/PostService';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useMouseInteraction } from '../hooks/useMouseInteraction';
import ReadingProgress, { FloatingReadingStats } from '../components/ReadingProgress';
import HighlightAnimation, { 
  ImportantText, 
  CodeHighlight, 
  QuoteHighlight, 
  LinkHighlight 
} from '../components/HighlightAnimation';

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [toc, setToc] = useState<TableOfContentsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mouse interaction for hero section
  const { ref: heroRef, getTransform } = useMouseInteraction({
    enableHover: true,
    enableMove: true,
    sensitivity: 0.3,
    magnetism: 0.2
  });

  // Scroll animations for different sections
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({
    threshold: 0.3,
    triggerOnce: true
  });

  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
    delay: 200
  });

  // Cast refs to proper types
  const heroRefDiv = heroRef as React.RefObject<HTMLDivElement>;
  const headerRefDiv = headerRef as React.RefObject<HTMLDivElement>;
  const contentRefArticle = contentRef as React.RefObject<HTMLElement>;

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setError('포스트를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load post by slug
        const postData = await postService.getPostBySlug(slug);
        setPost(postData);

        // Load table of contents
        const tocData = await postService.getPostTOC(postData.id);
        setToc(tocData);

        // Load related posts
        const related = await postService.getRelatedPosts(postData.id, 3);
        setRelatedPosts(related);

      } catch (err) {
        console.error('Failed to load post:', err);
        setError('포스트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(`heading-${anchor}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">포스트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">포스트를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/posts')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            포스트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Reading Progress Bar */}
      <ReadingProgress 
        contentSelector=".reading-content"
        showDetailedStats={true}
        position="fixed-top"
      />

      {/* Floating Reading Stats */}
      <FloatingReadingStats 
        contentSelector=".reading-content"
        position="bottom-right"
      />

      {/* Hero Section */}
      <div 
        ref={heroRefDiv}
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden"
        style={{ transform: getTransform({ enableTilt: true, tiltStrength: 5 }) }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Back Button */}
            <div className="flex justify-start mb-8">
              <button
                onClick={() => navigate('/posts')}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                포스트 목록
              </button>
            </div>

            {/* Post Meta */}
            <div 
              ref={headerRefDiv}
              className={`transition-all duration-800 ${
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {post.classification.category}
                </span>
                {post.classification.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(post.classification.difficulty)}`}>
                    {post.classification.difficulty}
                  </span>
                )}
                {post.classification.primaryLanguage && (
                  <span className="px-3 py-1 bg-purple-500/30 backdrop-blur-sm rounded-full text-sm font-medium">
                    {post.classification.primaryLanguage}
                  </span>
                )}
                {post.featured && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-sm font-bold">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <HighlightAnimation
                type="glow"
                color="#60a5fa"
                trigger="auto"
                intensity="medium"
                duration={1000}
                delay={500}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {post.metadata.title}
                </h1>
              </HighlightAnimation>

              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                {post.metadata.excerpt}
              </p>

              <div className="flex flex-wrap justify-center items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{post.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{post.content.readingTime || 5} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{post.stats.viewCount}</span>
                  </div>
                  {post.stats.likeCount > 0 && (
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{post.stats.likeCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {post.classification.tags.map((tag, index) => (
                  <HighlightAnimation
                    key={tag}
                    type="underline"
                    color="#60a5fa"
                    trigger="hover"
                    delay={index * 100}
                    direction="center-out"
                  >
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm cursor-pointer hover:bg-white/20 transition-colors duration-200">
                      #{tag}
                    </span>
                  </HighlightAnimation>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sidebar */}
            {toc.length > 0 && (
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">목차</h3>
                    <nav className="space-y-2">
                      {toc.map((item, index) => (
                        <HighlightAnimation
                          key={item.id}
                          type="underline"
                          color="#3b82f6"
                          trigger="hover"
                          delay={index * 50}
                        >
                          <button
                            onClick={() => scrollToSection(item.anchor)}
                            className={`
                              block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200
                              hover:bg-blue-50 hover:text-blue-600
                              ${item.level === 1 ? 'font-semibold text-gray-800' : ''}
                              ${item.level === 2 ? 'ml-4 text-gray-700' : ''}
                              ${item.level >= 3 ? 'ml-8 text-gray-600 text-sm' : ''}
                            `}
                          >
                            {item.title}
                          </button>
                        </HighlightAnimation>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className={`${toc.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <article 
                ref={contentRefArticle}
                className={`
                  bg-white rounded-xl shadow-lg overflow-hidden
                  transition-all duration-800 reading-content
                  ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
              >
                <div className="p-8 md:p-12">
                  {/* Debug: Show HTML content */}
                  <div className="mb-4 p-4 bg-yellow-100 text-sm">
                    <strong>Debug - HTML length:</strong> {post.content.html?.length || 0}
                    <br />
                    <strong>HTML preview:</strong> {post.content.html?.substring(0, 100) || 'No HTML content'}...
                  </div>
                  
                  {/* Render HTML content with basic styling */}
                  <div 
                    className="content-area"
                    style={{
                      lineHeight: '1.6',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ __html: post.content.html || '' }}
                  />
                </div>
              </article>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <HighlightAnimation
                    type="background"
                    color="#f3f4f6"
                    trigger="scroll"
                    intensity="subtle"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">관련 포스트</h2>
                  </HighlightAnimation>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost, index) => (
                      <HighlightAnimation
                        key={relatedPost.id}
                        type="glow"
                        color="#3b82f6"
                        trigger="hover"
                        intensity="subtle"
                      >
                        <div 
                          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
                          onClick={() => navigate(`/posts/${relatedPost.metadata.slug}`)}
                        >
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {relatedPost.metadata.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {relatedPost.metadata.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{relatedPost.classification.category}</span>
                            <span>{relatedPost.content.readingTime || 5} min</span>
                          </div>
                        </div>
                      </HighlightAnimation>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;