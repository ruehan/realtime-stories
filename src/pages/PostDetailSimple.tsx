import React from 'react';
import { useParams } from 'react-router-dom';

const PostDetailSimple: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div style={{
      padding: '50px',
      backgroundColor: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Emergency Visibility Test */}
      <div style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '30px',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '30px',
        border: '5px solid black'
      }}>
        🚨 SIMPLE POST DETAIL PAGE IS WORKING 🚨
      </div>

      <div style={{
        backgroundColor: 'yellow',
        padding: '20px',
        marginBottom: '20px',
        fontSize: '18px'
      }}>
        <strong>Slug from URL:</strong> {slug || 'No slug found'}
      </div>

      <div style={{
        backgroundColor: 'lightblue',
        padding: '20px',
        fontSize: '16px'
      }}>
        <h1 style={{ color: 'black', fontSize: '32px' }}>Post Detail Page Test</h1>
        <p style={{ color: 'black' }}>
          This is a simplified version of the PostDetail page to test basic rendering.
          If you can see this, the routing and basic React rendering is working.
        </p>
        <p style={{ color: 'black' }}>
          URL slug parameter: <strong>{slug}</strong>
        </p>
      </div>
    </div>
  );
};

export default PostDetailSimple;