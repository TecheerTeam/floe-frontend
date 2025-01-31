'use client';
import {
  FaReact,
  FaVuejs,
  FaAngular,
  FaSass,
  FaJs,
  FaCss3,
  FaHtml5,
} from 'react-icons/fa';
import {
  FaNodeJs,
  FaJava,
  FaPhp,
  FaPython,
  FaDocker,
  FaAws,
  FaCloud,
  FaGithub,
} from 'react-icons/fa';
import { FaBootstrap, FaNpm, FaYarn, FaGrunt, FaGulp } from 'react-icons/fa';
import { FaFigma, FaSketch } from 'react-icons/fa';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import styles from './PostDetail.module.css';
import Header from '../../header/page';
import NavBar from '../../navBar/page';
import Comment from '@/components/comment/page';
import { CommentItem, LikeItem, RecordItem } from '@/types/interface';
import { redirect, useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
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
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // 시간대 플러그인
import relativeTime from 'dayjs/plugin/relativeTime'; // 상대 시간 플러그인

dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('ko');

//   function: 작성일자 포멧팅함수 (xxxx년 xx월 xx일 xx시 xx분)   //
const formatCreatedAt = (createdAt: string | number[]) => {
  // createdAt이 배열인 경우 배열을 'YYYY-MM-DD HH:mm:ss' 형식으로 변환
  let date: Date;
  if (Array.isArray(createdAt)) {
    date = new Date(
      createdAt[0],
      createdAt[1] - 1,
      createdAt[2],
      createdAt[3],
      createdAt[4],
      createdAt[5],
    );
  } else {
    // 문자열인 경우 Date로 변환
    date = new Date(createdAt);
  }

  // 날짜와 시간 정보를 각각 얻기
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더함
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  // 한국식 날짜 및 시간 포맷으로 리턴
  return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
};
//   function: TipTap-Editor 태그 제거    //
function sanitizeContent(content: string) {
  // <p>, <b>, <em>, <code> 태그를 제거하면서 스타일은 유지할 수 있도록 <span>을 사용
  content = content.replace(/<p>/gi, '<p data-class="paragraph">');
  content = content.replace(/<\/p>/gi, '</p><br>'); // <p> 태그 뒤에 줄바꿈 강제 삽입
  content = content.replace(/<b>/gi, '<span data-class="bold">');
  content = content.replace(/<\/b>/gi, '</span>');
  content = content.replace(/<italic>/gi, '<span data-class="italic">');
  content = content.replace(/<\/italic>/gi, '</span>');
  content = content.replace(/<code>/gi, '<span data-class="code">');
  content = content.replace(/<\/code>/gi, '</span>');

  return content;
}
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
      console.log('rrrr', response.data);
      return response; // data만 반환
    },
    getNextPageParam: (last: GetCommentResponseDto) => {
      if (!last || last.data.last) {
        return undefined;
      }
      return last.data.pageable.pageNumber + 1;
    },

    initialPageParam: 0,
  });
  //     function: Infinite Query로 불러온 전체 댓글 데이터 길이     //
  const totalComments = async () => {
    const response = await getCommentRequest(
      Number(recordId),
      0,
      5,
      cookies.accessToken,
    );

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
  const onProfileClickHandler = () => {
    router.push(`/mypage/${record?.user.userId}`);
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
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewComment(''); // 댓글 입력란 초기화
        await refetch();
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
        console.log('response.data', response.data);
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

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'react':
        return (
          <FaReact className={`${styles['stack-tag']} ${styles['react']}`} />
        );
      case 'java':
        return (
          <FaJava className={`${styles['stack-tag']} ${styles['java']}`} />
        );
      case 'node':
        return (
          <FaNodeJs className={`${styles['stack-tag']} ${styles['node']}`} />
        );
      case 'python':
        return (
          <FaPython className={`${styles['stack-tag']} ${styles['python']}`} />
        );
      case 'vue':
        return (
          <FaVuejs className={`${styles['stack-tag']} ${styles['vue']}`} />
        );
      case 'angular':
        return (
          <FaAngular
            className={`${styles['stack-tag']} ${styles['angular']}`}
          />
        );
      case 'sass':
        return (
          <FaSass className={`${styles['stack-tag']} ${styles['sass']}`} />
        );
      case 'js':
        return <FaJs className={`${styles['stack-tag']} ${styles['js']}`} />;
      case 'css':
        return <FaCss3 className={`${styles['stack-tag']} ${styles['css']}`} />;
      case 'html':
        return (
          <FaHtml5 className={`${styles['stack-tag']} ${styles['html']}`} />
        );
      case 'php':
        return <FaPhp className={`${styles['stack-tag']} ${styles['php']}`} />;
      case 'docker':
        return (
          <FaDocker className={`${styles['stack-tag']} ${styles['docker']}`} />
        );
      case 'aws':
        return <FaAws className={`${styles['stack-tag']} ${styles['aws']}`} />;
      case 'cloud':
        return (
          <FaCloud className={`${styles['stack-tag']} ${styles['cloud']}`} />
        );
      case 'github':
        return (
          <FaGithub className={`${styles['stack-tag']} ${styles['github']}`} />
        );
      case 'bootstrap':
        return (
          <FaBootstrap
            className={`${styles['stack-tag']} ${styles['bootstrap']}`}
          />
        );
      case 'npm':
        return <FaNpm className={`${styles['stack-tag']} ${styles['npm']}`} />;
      case 'yarn':
        return (
          <FaYarn className={`${styles['stack-tag']} ${styles['yarn']}`} />
        );
      case 'grunt':
        return (
          <FaGrunt className={`${styles['stack-tag']} ${styles['grunt']}`} />
        );
      case 'gulp':
        return (
          <FaGulp className={`${styles['stack-tag']} ${styles['gulp']}`} />
        );
      case 'figma':
        return (
          <FaFigma className={`${styles['stack-tag']} ${styles['figma']}`} />
        );
      case 'sketch':
        return (
          <FaSketch className={`${styles['stack-tag']} ${styles['sketch']}`} />
        );
      default:
        return null;
    }
  };

  //  effect: record Id path variable 바뀔떄마다 해당 게시물 좋아요, 저장 데이터 불러     //
  useEffect(() => {
    fetchSaveStatus();
    fetchSaveCount();
    fetchLikeStatus();
    fetchLikeCount();
  }, [recordId, cookies.accessToken]);

  //  effect: record Id path variable 바뀔떄마다 해당 게시물 데이터, 댓글 데이터 불러오기 (무한스크롤)   //
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
            <div
              className={styles['profile-image-box']}
              onClick={onProfileClickHandler}>
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
            <div
              className={styles['user-nickname']}
              onClick={onProfileClickHandler}>
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
                <span
                  key={index}
                  className={`${styles['stack-tag']} ${styles[tag.toLowerCase()]}`}>
                  {getTagIcon(tag)} {tag}
                  {index < tag.length - 1 && ', '}
                </span>
              ))}
            </div>

            <div className={styles['post-detail-title']}>{record.title}</div>
            <div
              className={styles['post-detail-content']}
              dangerouslySetInnerHTML={{
                __html: sanitizeContent(record.content),
              }}
            />
            {/* 이미지 슬라이더 적용 */}
            {record.medias && record.medias.length > 0 && (
              <div className={styles['post-detail-image-container']}>
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className={styles['swiper-container']}>
                  {record.medias.map((media) => (
                    <SwiperSlide key={media.mediaId}>
                      <img
                        src={media.mediaUrl}
                        alt="게시물 이미지"
                        className={styles['post-detail-images']}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
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
              {formatCreatedAt(record.createdAt)}
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
