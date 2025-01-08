'use client';
import { useRouter } from 'next/navigation'; // Next.js 라우터
import React from 'react';
import styles from './Post.Card.module.css';
import { RecordListItem } from '@/types/interface';
import { useQuery } from '@tanstack/react-query';
import { getCommentRequest, getLikeCountRequest } from '@/apis';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useCookies } from 'react-cookie';
dayjs.extend(utc);
dayjs.extend(timezone);
interface PostItemCardTypeProps {
  recordListItem: RecordListItem; // 게시물 데이터
}

export default function PostItemCardType({
  recordListItem,
}: PostItemCardTypeProps) {
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
  //          function: 댓글 개수 업데이트          //
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
  //          function: 좋아요요 개수 업데이트          //
  const { data: likeData } = useQuery({
    queryKey: ['like', recordId],
    queryFn: async () => {
      const response = await getLikeCountRequest(recordId, cookies.accessToken); // 첫 번째 페이지에서 댓글 데이터 요청
      console.log('like count in query: ', response.data.count);
      return response.data.count; // 총 댓글 수 반환
    },
    staleTime: 10000, // 캐시 유지 시간 (10초)
    refetchOnWindowFocus: true, // 창이 포커스될 때 다시 데이터 요청
  });
  //          function: 작성일 경과시간 함수          //
  const getElapsedTime = () => {
    const now = dayjs().tz('Asia/Seoul'); // 현재 시간을 한국 시간으로 계산
    const writeTime = dayjs(createdAt).tz('Asia/Seoul'); // 작성 시간을 한국 시간으로 변환

    const gap = now.diff(writeTime, 's'); // 초 단위 차이 계산
    if (gap < 60) return `${gap}초 전`;
    if (gap < 3600) return `${Math.floor(gap / 60)}분 전`;
    if (gap < 86400) return `${Math.floor(gap / 3600)}시간 전`;
    return `${Math.floor(gap / 86400)}일 전`;
  };
  const formatDateToKorean = (date: string) => {
    return dayjs(date).tz('Asia/Seoul').format('YYYY년 MM월 DD일 HH:mm:ss');
  };
  //          render: 게시물 카드형 렌더링          //
  return (
    <div className={styles['card-container']} onClick={handleCardClick}>
      <div className={styles['card-top']}>
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
        <div className={styles['create-at']}>{getElapsedTime()}</div>
        {/* profileimgae-box와 user-nickname 클릭시 해당 유저의 프로필로 이동해야함 */}
      </div>

      <div className={styles['card-main']}>
        {/* 게시글 내용 전체 클릭시 해당 게시글 디테일페이지로 이동 */}
        <div className={styles['stack-tag-box']}>
          <div className={styles['stack-tag']}>
            {tagNames.map((tag, index) => (
              <span key={index} className={styles['stack-tag']}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={styles['card-title']}>{title}</div>
        <div className={styles['card-content']}>{content}</div>
        {medias.length > 0 && (
          <div className={styles['card-image']}>
            <img
              src={medias[0].mediaUrl}
              alt="Media"
              className={styles['title-image']}
            />
          </div>
        )}
      </div>

      <div className={styles['card-bottom']}>
        <div className={styles['card-like-box']}>
          {/* 좋아요 아이콘 클릭시 해당 게시글의 좋아요 count 증감 */}
          <div className={styles['card-like-icon']}></div>
          <div className={styles['card-like-count']}>
            {likeData ?? likeCount}
          </div>
        </div>

        <div className={styles['card-comment-box']}>
          {/* 댓글 아이콘 클릭시 해당 게시글 디테일 페이지로 이동 */}
          <div className={styles['card-comment-icon']}></div>
          <div className={styles['card-comment-count']}>
            {commentData ?? commentCount}
          </div>
        </div>

        <div className={styles['card-save-box']}>
          {/* 저장 아이콘 클릭시 해당 게시글 스크랩 */}
          <div className={styles['card-save-icon']}></div>
          <div className={styles['card-save-count']}>{saveCount}</div>
        </div>
      </div>
    </div>
  );
}
