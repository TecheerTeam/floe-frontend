import React, { useState } from 'react';
import styles from './Comment.module.css';
import Reply from '../reply/page';
import { CommentItem } from '@/types/interface';

interface CommentProps {
  comments: CommentItem[]; // 댓글 데이터
}

export default function Comment({ comments }: CommentProps) {
  const [clickReply, setClickReply] = useState<number | null>(null); // 클릭된 대댓글의 ID 관리
  const handleToggleReply = (commentId: number) => {
    setClickReply((prev) => (prev === commentId ? null : commentId));
  };

  return (
    <div className={styles['comment-item-list-container']}>
      {comments.map((comment) => (
        <div key={comment.commentId} className={styles['comment-item']}>
          <div className={styles['comment-item-top']}>
            <div
              className={styles['comment-user-profile-image']}
              style={{
                backgroundImage: `url(${comment.user.profileImage || ''})`,
              }}
            ></div>
            <div className={styles['comment-user-nickname']}>
              {comment.user.nickname}
            </div>
            <div className={styles['comment-text']}>{comment.content}</div>
          </div>

          <div className={styles['comment-item-bottom']}>
            <div className={styles['comment-write-time']}>{comment.createdAt}</div>
            <div className={styles['comment-reply-container']}>
              <div
                className={styles['comment-reply-button']}
                onClick={() => handleToggleReply(comment.commentId)}
              >
                Reply
              </div>
            </div>
          </div>
          {clickReply === comment.commentId && <Reply />}
        </div>
      ))}
    </div>
  );
}
