import React, { useEffect, useRef } from 'react';
import { useColyseus } from '../contexts/ColyseusContext';
import { usePageState } from '../hooks/useRoomState';
import SharedCursors from '../components/SharedCursors';

const Categories: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { joinPage, pageRoom } = useColyseus();
  const { users, cursors } = usePageState(pageRoom);

  // Auto-join categories page room for cursor sharing
  useEffect(() => {
    let mounted = true;
    
    const joinCategoriesRoom = async () => {
      if (!pageRoom && mounted) {
        try {
          await joinPage('categories');
          console.log('[Categories] Joined categories page room for cursor sharing');
        } catch (error) {
          console.error('[Categories] Failed to join categories page room:', error);
        }
      }
    };
    
    joinCategoriesRoom();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div ref={containerRef} className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Categories</h1>
      <p className="text-lg text-gray-700">
        Browse content by categories and topics.
      </p>
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          현재 {users?.length || 0}명이 이 페이지를 보고 있습니다.
        </p>
      </div>
      
      {/* Shared Cursors */}
      <SharedCursors room={pageRoom} containerRef={containerRef} currentPage="categories" />
    </div>
  );
};

export default Categories;