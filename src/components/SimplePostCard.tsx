import React from 'react';
import { Post } from '../services/PostService';

interface SimplePostCardProps {
  post: Post;
  onClick?: () => void;
}

const SimplePostCard: React.FC<SimplePostCardProps> = ({ post, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        marginBottom: '16px'
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          backgroundColor: '#DBEAFE',
          color: '#1E40AF',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {post.classification.category}
        </span>
      </div>
      
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '12px',
        lineHeight: '1.4'
      }}>
        {post.metadata.title}
      </h2>
      
      <p style={{
        color: '#4B5563',
        marginBottom: '16px',
        lineHeight: '1.6',
        fontSize: '16px'
      }}>
        {post.metadata.excerpt}
      </p>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #F3F4F6',
        fontSize: '14px',
        color: '#6B7280'
      }}>
        <span>{post.authorName}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default SimplePostCard;