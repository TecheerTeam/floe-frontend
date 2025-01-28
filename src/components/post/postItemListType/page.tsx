'use client';
import { useRouter } from 'next/navigation'; // Next.js 라우터
import React from 'react';
import styles from './Post.List.module.css';
import { RecordListItem } from '@/types/interface';
import { useQuery } from '@tanstack/react-query';
import {
  getCommentRequest,
  getLikeCountRequest,
  getLikeListRequest,
  getSaveCountRecordRequest,
} from '@/apis';

const formatElapsedTime = (createdAt: string) => {
  // 배열을 'YYYY-MM-DD HH:mm:ss' 형식으로 변환
  const formattedDate = `${createdAt[0]}-${String(createdAt[1]).padStart(2, '0')}-${String(createdAt[2]).padStart(2, '0')} ${String(createdAt[3]).padStart(2, '0')}:${String(createdAt[4]).padStart(2, '0')}:${String(createdAt[5]).padStart(2, '0')}`;

  // 생성된 날짜를 Date 객체로 변환
  const date = new Date(formattedDate);
  const now = new Date();

  // 날짜 차이 계산
  const diffInMs = now.getTime() - date.getTime(); // 밀리초 차이
  const diffInSec = diffInMs / 1000; // 초
  const diffInMin = diffInSec / 60; // 분
  const diffInHour = diffInMin / 60; // 시간
  const diffInDay = diffInHour / 24; // 일

  // "몇 분 전", "몇 시간 전", "몇 일 전" 형식으로 변환
  if (diffInDay >= 1) {
    const daysAgo = Math.floor(diffInDay);
    return `${daysAgo}일 전`;
  } else if (diffInHour >= 1) {
    const hoursAgo = Math.floor(diffInHour);
    return `${hoursAgo}시간 전`;
  } else if (diffInMin >= 1) {
    const minutesAgo = Math.floor(diffInMin);
    return `${minutesAgo}분 전`;
  } else {
    return '방금 전';
  }
};
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';
interface PostItemListTypeProps {
  recordListItem: RecordListItem; // 게시물 데이터
}

export default function PostItemListType({
  recordListItem,
}: PostItemListTypeProps) {
  const {
    recordId,
    user,
    title,
    content,
    medias,
    tagNames,
    createdAt,
    likeCount,
    commentCount,
    saveCount,
  } = recordListItem;

  //     state: 쿠키     //
  const [cookies] = useCookies();
  //        state : 라우팅     //
  const router = useRouter();

  //     event handler: 클릭 이벤트 처리     //
  const handleCardClick = () => {
    // recordId를 기반으로 게시글 상세 페이지로 이동
    router.push(`/post/${recordId}`);
  };
  const { data: commentData } = useQuery({
    queryKey: ['comments', recordId],
    queryFn: async () => {
      const response = await getCommentRequest(
        recordId,
        0,
        1,
        cookies.accessToken,
      ); // 첫 번째 페이지에서 댓글 데이터 요청
      console.log('comment count: ', response.data.totalElements);
      return response.data.totalElements; // 총 댓글 수 반환
    },
    staleTime: 10000, // 캐시 유지 시간 (10초)
    refetchOnWindowFocus: true, // 창이 포커스될 때 다시 데이터 요청
  });
  //          function: 좋아요 개수 업데이트          //
  const { data: likeData } = useQuery({
    queryKey: ['likes', recordId],
    queryFn: async () => {
      const response = await getLikeCountRequest(recordId, cookies.accessToken); // 첫 번째 페이지에서 댓글 데이터 요청
      console.log('like count in query: ', response.data.count);
      return response.data.count; // 총 댓글 수 반환
    },
    staleTime: 10000, // 캐시 유지 시간 (10초)
    refetchOnWindowFocus: true, // 창이 포커스될 때 다시 데이터 요청
  });
  //          function: 저장 개수 업데이트          //
  const { data: saveData } = useQuery({
    queryKey: ['saves', recordId],
    queryFn: async () => {
      const response = await getSaveCountRecordRequest(
        recordId,
        cookies.accessToken,
      ); // 첫 번째 페이지에서 댓글 데이터 요청
      console.log('save count in query: ', response.data.count);
      return response.data.count; // 총 댓글 수 반환
    },
    staleTime: 10000, // 캐시 유지 시간 (10초)
    refetchOnWindowFocus: true, // 창이 포커스될 때 다시 데이터 요청
  });
  //          function: 좋아요 여부 업데이트          //
  const { data: likeListData } = useQuery({
    queryKey: ['likeList', recordId],
    queryFn: async () => {
      const response = await getLikeListRequest(recordId, cookies.accessToken);

      return response.data.likeList; // 좋아요한 사용자 목록 반환
    },
    staleTime: 10000,
  });
  const isLikedByUser = likeListData?.some(
    (like: { userName: string }) => like.userName === user.nickname,
  );

  //          render: 게시물 카드형 렌더링          //
  return (
    <div className={styles['list-container']} onClick={handleCardClick}>
      <div className={styles['list-top']}>
        <div className={styles['profile-image-box']}>
          {user.profileImage ? (
            <div
              className={styles['profile-image']}
              style={{
                backgroundImage: `url(${user.profileImage})`,
              }}></div>
          ) : (
            <div
              className={`${styles['profile-image']} ${styles['default-profile-image']}`}></div>
          )}
        </div>
        <div className={styles['user-nickname']}>{user.nickname}</div>
        <div className={styles['create-at']}>
          {formatElapsedTime(createdAt)}
        </div>
        {/* profileimgae-box와 user-nickname 클릭시 해당 유저의 프로필로 이동해야함 */}
        <div className={styles['stack-tag-box']}>
          <div className={styles['stack-tag']}>
            {tagNames.map((tag, index) => (
              <span key={index} className={styles['stack-tag']}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles['list-main']}>
        <div className={styles['text-container']}>
          <div className={styles['list-title']}>{title}</div>
          <div className={styles['list-content']}>{content}</div>
        </div>
        {medias.length > 0 && (
          <div className={styles['list-image']}>
            <img
              src={medias[0].mediaUrl}
              alt="Media"
              className={styles['title-image']}
            />
          </div>
        )}
      </div>

      <div className={styles['list-bottom']}>
        <div className={styles['list-like-box']}>
          <div className={styles['list-like-icon']}></div>
          <div className={styles['list-like-count']}>
            {' '}
            {likeData ?? likeCount}
          </div>
        </div>

        <div className={styles['list-comment-box']}>
          <div className={styles['list-comment-icon']}></div>
          <div className={styles['list-comment-count']}>
            {commentData ?? commentCount}
          </div>
        </div>

        <div className={styles['list-save-box']}>
          <div className={styles['list-save-icon']}></div>
          <div className={styles['list-save-count']}>
            {' '}
            {saveData ?? saveCount}
          </div>
        </div>
      </div>
    </div>
  );
}
