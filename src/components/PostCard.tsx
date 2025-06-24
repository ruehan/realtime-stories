import React from 'react';
import { Post } from '../services/PostService';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface PostCardProps {
  post: Post;
  animationDelay?: number;
  onClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, animationDelay = 0, onClick }) => {
  const { ref, isVisible, progress } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
    delay: animationDelay
  });
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={`group bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        transitionDuration: '700ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isVisible ? 'translateY(0)' : 'translateY(32px)'
      }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      {post.metadata.thumbnail && (
        <div className="relative overflow-hidden h-48">
          <img
            src={post.metadata.thumbnail}
            alt={post.metadata.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div className="p-6">
        {/* Categories and Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
            {post.classification.category}
          </span>
          {post.classification.difficulty && (
            <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
              {post.classification.difficulty}
            </span>
          )}
          {post.classification.primaryLanguage && (
            <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#F3E8FF', color: '#6B21A8' }}>
              {post.classification.primaryLanguage}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-3 transition-colors" style={{ color: '#111827', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {post.metadata.title}
        </h2>

        {/* Excerpt */}
        <p className="mb-4 leading-relaxed" style={{ color: '#4b5563', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {post.metadata.excerpt}
        </p>

        {/* Tags */}
        {post.classification.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.classification.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-md transition-colors duration-200" style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
              >
                #{tag}
              </span>
            ))}
            {post.classification.tags.length > 3 && (
              <span className="px-2 py-1 text-xs" style={{ color: '#6B7280' }}>
                +{post.classification.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.content.readingTime || 5} min read
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.stats.viewCount}
            </span>
            {post.stats.likeCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {post.stats.likeCount}
              </span>
            )}
          </div>
          
          <div className="text-right">
            <p className="font-medium" style={{ color: '#374151' }}>
              {post.authorName}
            </p>
            <p>
              {formatDate(post.publishedAt || post.createdAt)}
            </p>
          </div>
        </div>

        {/* Featured badge */}
        {post.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ Featured
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

// Loading skeleton component
export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 animate-pulse">
      <div className="h-48 bg-gray-300" />
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-300 rounded-full w-20" />
          <div className="h-6 bg-gray-300 rounded-full w-16" />
        </div>
        <div className="h-6 bg-gray-300 rounded mb-3 w-3/4" />
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
          <div className="h-4 bg-gray-300 rounded w-2/3" />
        </div>
        <div className="flex gap-1 mb-4">
          <div className="h-5 bg-gray-300 rounded w-12" />
          <div className="h-5 bg-gray-300 rounded w-16" />
          <div className="h-5 bg-gray-300 rounded w-14" />
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded w-12" />
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-300 rounded w-20 mb-1" />
            <div className="h-4 bg-gray-300 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;