import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { commentApi } from '../../services/commentApi';
import './detail.css';

export const CommentSection = ({ movieId }) => {
  const { isLoggedIn, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated likes persistence using LocalStorage
  const [likedComments, setLikedComments] = useState(() => {
    const saved = localStorage.getItem('cinema_comment_likes');
    return saved ? JSON.parse(saved) : {};
  });

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await commentApi.getByMovieId(movieId);
        setComments(data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [movieId]);

  // Persist likes
  useEffect(() => {
    localStorage.setItem('cinema_comment_likes', JSON.stringify(likedComments));
  }, [likedComments]);

  // Handle post new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const newComment = await commentApi.create({
        movieId,
        content: commentText.trim()
      });

      // Insert comment along with user details locally so it displays immediately
      const fullComment = {
        ...newComment,
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl
        }
      };

      setComments(prev => [fullComment, ...prev]);
      setCommentText('');
    } catch (error) {
      alert("Đã xảy ra lỗi khi gửi bình luận!");
    }
  };

  // Handle post reply
  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const newComment = await commentApi.create({
        movieId,
        parentId,
        content: replyText.trim()
      });

      const fullComment = {
        ...newComment,
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl
        }
      };

      setComments(prev => [...prev, fullComment]); // append reply to end
      setReplyText('');
      setReplyToId(null);
    } catch (error) {
      alert("Đã xảy ra lỗi khi gửi phản hồi!");
    }
  };

  // Handle like toggle (Simulated)
  const handleLikeToggle = (commentId) => {
    setLikedComments(prev => {
      const isLiked = !!prev[commentId];
      return {
        ...prev,
        [commentId]: !isLiked
      };
    });
  };

  // Filter root comments and group nested replies
  const { rootComments, replyMap } = useMemo(() => {
    const roots = [];
    const replies = {};

    comments.forEach(comment => {
      if (comment.parentId) {
        if (!replies[comment.parentId]) {
          replies[comment.parentId] = [];
        }
        replies[comment.parentId].push(comment);
      } else {
        roots.push(comment);
      }
    });

    // Sort replies chronologically
    Object.keys(replies).forEach(key => {
      replies[key].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    return { rootComments: roots, replyMap: replies };
  }, [comments]);

  const getSimulatedLikeCount = (commentId) => {
    // Generate a static like count based on comment ID to look realistic
    const baseLikes = (commentId * 7) % 23;
    const isLikedByUser = !!likedComments[commentId];
    return baseLikes + (isLikedByUser ? 1 : 0);
  };

  const renderCommentItem = (comment, isNested = false) => {
    const isLiked = !!likedComments[comment.id];
    const likesCount = getSimulatedLikeCount(comment.id);
    const hasReplies = replyMap[comment.id] && replyMap[comment.id].length > 0;

    return (
      <div key={comment.id} className="comment-block-wrapper">
        <div className={`comment-item ${isNested ? 'nested' : ''}`}>
          <img 
            src={comment.user?.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
            alt={comment.user?.username} 
            className="comment-avatar"
          />
          <div className="comment-content-block">
            <div className="comment-author-row">
              <span className="comment-author">{comment.user?.username || 'Ẩn danh'}</span>
              <span className="comment-time">
                {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="comment-text">{comment.content}</p>
            
            <div className="comment-interactions">
              <button 
                className={`comment-interaction-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => handleLikeToggle(comment.id)}
              >
                👍 {likesCount} Thích
              </button>
              
              {!isNested && isLoggedIn && (
                <button 
                  className="comment-interaction-btn"
                  onClick={() => {
                    setReplyToId(replyToId === comment.id ? null : comment.id);
                    setReplyText('');
                  }}
                >
                  💬 Phản hồi
                </button>
              )}
            </div>

            {/* Inline reply form */}
            {replyToId === comment.id && isLoggedIn && (
              <form className="comment-reply-form" onSubmit={(e) => handleSubmitReply(e, comment.id)}>
                <textarea
                  placeholder="Viết câu trả lời của bạn..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="comment-textarea"
                  style={{ minHeight: '60px' }}
                />
                <div className="comment-actions-row">
                  <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', borderRadius: '15px' }}>
                    Gửi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Render nested replies */}
        {hasReplies && replyMap[comment.id].map(reply => renderCommentItem(reply, true))}
      </div>
    );
  };

  return (
    <div className="comments-card">
      <h2 className="movie-specs-title">Bình luận ({comments.length})</h2>

      {/* Auth State wrapper */}
      {!isLoggedIn ? (
        <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-button)', borderRadius: '8px', marginBottom: '30px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Vui lòng đăng nhập để tham gia bình luận và thảo luận về phim.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ borderRadius: '20px', padding: '6px 20px' }}>
            Đăng nhập ngay
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitComment} className="comment-input-area">
          <textarea
            placeholder="Để lại bình luận của bạn tại đây..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="comment-textarea"
            required
          />
          <div className="comment-actions-row">
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '20px', padding: '8px 24px' }}>
              Bình luận
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Đang tải bình luận...</p>
      ) : rootComments.length > 0 ? (
        <div className="comment-list">
          {rootComments.map(comment => renderCommentItem(comment))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
      )}
    </div>
  );
};
