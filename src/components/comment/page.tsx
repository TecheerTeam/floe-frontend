import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import styles from './Comment.module.css';
import Reply from '../reply/page';
import { CommentItem, RecordItem } from '@/types/interface';
import { useInView } from 'react-intersection-observer';
import {
  QueryClient,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';
import {
  deleteCommentRequest,
  getCommentRequest,
  getReplyRequest,
  postCommentRequest,
  putCommentRequest,
} from '@/apis';
import {
  PostCommentRequestDto,
  PutCommentRequestDto,
} from '@/apis/request/record';
import { GetCommentResponseDto } from '@/apis/response/record';
dayjs.extend(utc);
dayjs.extend(timezone);
interface Props {
  commentsList: CommentItem; // 댓글 데이터
}

export default function Comment({ commentsList }: Props) {
  const { commentId, content, createdAt, user: commentWriter } = commentsList;
  const { user: logInUser } = useLoginUserStore(); // 현재 로그인한 사용자
  const [clickReply, setClickReply] = useState<number | null>(null); // 클릭된 대댓글의 ID 관리
  const handleToggleReply = (commentId: number) => {
    setClickReply((prev) => (prev === commentId ? null : commentId));
  };
  //     state: React Query Client 사용   //
  const queryClient = useQueryClient();
  //     state: 대댓글 입력 참조 상태     //
  const replyRef = useRef<HTMLInputElement | null>(null);
  //     state: 쿠키     //
  const [cookies] = useCookies();
  //     state: 무한 스크롤 view 참조 상태     //
  const { ref, inView } = useInView();
  //        state: 게시물 상태(zustand)        //
  const [record, setRecord] = useState<RecordItem | null>(null);
  //        state : 라우팅     //
  const router = useRouter();
  //        state: record Id varibale 상태        //
  const { recordId } = useParams(); // URL에서 recordId를 가져옴
  //      state: 대댓글 입력 상태      //
  const [newReply, setNewReply] = useState<string>('');
  //      state: 대댓글 목록 상태      //
  const [replyList, setReplyList] = useState<CommentItem[]>([]);
  //      state: 수정 모드 여부 상태      //
  const [isEditing, setIsEditing] = useState<boolean>(false);
  //      state: 수정 중인 댓글 내용 상태      //
  const [editContent, setEditContent] = useState<string>(content);
  //      state: 수정 중인 댓글 참조 상태      //
  const editCommentRef = useRef<HTMLInputElement | null>(null);
  //     function: 댓글 무한 스크롤     //
  const {
    data, // 불러온 댓글 데이터
    refetch, // 데이터 최신화
    fetchNextPage, // 다음 페이지 요청
  } = useInfiniteQuery({
    queryKey: ['reply', commentId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getReplyRequest(
        commentId,
        pageParam,
        5,
        cookies.accessToken,
      );

      return response; // data만 반환
    },
    getNextPageParam: (last: GetCommentResponseDto) => {
      if (!last || last.data.last) {
        return undefined;
      }
      console.log('current page: ', last.data.pageable.pageNumber);
      console.log('Next page:', last.data.pageable.pageNumber + 1);
      return last.data.pageable.pageNumber + 1;
    },

    initialPageParam: 0,
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
  //    event handler: 대댓글 입력 변경 처리    //
  const onReplyChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!replyRef.current) return;
    setNewReply(value);
    console.log('입력중인 대댓글: ', newReply);
  };
  //          function : 대댓글 입력 버튼 처리 함수          //
  const onApplyClickHandler = async () => {
    if (!newReply.trim()) {
      alert('대댓글을 입력해주세요.');
      return;
    }
    if (!commentWriter || !cookies.accessToken) {
      alert('로그인 먼저 해주세요.');
      router.push('/auth');
      return;
    }
    if (!recordId) {
      alert('존재하지 않는 게시물입니다');
      return;
    }
    if (!commentId) {
      alert('존재하지 않는 댓글입니다.');
      return;
    }
    const requestBody = {
      recordId: Number(recordId), // 게시글 ID
      content: newReply,
      parentId: commentId, //대댓글일 경우 부모 ID는 해당 댓글의 ID
    } as PostCommentRequestDto;
    try {
      const response = await postCommentRequest(
        requestBody,
        cookies.accessToken,
      );
      if (response?.code === 'C001') {
        setReplyList((prev) => [
          {
            commentId: response.commentId,
            user: {
              nickname: commentWriter.nickname,
              email: commentWriter.email,
              profileImage: commentWriter.profileImage,
            },
            content: newReply,
            createdAt: new Date(),
            parentId: commentId,
          },
          ...prev,
        ]);
        setNewReply(''); // 댓글 입력란 초기화
        await refetch();
      } else {
        alert('댓글 작성에 실패했습니다.');
        console.log('reply:', requestBody);
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
    }
  };

  //     event handler: 댓글 수정 Input 열기 이벤트 처리     //
  const onEditCommentClickHandler = () => {
    if (logInUser?.email !== commentWriter.email) {
      alert('댓글 수정 권한이 없습니다.');
      return;
    }
    setIsEditing((prev) => !prev); // 수정 모드 활성화
  };
  //     event handler: 댓글 수정 적용 처리     //
  const onEditCommentApplyClickHandler = async () => {
    if (logInUser?.email !== commentWriter.email) {
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

        queryClient.setQueryData(['comments', recordId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                content: page.data.content.map((comment: CommentItem) =>
                  comment.commentId === commentId
                    ? { ...comment, content: editContent } // 수정된 댓글 업데이트
                    : comment,
                ),
              },
            })),
          };
        });
      }
    } catch (error) {
      console.error('댓글 삭제 서버 오류:', error);
    }
  };
  //     event handler: 댓글 삭제 버튼 클릭 처리     //
  const onDeleteCommentClickHandler = async () => {
    if (logInUser?.email !== commentWriter.email) {
      alert('댓글 삭제 권한이 없습니다.');
      return;
    }

    try {
      const response = await deleteCommentRequest(
        commentId,
        cookies.accessToken,
      );
      if (response.code === 'C003') {
        queryClient.setQueryData(['comments', recordId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                content: page.data.content.filter(
                  (comment: CommentItem) => comment.commentId !== commentId,
                ),
              },
            })),
          };
        });
      }
    } catch (error) {
      console.error('댓글 삭제 서버 오류:', error);
    }
  };

  //          effect: comment Id path variable 바뀔떄마다 해당 대댓글 데이터 불러오기 (무한스크롤)     //
  useEffect(() => {
    fetchNextPage();
    console.log('현재 로그인 이메일 :', logInUser?.email);
    console.log('댓 작성 이메일 :', commentWriter.email);
  }, [commentId, inView]);

  return (
    <>
      <div key={commentId} className={styles['comment-item-list-container']}>
        <div className={styles['comment-item-list']}>
          <div className={styles['comment-item']}>
            <div className={styles['comment-item-top']}>
              {record?.user.profileImage ? (
                <img
                  src={record.user.profileImage}
                  alt="프로필 이미지"
                  className={styles['comment-user-profile-image']}
                />
              ) : (
                <div className={styles['default-profile-image']}></div>
              )}
              <div className={styles['comment-user-nickname']}>
                {commentWriter.nickname}
              </div>
              <div className={styles['comment-text']}>
                {isEditing ? (
                  <div className={styles['edit-mode']}>
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles['edit-input']}
                      ref={editCommentRef}
                    />
                    <button
                      onClick={onEditCommentApplyClickHandler}
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
              {logInUser?.email === commentWriter.email && (
                <div className={styles['comment-EditOrDelete']}>
                  <div
                    className={styles['comment-Edit']}
                    onClick={onEditCommentClickHandler}>
                    {'Edit'}
                  </div>
                  <div className={styles['comment-Divider']}>{'|'}</div>
                  <div
                    className={styles['comment-Delete']}
                    onClick={onDeleteCommentClickHandler}>
                    {' Delete'}
                  </div>
                </div>
              )}
            </div>

            <div className={styles['comment-item-bottom']}>
              <div className={styles['comment-write-time']}>
                {getElapsedTime()}
              </div>
              <div className={styles['comment-reply-container']}>
                <div
                  className={styles['comment-reply-button']}
                  onClick={() => handleToggleReply(commentId)}>
                  Reply
                </div>
              </div>
            </div>
            {clickReply === commentId && (
              <div className={styles['reply-container']}>
                <div className={styles['reply-item-input-container']}>
                  <div className={styles['user-profile-box']}>
                    {record?.user.profileImage ? (
                      <img
                        src={record.user.profileImage}
                        alt="프로필 이미지"
                        className={styles['user-profile-image']}
                      />
                    ) : (
                      <div className={styles['default-profile-image']}></div>
                    )}
                    <div className={styles['user-profile-nickname']}>
                      {commentWriter?.nickname}
                    </div>
                  </div>
                  <input
                    ref={replyRef}
                    type="text"
                    placeholder="대댓글 추가..."
                    value={newReply}
                    className={styles['reply-input']}
                    onChange={onReplyChangeHandler}
                  />
                  <div
                    className={styles['reply-Apply-Button']}
                    onClick={onApplyClickHandler}>
                    Apply
                  </div>
                </div>
                {Array.isArray(data?.pages) && data?.pages.length > 0 ? (
                  <>
                    {data.pages.map((page, pageIndex) => {
                      if (
                        page.data.content &&
                        Array.isArray(page.data.content)
                      ) {
                        return page.data.content.map((reply) => (
                          <Reply key={reply.commentId} replyList={reply} />
                        ));
                      } else {
                        return <p key={pageIndex}></p>; // content가 없을 때
                      }
                    })}
                    <div ref={ref} style={{ height: '1px' }} />{' '}
                  </>
                ) : (
                  <></> // 데이터가 없을 때
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
