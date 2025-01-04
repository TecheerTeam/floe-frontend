'use client';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import styles from './PostDetail.module.css';
import Header from '../../header/page';
import NavBar from '../../navBar/page';
import Comment from '@/components/comment/page';
import { CommentItem, LikeItem, RecordItem } from '@/types/interface';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  getCommentRequest,
  getDetailRecordRequest,
  postCommentRequest,
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
import { useInfiniteQuery } from '@tanstack/react-query';
export default function PostDetail() {
  // React Query Client 가져오기
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
  const [likeCount, setLikeCount] = useState<LikeItem[]>([]);
  //       state: 댓글 입력 상태         //
  const [newComment, setNewComment] = useState<string>('');
  // 댓글 목록 상태
  const [commentList, setCommentList] = useState<CommentItem[]>([]);
  //          state: 좋아요 아이콘 버튼 클릭 상태          //
  const [likeClick, setLikeClick] = useState<boolean>(false);
  //          state: 댓글 아이콘 버튼 클릭 상태          //
  const [commentClick, setCommentClick] = useState<boolean>(false);
  //          state: 저장 아이콘 버튼 클릭 상태          //
  const [saveClick, setSaveClick] = useState<boolean>(false);
  //          state: 댓글창 팝업 상태          //
  const [showCommentSection, setShowCommentSection] = useState<boolean>(false);
  //          state: 댓글 입력 참조 상태          //
  const commentRef = useRef<HTMLInputElement | null>(null);
  const accessToken = cookies.accessToken;
  const [totalCommentCount, setTotalCommentCount] = useState<number>(0);
  //     function: recordId가 string|string[] 형식일 경우 number로 변환     //
  const id = Array.isArray(recordId) ? Number(recordId[0]) : Number(recordId);
  if (!id || isNaN(id)) {
    console.error('Invalid recordId:', recordId);
    return undefined;
  }
  console.log('recordId:', recordId);
  //     function: 댓글 무한 스크롤     //
  const {
    data, // 불러온 댓글 데이터
    fetchNextPage, // 다음 페이지 요청
  } = useInfiniteQuery({
    queryKey: ['comments', recordId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getCommentRequest(id, pageParam, 5, accessToken);
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
      accessToken,
    );
    console.log('total', response.data.totalElements);
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
                {totalCommentCount}
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
                    <div className={styles['default-profile-image']}></div>
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
