'use client';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import styles from './PostDetail.module.css';
import Header from '../../header/page';
import NavBar from '../../navBar/page';
import Comment from '@/components/comment/page';
import { CommentItem, LikeItem, RecordItem } from '@/types/interface';
import { redirect, useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  deleteLikeRequest,
  deleteRecordRequest,
  getCommentRequest,
  getDetailRecordRequest,
  getLikeCountRequest,
  getLikeListRequest,
  postCommentRequest,
  postLikeRequest,
  saveRecordRequest,
  saveCancelRecordRequest,
  getIsSaveRecordRequest,
  getSaveCountRecordRequest,
} from '@/apis';
import {
  GetCommentResponseDto,
  GetDetailRecordResponseDto,
} from '@/apis/response/record';
import { ResponseDto } from '@/apis/response';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';
import { PostCommentRequestDto } from '@/apis/request/record';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { access } from 'fs';
export default function PostDetail() {
  //    state: React Query Client 가져오기     //
  const queryClient = useQueryClient();
  //     state: 쿠키     //
  const [cookies] = useCookies();
  //     state: 무한 스크롤 view 참조 상태     //
  const { ref, inView } = useInView();
  //        state : 라우팅     //
  const router = useRouter();
  //        state: record Id varibale 상태        //
  const { recordId } = useParams(); // URL에서 recordId를 가져옴
  //        state: 유저 로그인 상태        //
  const { user } = useLoginUserStore();
  //        state: 게시물 상태(zustand)        //
  const [record, setRecord] = useState<RecordItem | null>(null);
  //       state : 좋아요 개수 상태        //
  const [likeCount, setLikeCount] = useState<number>(0);
  //       state : 저장 개수 상태        //
  const [saveCount, setSaveCount] = useState<number>(0);
  //       state: 댓글 입력 상태         //
  const [newComment, setNewComment] = useState<string>('');
  //       state: 댓글 목록 상태        //
  const [commentList, setCommentList] = useState<CommentItem[]>([]);
  //          state: 좋아요 아이콘 버튼 클릭 상태          //
  const [isLike, setIsLike] = useState<boolean>(false);
  //          state: 댓글 아이콘 버튼 클릭 상태          //
  const [commentClick, setCommentClick] = useState<boolean>(false);
  //          state: 저장 아이콘 버튼 클릭 상태          //
  const [isSave, setIsSave] = useState<boolean>(false);
  //          state: 댓글창 팝업 상태          //
  const [showCommentSection, setShowCommentSection] = useState<boolean>(false);
  //          state: 댓글 입력 참조 상태          //
  const commentRef = useRef<HTMLInputElement | null>(null);
  //          state: 댓글 총 개수 상태          //
  const [totalCommentCount, setTotalCommentCount] = useState<number>(0);
  //          state: 더보기 버튼 클릭 상태          //
  const [viewEdit, setViewEdit] = useState<boolean>(false);

  //   event handler: 더보기 버튼 클릭 이벤트 처리     //
  const onClickViewEditButton = () => {
    setViewEdit((prev) => !prev); // 상태를 토글
  };
  //     function: recordId가 string|string[] 형식일 경우 number로 변환     //
  const id = Array.isArray(recordId) ? Number(recordId[0]) : Number(recordId);
  if (!id || isNaN(id)) {
    console.error('Invalid recordId:', recordId);
    return undefined;
  }
  //     function: 댓글 무한 스크롤     //
  const {
    data, // 불러온 댓글 데이터
    refetch, // 데이터 최신화
    fetchNextPage, // 다음 페이지 요청
  } = useInfiniteQuery({
    queryKey: ['comments', recordId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getCommentRequest(
        id,
        pageParam,
        5,
        cookies.accessToken,
      );
      console.log('API response', response);
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
  //     function: Infinite Query로 불러온 전체 댓글 데이터 길이이     //
  const totalComments = async () => {
    const response = await getCommentRequest(
      Number(recordId),
      0,
      5,
      cookies.accessToken,
    );
    console.log('total comments', response.data.totalElements);
    setTotalCommentCount(response.data.totalElements);
  };
  //          event handler: 댓글창 팝업 이벤트 처리          //
  const toggleCommentSection = () => {
    setShowCommentSection((prev) => !prev);
  };
  //          event handler: 댓글 입력값 변경 이벤트 처리          //
  const onCommentChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!commentRef.current) return;
    setNewComment(value);
    console.log('입력중인 댓글:', newComment);
  };
  //          event handler: 좋아요 버튼 클릭 이벤트 처리          //
  const onLikeClickHandler = async () => {
    if (!user || !cookies.accessToken) {
      alert('로그인이 필요합니다.');
      return; // 로그인 X / 게시물 X / 토큰 X 시 return;
    }
    try {
      if (isLike) {
        // 좋아요 삭제
        await deleteLikeRequest(id, cookies.accessToken);
        setIsLike(false);
        setLikeCount((prev) => prev - 1); // 좋아요 개수 감소
      } else {
        // 좋아요 추가
        await postLikeRequest(id, cookies.accessToken);
        setIsLike(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('좋아요 api 실패', error);
    }
  };
  //          event handler: 저장 버튼 클릭 이벤트 처리          //
  const onSaveClickHandler = async () => {
    if (!user || !cookies.accessToken) {
      alert('로그인이 필요합니다.');
      return; // 로그인 X / 게시물 X / 토큰 X 시 return;
    }
    try {
      if (isSave) {
        await saveCancelRecordRequest(id, cookies.accessToken);
        setIsSave(false);
        setSaveCount((prev) => prev - 1);
      } else {
        await saveRecordRequest(id, cookies.accessToken);
        setIsSave(true);
        setSaveCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('저장 api 실패', error);
    }
  };
  //     function: 좋아요 개수 가져오기     //
  const fetchLikeCount = async () => {
    if (!recordId || !cookies.accessToken) return;

    try {
      const response = await getLikeCountRequest(id, cookies.accessToken);
      if (response.code === 'RL01') {
        setLikeCount(response.data.count);
        console.log('좋아요개수', likeCount);
      }
    } catch (error) {
      console.error('fetch Like Count Error', error);
    }
  };
  //     function: 저장 개수 가져오기     //
  const fetchSaveCount = async () => {
    if (!recordId || !cookies.accessToken) return;

    try {
      const response = await getSaveCountRecordRequest(id, cookies.accessToken);
      if (response.code === 'RS01') {
        setSaveCount(response.data.count);
      }
    } catch (error) {
      console.error('fetch Like Count Error', error);
    }
  };
  //     event handler: 게시물 수정 버튼 이벤트 처리     //
  const onEditButtonClickHandler = () => {
    if (record?.user.email !== user?.email) {
      alert('수정 권한이 없습니다.');
      return;
    }
    router.push(`/post/${id}/update`);
  };

  //          function : 좋아요 리스트 처리 함수  (좋아요 목록에서 현재 유저를 찾아 중복처리)        //
  const fetchLikeStatus = async () => {
    if (!recordId || !cookies.accessToken) return;

    try {
      const response = await getLikeListRequest(id, cookies.accessToken);
      const isLiked = response.data.likeList.some(
        (like: { userName: string }) => like.userName === user?.nickname,
      );
      setIsLike(isLiked); // isLike 상태 업데이트
    } catch (error) {
      console.error('fetch Like Count Error', error);
    }
  };
  //          function : 저장 여부 체크 함수(저장 여부(true/false)에 따라 저장 상태 변경)        //
  const fetchSaveStatus = async () => {
    if (!recordId || !cookies.accessToken) return;

    try {
      const response = await getIsSaveRecordRequest(id, cookies.accessToken);
      console.log('api response save: ', response.data.saved);
      setIsSave(response.data.saved); // isLike 상태 업데이트
    } catch (error) {
      console.error('fetch Like Count Error', error);
    }
  };
  //          function : 댓글 입력 버튼 처리 함수          //
  const onApplyClickHandler = async () => {
    if (!newComment.trim()) {
      alert('댓글을 입력해주세요.');
      return;
    }
    if (!user || !cookies.accessToken) {
      alert('로그인 먼저 해주세요');
      router.push('/auth');
      return;
    }
    if (!recordId) {
      alert('존재하지 않는 게시물입니다');
      return;
    }
    const requestBody = {
      recordId: record?.recordId,
      content: newComment,
      parentId: null,
    } as PostCommentRequestDto;
    try {
      const response = await postCommentRequest(
        requestBody,
        cookies.accessToken,
      );
      if (response?.code === 'C001') {
        setCommentList((prev) => [
          {
            commentId: response.commentId,
            user: {
              nickname: user.nickname,
              email: user.email,
              profileImage: user.profileImage,
            },
            content: newComment,
            createdAt: new Date(),
          },
          ...prev,
        ]);
        setNewComment(''); // 댓글 입력란 초기화
        await refetch();
        console.log('comment:', requestBody);
      } else {
        alert('댓글 작성에 실패했습니다.');
        console.log('comment:', requestBody);
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
    }
  };

  //    function: 상세 게시물 데이터 불러오기 처리 함수      //
  const getRecordDetails = async () => {
    if (!recordId) return;
    const id = Array.isArray(recordId) ? Number(recordId[0]) : Number(recordId);
    if (isNaN(id)) {
      console.error('옳바르지 않은 게시물 번호입니다.:', recordId);
      router.push('/');
      return;
    }

    try {
      const response = await getDetailRecordRequest(id);
      if (response?.code === 'R003') {
        setRecord(response.data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('게시물 데이터 불러오기 오류:', error);
    }
  };
  const onDeleteButtonHandler = async () => {
    if (record?.user.email !== user?.email) {
      alert('삭제 권한이 없습니다.');
      return;
    }
    try {
      const response = await deleteRecordRequest(id, cookies.accessToken);
      if (response.data.code === 'R002') {
        router.push('/'); // 성공 시 라우팅 처리
      } else {
        alert('게시물 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시물 데이터 불러오기 오류:', error);
    }
  };

  useEffect(() => {
    fetchSaveStatus();
    fetchSaveCount();
    fetchLikeStatus();
    fetchLikeCount();
  }, [recordId, cookies.accessToken]);

  //          effect: record Id path variable 바뀔떄마다 해당 게시물 데이터, 댓글 데이터 불러오기 (무한스크롤)     //
  useEffect(() => {
    getRecordDetails();
    totalComments();
    fetchNextPage();
  }, [recordId, inView]);

  //          render: 렌더링          //
  if (!record) return <></>;
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
            {record.user.email === user?.email && (
              <div
                className={styles['edit-button']}
                onClick={onClickViewEditButton}>
                {viewEdit && (
                  <div className={styles['edit-card']}>
                    <div
                      className={styles['edit']}
                      onClick={onEditButtonClickHandler}>
                      {'Edit'}
                    </div>
                    <div
                      className={styles['delete']}
                      onClick={onDeleteButtonHandler}>
                      {'Delete'}
                    </div>
                  </div>
                )}
              </div>
            )}

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
              {isLike ? (
                <div
                  className={styles['post-detail-like-icon-active']}
                  onClick={onLikeClickHandler}></div>
              ) : (
                <div
                  className={styles['post-detail-like-icon']}
                  onClick={onLikeClickHandler}></div>
              )}

              <div className={styles['post-detail-like-count']}>
                {likeCount}
              </div>
            </div>

            <div className={styles['post-detail-comment-box']}>
              <div
                className={styles['post-detail-comment-icon']}
                onClick={toggleCommentSection}></div>
              <div className={styles['post-detail-comment-count']}>
                {totalCommentCount}
              </div>
            </div>

            <div className={styles['post-detail-save-box']}>
              {isSave ? (
                <div
                  className={styles['post-detail-save-icon-active']}
                  onClick={onSaveClickHandler}></div>
              ) : (
                <div
                  className={styles['post-detail-save-icon']}
                  onClick={onSaveClickHandler}></div>
              )}
              <div className={styles['post-detail-save-count']}>
                {saveCount}
              </div>
            </div>

            <div className={styles['post-detail-upload-time']}>
              {record.createdAt}
            </div>
          </div>
          {showCommentSection && (
            <div className={styles['comment-section']}>
              <div className={styles['comment-header']}>
                Comment <span>{totalCommentCount}</span>
              </div>

              <div className={styles['comment-input-container']}>
                <div className={styles['user-profile-box']}>
                  {record.user.profileImage ? (
                    <img
                      src={record.user.profileImage}
                      alt="프로필 이미지"
                      className={styles['user-profile-image']}
                    />
                  ) : (
                    <div
                      className={styles['comment-default-profile-image']}></div>
                  )}
                  <div className={styles['user-profile-nickname']}>
                    {user?.nickname}
                  </div>
                </div>
                <input
                  ref={commentRef}
                  type="text"
                  placeholder="댓글 추가..."
                  value={newComment}
                  className={styles['comment-input']}
                  onChange={onCommentChangeHandler}
                />
                <div
                  className={styles['comment-Apply-Button']}
                  onClick={onApplyClickHandler}>
                  Apply
                </div>
              </div>
              {Array.isArray(data?.pages) && data?.pages.length > 0 ? (
                <>
                  {data.pages.map((page, pageIndex) => {
                    if (page.data.content && Array.isArray(page.data.content)) {
                      return page.data.content.map((comment) => (
                        <Comment
                          key={comment.commentId}
                          commentsList={comment}
                        />
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
    </>
  );
}
