'use client';
import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import styles from './Reply.module.css';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { CommentItem, RecordItem } from '@/types/interface';

interface Props {
  replyList: CommentItem; // 댓글 데이터
}
//        state: 게시물 상태(zustand)        //

export default function Reply({ replyList }: Props) {
  const [record, setRecord] = useState<RecordItem | null>(null);
  const { commentId, content, createdAt, parentId, user } = replyList;
  return (
    <div className={styles['reply-container']}>
      <div className={styles['reply-item-list-container']}>
        <div className={styles['reply-item-list']}>
          <div className={styles['reply-item']}>
            {record?.user.profileImage ? (
              <img
                src={record.user.profileImage}
                alt="프로필 이미지"
                className={styles['reply-user-profile-image']}
              />
            ) : (
              <div className={styles['default-profile-image']}></div>
            )}
            <div className={styles['reply-user-nickname']}>
              {user?.nickname}
            </div>
            <div className={styles['reply-text']}>{content}</div>
            <div className={styles['reply-write-time']}>{}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
