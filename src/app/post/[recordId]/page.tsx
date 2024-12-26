'use client';
import React, { useState, useEffect } from 'react';
import styles from './PostDetail.module.css';
import Header from '../../header/page';
import NavBar from '../../navBar/page';
import Comment from '@/components/comment/page';
import { useParams } from 'next/navigation';
import { CommentItem, LikeItem } from '@/types/interface';

export default function PostDetail() {
  const { recordId } = useParams(); // URL에서 recordId를 가져옴
  const record = recordId
    ? mockRecord.find((item) => item.recordId === Number(recordId))
    : undefined;

  if (!record) {
    return (
      <div className={styles['error-message']}>게시글을 찾을 수 없습니다.</div>
    );
  }

  // 좋아요와 댓글 데이터
  const [likeCount, setLikeCount] = useState<LikeItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentCount, setCommentCount] = useState<CommentItem[]>([]);
  //          state: 좋아요 아이콘 버튼 클릭 상태          //
  const [likeClick, setLikeClick] = useState<boolean>(false);
  //          state: 댓글 아이콘 버튼 클릭 상태          //
  const [commentClick, setCommentClick] = useState<boolean>(false);
  //          state: 저장 아이콘 버튼 클릭 상태          //
  const [saveClick, setSaveClick] = useState<boolean>(false);
  //          state: 댓글창 팝업 상태          //
  const [showCommentSection, setShowCommentSection] = useState<boolean>(false);

  //          function: 댓글창 팝업 여부 관리 함수          //
  const toggleCommentSection = () => {
    setShowCommentSection((prev) => !prev);
  };

  //          render: 렌더링          //
  return (
    <>
      <Header />
      <div className={styles['post-detail-page-container']}>
        <aside className={styles['navbar']}>
          <NavBar />
        </aside>
        <div className={styles['post-detail-item-container']}>
          <div className={styles['post-detail-top']}>
            <div className={styles['profile-image-box']}>
              {record.user.profileImage ? (
                <img
                  src={record.user.profileImage}
                  alt="프로필 이미지"
                  className={styles['profile-image']}
                />
              ) : (
                <div className={styles['default-profile-image']}></div>
              )}
            </div>
            <div className={styles['user-nickname']}>
              {record.user.nickname}
            </div>
            {/* profileimgae-box와 user-nickname 클릭시 해당 유저의 프로필로 이동해야함 */}
          </div>

          <div className={styles['post-detail-main']}>
            <div className={styles['stack-tag-box']}>
              {record.tagNames.map((tag, index) => (
                <span key={index} className={styles['stack-tag']}>
                  {tag}
                </span>
              ))}
            </div>

            <div className={styles['post-detail-title']}>{record.title}</div>
            <div className={styles['post-detail-content']}>
              {record.content}
            </div>
            {record.medias.length > 0 && (
              <div className={styles['post-detail-image-container']}>
                {record.medias.map((media) => (
                  <img
                    key={media.mediaId}
                    src={media.mediaUrl}
                    alt="게시물 이미지"
                    className={styles['post-detail-images']}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles['post-detail-bottom']}>
            <div className={styles['post-detail-like-box']}>
              {/* 좋아요 아이콘 클릭시 해당 게시글의 좋아요 count 증감 */}
              <div className={styles['post-detail-like-icon']}></div>
              <div className={styles['post-detail-like-count']}>
                {'likeCount'}
              </div>
            </div>

            <div className={styles['post-detail-comment-box']}>
              <div
                className={styles['post-detail-comment-icon']}
                onClick={toggleCommentSection}></div>
              <div className={styles['post-detail-comment-count']}>
                {comments.length}
              </div>
            </div>

            <div className={styles['post-detail-save-box']}>
              {/* 저장 아이콘 클릭시 해당 게시글 스크랩 */}
              <div className={styles['post-detail-save-icon']}></div>
              <div className={styles['post-detail-save-count']}>
                {'saveCount'}
              </div>
            </div>

            <div className={styles['post-detail-upload-time']}>
              {record.createdAt}
            </div>
          </div>
          {showCommentSection && (
            <div className={styles['comment-section']}>
              <div className={styles['comment-header']}>
                Comment <span>20개</span>
              </div>

              <div className={styles['comment-input-container']}>
                <div className={styles['user-profile-box']}>
                  <div className={styles['user-profile-image']}></div>
                  <div className={styles['user-profile-nickname']}>
                    {'Kgccm'}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="댓글 추가..."
                  className={styles['comment-input']}
                />
                <div className={styles['comment-Apply-Button']}>Apply</div>
              </div>
              <Comment />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
