import React, { useState } from 'react';
import styles from './Comment.module.css';
import Reply from '../reply/page';
import { CommentItem } from '@/types/interface';
import { useInView } from 'react-intersection-observer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
interface Props {
  commentsList: CommentItem; // 댓글 데이터
}

export default function Comment({ commentsList }: Props) {
  const { commentId, content, createdAt, user } = commentsList;
  const [clickReply, setClickReply] = useState<number | null>(null); // 클릭된 대댓글의 ID 관리
  const handleToggleReply = (commentId: number) => {
    setClickReply((prev) => (prev === commentId ? null : commentId));
  };
  const date = new Date(createdAt); // 문자열을 Date 객체로 변환
  console.log(date.toLocaleString()); // 읽기 쉬운 포맷으로 출력
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
              <div className={styles['comment-write-time']}>
                {formatDateToKorean(getElapsedTime())}
              </div>
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
