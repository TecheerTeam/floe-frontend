import React, { useState } from 'react';
import styles from './Comment.module.css';
import Reply from '../reply/page';
import { CommentItem } from '@/types/interface';
import { useInView } from 'react-intersection-observer';
interface Props {
  commentsList: CommentItem; // 댓글 데이터
}

export default function Comment({ commentsList }: Props) {
  const { commentId, content, createdAt, user, parentId } = commentsList;
  const [clickReply, setClickReply] = useState<number | null>(null); // 클릭된 대댓글의 ID 관리
  const handleToggleReply = (commentId: number) => {
    setClickReply((prev) => (prev === commentId ? null : commentId));
  };
  const { ref, inView } = useInView();
  return (
    <>
      <div key={commentId} className={styles['comment-item-list-container']}>
        <div className={styles['comment-item-list']}>
          <div className={styles['comment-item']}>
            <div className={styles['comment-item-top']}>
              <div
                className={styles['comment-user-profile-image']}
                style={{
                  backgroundImage: `url(${user.profileImage || ''})`,
                }}></div>
              <div className={styles['comment-user-nickname']}>
                {user.nickname}
              </div>
              <div className={styles['comment-text']}>{content}</div>
            </div>

            <div className={styles['comment-item-bottom']}>
              <div className={styles['comment-write-time']}>{createdAt}</div>
              <div className={styles['comment-reply-container']}>
                <div
                  className={styles['comment-reply-button']}
                  onClick={() => handleToggleReply(commentId)}>
                  Reply
                </div>
              </div>
            </div>
            {clickReply === commentId && <Reply />}
          </div>
        </div>
      </div>
    </>
  );
}
