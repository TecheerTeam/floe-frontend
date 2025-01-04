'use client';
import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import styles from './Reply.module.css';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { CommentItem } from '@/types/interface';

interface Props {
  replyList: CommentItem; // 댓글 데이터
}

export default function Reply({ replyList }: Props) {
  const { commentId, content, createdAt, parentId, user } = replyList;
  return (
    <div className={styles['reply-container']}>
      <div className={styles['reply-item-list-container']}>
        <div className={styles['reply-item-list']}>
          <div className={styles['reply-item']}>
            <div className={styles['reply-user-profile-image']}></div>
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
