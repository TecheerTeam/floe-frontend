'use client';
import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import styles from './Reply.module.css';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { CommentItem, RecordItem } from '@/types/interface';
import {
  deleteCommentLikeRequest,
  deleteCommentRequest,
  getCommentLikeCountRequest,
  getCommentLikeListRequest,
  postCommentLikeRequest,
  putCommentRequest,
} from '@/apis';
import { comment } from 'postcss';
import { PutCommentRequestDto } from '@/apis/request/record';

interface Props {
  replyList: CommentItem; // 댓글 데이터
}

export default function Reply({ replyList }: Props) {
  //     state: React Query Client 사용   //
  const queryClient = useQueryClient();
  //     state: 쿠키     //
  const [cookies] = useCookies();
  //        state: 게시물 상태(zustand)        //
  const [record, setRecord] = useState<RecordItem | null>(null);
  //        state: props 인자 상태        //
  const {
    commentId,
    content,
    createdAt,
    parentId,
    user: replyWriter,
  } = replyList;
  //        state: 현재 로그인한 사용자        //
  const { user: logInUser } = useLoginUserStore(); // 현재 로그인한 사용자
  //      state: 수정 모드 여부 상태      //
  const [isEditing, setIsEditing] = useState<boolean>(false);
  //      state: 수정 중인 댓글 내용 상태      //
  const [editContent, setEditContent] = useState<string>(content);
  //      state: 수정 중인 대댓글 참조 상태      //
  const editReplyRef = useRef<HTMLInputElement | null>(null);
  //      state: 댓글/대댓글 좋아요 아이콘 버튼 클릭 상태      //
  const [isLike, setIsLike] = useState<boolean>(false);
  //      state : 댓글/대댓글좋아요 개수 상태        //
  const [likeCount, setLikeCount] = useState<number>(0);

  //   event handler: 댓글 수정 토글 버튼   //
  const onEditReplyClickHandler = async () => {
    if (logInUser?.email !== replyWriter.email) {
      alert('댓글 수정 권한이 없습니다.');
      return;
    }
    setIsEditing((prev) => !prev); // 수정 모드 활성화
  };

  //     event handler: 댓글 삭제 버튼 클릭 처리     //
  const onDeleteReplyClickHandler = async () => {
    if (logInUser?.email !== replyWriter.email) {
      alert('댓글 삭제 권한이 없습니다.');
      return;
    }
    try {
      // 서버에 대댓글 삭제 요청
      const response = await deleteCommentRequest(
        commentId,
        cookies.accessToken,
      );

      if (response.code === 'C003') {
        queryClient.setQueryData(['reply'], (oldData: any) => {
          if (!oldData) return oldData; // 기존 데이터가 없으면 반환
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                content: page.data.content.filter(
                  (reply: CommentItem) => reply.commentId !== commentId,
                ),
              },
            })),
          };
        });
        queryClient.invalidateQueries({ queryKey: ['reply'] });
      }
    } catch (error) {
      console.error('댓글 삭제 서버 오류:', error);
    }
  };
  const onReplyCommentApplyClickHandler = async () => {
    if (logInUser?.email !== replyWriter.email) {
      alert('댓글 수정 권한이 없습니다.');
      return;
    }
    try {
      const requestBody = { content: editContent } as PutCommentRequestDto;
      const response = await putCommentRequest(
        commentId,
        requestBody,
        cookies.accessToken,
      );
      if (response.code === 'C004') {
        setIsEditing(false); // 수정 모드 종료

        queryClient.setQueryData(['reply', commentId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                content: page.data.content.map((reply: CommentItem) =>
                  reply.commentId === commentId
                    ? { ...reply, content: editContent } // 수정된 댓글 업데이트
                    : reply,
                ),
              },
            })),
          };
        });
        queryClient.invalidateQueries({ queryKey: ['reply'] });
      }
    } catch (error) {
      console.error('댓글 삭제 서버 오류:', error);
    }
  };

  const onCommentLikeIconClickHandler = async () => {
    if (!cookies.accessToken || !commentId) return;

    try {
      if (isLike) {
        await deleteCommentLikeRequest(commentId, cookies.accessToken);
        setIsLike(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await postCommentLikeRequest(commentId, cookies.accessToken);
        setIsLike(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('댓 좋아요 서버 오류:', error);
    }
  };
  const fetchCommentLikeCount = async () => {
    if (!cookies.accessToken || !commentId) return;

    try {
      const response = await getCommentLikeCountRequest(
        commentId,
        cookies.accessToken,
      );
      if (response.code === 'CL01') {
        setLikeCount(response.data.count);
      }
    } catch (error) {
      console.error('fetch Like Count Error', error);
    }
  };

  const fetchCommentLikeStatus = async () => {
    if (!commentId || !cookies.accessToken) return;

    try {
      const response = await getCommentLikeListRequest(
        commentId,
        cookies.accessToken,
      );
      const isLiked = response.data.commentLikeUsers.some(
        (like: { Nickname: string }) => like.Nickname === replyWriter?.nickname,
      );
      setIsLike(isLiked); // isLike 상태 업데이트
    } catch (error) {
      console.error('fetch Like Count Error', error);
    }
  };

  useEffect(() => {
    fetchCommentLikeCount();
    fetchCommentLikeStatus();
  }, [commentId, cookies.accessToken]);
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
              {replyWriter?.nickname}
            </div>
            <div className={styles['reply-text']}>
              {isEditing ? (
                <div className={styles['edit-mode']}>
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={styles['edit-input']}
                    ref={editReplyRef}
                  />
                  <button
                    onClick={onReplyCommentApplyClickHandler}
                    className={styles['save-button']}>
                    Apply
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={styles['cancel-button']}>
                    Cancel
                  </button>
                </div>
              ) : (
                content
              )}
            </div>
            <div className={styles['reply-like-container']}>
              <div className={styles['reply-like-count']}>{likeCount}</div>
              {isLike ? (
                <div
                  className={styles['reply-like-icon-active']}
                  onClick={onCommentLikeIconClickHandler}></div>
              ) : (
                <div
                  className={styles['reply-like-icon']}
                  onClick={onCommentLikeIconClickHandler}></div>
              )}
            </div>
            {logInUser?.email === replyWriter.email && (
              <div className={styles['reply-EditOrDelete']}>
                <div
                  className={styles['reply-Edit']}
                  onClick={onEditReplyClickHandler}>
                  {'Edit'}
                </div>
                <div className={styles['reply-Divider']}>{'|'}</div>
                <div
                  className={styles['reply-Delete']}
                  onClick={onDeleteReplyClickHandler}>
                  {' Delete'}
                </div>
              </div>
            )}
            <div className={styles['reply-write-time']}>{}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
