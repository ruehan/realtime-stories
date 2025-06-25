import React, { useState, useEffect } from 'react';
import { Room } from 'colyseus.js';

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isEdited: boolean;
  authorColor: string;
}

interface CommentsProps {
  room: Room | null;
  postId?: string;
}

const Comments: React.FC<CommentsProps> = ({ room, postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (!room) return;

    const handleStateChange = () => {
      if (room.state?.comments) {
        const commentsList: Comment[] = [];
        room.state.comments.forEach((comment: Comment) => {
          commentsList.push({
            id: comment.id,
            postId: comment.postId,
            authorId: comment.authorId,
            authorName: comment.authorName,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            isEdited: comment.isEdited,
            authorColor: comment.authorColor
          });
        });
        
        // Sort by creation time (newest first)
        commentsList.sort((a, b) => b.createdAt - a.createdAt);
        setComments(commentsList);
      }
    };

    room.onStateChange(handleStateChange);
    handleStateChange(); // Initial load

    return () => {
      // Cleanup handled by room
    };
  }, [room]);

  const handleAddComment = () => {
    if (!room || !newComment.trim()) return;

    room.send('add-comment', {
      content: newComment,
      postId: postId
    });

    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!room) return;

    room.send('delete-comment', {
      commentId: commentId
    });
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingComment(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (!room || !editingComment || !editContent.trim()) return;

    room.send('edit-comment', {
      commentId: editingComment,
      content: editContent
    });

    setEditingComment(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        실시간 댓글 ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성해보세요..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            댓글 작성
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-4 pl-4 py-3" style={{ borderLeftColor: comment.authorColor }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="font-semibold text-sm px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: comment.authorColor }}
                    >
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                      {comment.isEdited && <span className="ml-1">(편집됨)</span>}
                    </span>
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>
                
                {/* Action buttons - only show for own comments */}
                {comment.authorId === room?.sessionId && editingComment !== comment.id && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditComment(comment.id, comment.content)}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors duration-200"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors duration-200"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;