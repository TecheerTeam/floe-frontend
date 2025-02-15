'use client';

import React, { useState, useEffect } from 'react';
import styles from './PostDetail.module.css';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';
import { getLikeListRequest, getIsSaveRecordRequest } from '@/apis';
import { RecordItem } from '@/types/interface';

interface PostDetailProps {
  record: RecordItem & {
    comments: any[];
    likeCount: number;
  };
}

export default function PostDetail({ record }: PostDetailProps) {
  const router = useRouter();
  const [cookies] = useCookies();
  const { user } = useLoginUserStore();
  
  // ✅ SSR로 받은 데이터 활용
  const [likeCount, setLikeCount] = useState(record.likeCount);
  const [commentList, setCommentList] = useState(record.comments);
  
  // ✅ CSR로 가져와야 하는 데이터 (유저별 좋아요/저장 여부)
  const [isLike, setIsLike] = useState(false);
  const [isSave, setIsSave] = useState(false);

  // ✅ 유저가 좋아요를 눌렀는지 확인 (CSR)
  useEffect(() => {
    if (!cookies.accessToken || !record) return;

    const fetchLikeStatus = async () => {
      try {
        const response = await getLikeListRequest(record.recordId, cookies.accessToken);
        const isLiked = response.data.likeList.some(like => like.userName === user?.nickname);
        setIsLike(isLiked);
      } catch (error) {
        console.error('좋아요 상태 가져오기 오류:', error);
      }
    };

    fetchLikeStatus();
  }, [record, cookies.accessToken]);

  // ✅ 유저가 저장했는지 확인 (CSR)
  useEffect(() => {
    if (!cookies.accessToken || !record) return;

    const fetchSaveStatus = async () => {
      try {
        const response = await getIsSaveRecordRequest(record.recordId, cookies.accessToken);
        setIsSave(response.data.saved);
      } catch (error) {
        console.error('저장 상태 가져오기 오류:', error);
      }
    };

    fetchSaveStatus();
  }, [record, cookies.accessToken]);

  return (
    <div className={styles['post-detail-container']}>
      <h1>{record.title}</h1>
      <p>{record.content}</p>
      <p>좋아요: {likeCount}</p>
      <p>댓글 개수: {commentList.length}</p>
      <button>{isLike ? '❤️ 좋아요 취소' : '🤍 좋아요'}</button>
      <button>{isSave ? '🔖 저장 취소' : '📌 저장'}</button>
    </div>
  );
}
