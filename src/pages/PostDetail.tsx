import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Post, postService, TableOfContentsItem } from '../services/PostService';
import ReadingProgress, { FloatingReadingStats } from '../components/ReadingProgress';
import HighlightAnimation from '../components/HighlightAnimation';
import SmoothTransition from '../components/SmoothTransition';
import ParallaxSection from '../components/ParallaxSection';
import { useReadingProgress } from '../hooks/useReadingProgress';
import '../styles/immersive-content.css';

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [toc, setToc] = useState<TableOfContentsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the existing reading progress hook for current section tracking
  const { currentSection } = useReadingProgress({ 
    contentSelector: '.reading-content',
    sectionSelector: '.content-area h1, .content-area h2, .content-area h3, .content-area h4, .content-area h5, .content-area h6'
  });

  // Debug current section and apply active class
  useEffect(() => {
    console.log('Current section from useReadingProgress:', currentSection);
    
    // Remove active class from all headings
    const allHeadings = document.querySelectorAll('.content-area h1, .content-area h2, .content-area h3, .content-area h4, .content-area h5, .content-area h6');
    allHeadings.forEach(heading => heading.classList.remove('active-section'));
    
    // Add active class to current section
    if (currentSection) {
      Array.from(allHeadings).forEach(heading => {
        if (heading.textContent?.trim() === currentSection) {
          heading.classList.add('active-section');
        }
      });
    }
  }, [currentSection]);

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
        console.log('TOC data loaded:', tocData);
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

  // Add click events to headings after content is loaded
  useEffect(() => {
    if (!post?.content.html) return;

    const timer = setTimeout(() => {
      const headings = document.querySelectorAll('.content-area h1, .content-area h2, .content-area h3, .content-area h4, .content-area h5, .content-area h6');
      
      Array.from(headings).forEach((heading) => {
        // Remove existing click listeners
        heading.removeEventListener('click', handleHeadingClick);
        
        // Add click listener
        heading.addEventListener('click', handleHeadingClick);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [post?.content.html]);

  // Handle heading click in content
  const handleHeadingClick = (event: Event) => {
    const heading = event.target as HTMLElement;
    if (heading) {
      // Scroll the heading to the top with proper offset
      const yOffset = 100; // Distance from top
      const targetY = heading.getBoundingClientRect().top + window.pageYOffset - yOffset;
      
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

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

  // Simple scroll to section function
  const scrollToSection = (sectionTitle: string) => {
    console.log(`Scrolling to section: "${sectionTitle}"`);
    
    // Find heading by text content
    const headings = document.querySelectorAll('.content-area h1, .content-area h2, .content-area h3, .content-area h4, .content-area h5, .content-area h6');
    console.log('Available headings:', Array.from(headings).map(h => `"${h.textContent?.trim()}"`));
    
    let found = false;
    Array.from(headings).forEach((heading) => {
      const headingText = heading.textContent?.trim();
      if (headingText === sectionTitle) {
        console.log(`Found matching heading: "${headingText}"`);
        
        // Get current scroll position
        const currentScrollY = window.pageYOffset;
        console.log(`Current scroll: ${currentScrollY}`);
        
        // Calculate target position
        const headingRect = heading.getBoundingClientRect();
        const headingTop = headingRect.top + window.pageYOffset;
        console.log(`Heading position: ${headingTop}`);
        
        const yOffset = 100; // Distance from top of viewport
        const targetY = headingTop - yOffset;
        console.log(`Target scroll position: ${targetY}`);
        
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        found = true;
        return;
      }
    });
    
    if (!found) {
      console.log(`No matching heading found for: "${sectionTitle}"`);
    }
  };


  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            fontSize: '18px'
          }}>
            📖 포스트를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '30px',
            borderRadius: '10px',
            fontSize: '18px',
            marginBottom: '20px'
          }}>
            😕 포스트를 찾을 수 없습니다<br/>
            {error}
          </div>
          <button
            onClick={() => navigate('/posts')}
            style={{
              padding: '15px 30px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
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
      <ParallaxSection
        className="relative text-white"
        backgroundImage={post.metadata.thumbnail}
        overlay={true}
        overlayColor="#1e40af"
        overlayOpacity={0.8}
        speed={0.5}
      >
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
            <div>
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
      </ParallaxSection>

      {/* Main Content */}
      <div className="relative">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sidebar */}
            {toc.length > 0 && (
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">목차</h3>
                    <nav className="space-y-1">
                      {toc.map((item, index) => {
                        // Check if this TOC item matches the current section from reading progress
                        const isActive = currentSection === item.title;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              console.log(`TOC Click - Title: "${item.title}", Level: ${item.level}, Anchor: "${item.anchor}"`);
                              console.log(`Current section: "${currentSection}"`);
                              scrollToSection(item.title);
                            }}
                            className={`
                              block w-full text-left px-3 py-2 rounded-lg transition-all duration-200 relative
                              ${isActive 
                                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                              }
                              ${item.level === 1 ? 'font-semibold' : ''}
                              ${item.level === 2 ? 'ml-4' : ''}
                              ${item.level >= 3 ? 'ml-8 text-sm' : ''}
                            `}
                          >
                            {item.title}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className={`${toc.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <article 
                className="bg-white rounded-xl shadow-lg overflow-hidden reading-content"
              >
              <div className="p-8 md:p-12">
                {/* Render HTML content */}
                <div 
                  className="content-area"
                  dangerouslySetInnerHTML={{ __html: post.content.html || '<p>콘텐츠를 불러올 수 없습니다.</p>' }}
                />
              </div>
              </article>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <SmoothTransition type="fade" duration={1000} delay={400}>
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
                </SmoothTransition>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;