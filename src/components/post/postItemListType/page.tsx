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
import { useRouter } from 'next/navigation'; // Next.js 라우터
import React, { useEffect } from 'react';
import styles from './Post.List.module.css';
import { RecordListItem } from '@/types/interface';
import { useQuery } from '@tanstack/react-query';
import {
  getCommentRequest,
  getLikeCountRequest,
  getLikeListRequest,
  getSaveCountRecordRequest,
} from '@/apis';

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

//  function: 작성일자 포맷  //
const formatElapsedTime = (createdAt: string) => {
  // 배열을 'YYYY-MM-DD HH:mm:ss' 형식으로 변환
  const formattedDate = `${createdAt[0]}-${String(createdAt[1]).padStart(2, '0')}-${String(createdAt[2]).padStart(2, '0')} ${String(createdAt[3]).padStart(2, '0')}:${String(createdAt[4]).padStart(2, '0')}:${String(createdAt[5]).padStart(2, '0')}`;

  // 생성된 날짜를 Date 객체로 변환
  const date = new Date(formattedDate);
  const now = new Date();

  // 날짜 차이 계산
  const diffInMs = now.getTime() - date.getTime(); // 밀리초 차이
  const diffInSec = diffInMs / 1000; // 초
  const diffInMin = diffInSec / 60; // 분
  const diffInHour = diffInMin / 60; // 시간
  const diffInDay = diffInHour / 24; // 일

  // "몇 분 전", "몇 시간 전", "몇 일 전" 형식으로 변환
  if (diffInDay >= 1) {
    const daysAgo = Math.floor(diffInDay);
    return `${daysAgo}일 전`;
  } else if (diffInHour >= 1) {
    const hoursAgo = Math.floor(diffInHour);
    return `${hoursAgo}시간 전`;
  } else if (diffInMin >= 1) {
    const minutesAgo = Math.floor(diffInMin);
    return `${minutesAgo}분 전`;
  } else {
    return '방금 전';
  }
};

import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';
interface PostItemListTypeProps {
  recordListItem: RecordListItem; // 게시물 데이터
}

export default function PostItemListType({
  recordListItem,
}: PostItemListTypeProps) {
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
  //        state : 에디터 태그 제거 상태     //
  const sanitizedContent = sanitizeContent(content);
  //     event handler: 클릭 이벤트 처리     //
  const handleCardClick = () => {
    // recordId를 기반으로 게시글 상세 페이지로 이동
    router.push(`/post/${recordId}`);
  };
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
  //          function: 좋아요 개수 업데이트          //
  const { data: likeData } = useQuery({
    queryKey: ['likes', recordId],
    queryFn: async () => {
      const response = await getLikeCountRequest(recordId, cookies.accessToken); // 첫 번째 페이지에서 댓글 데이터 요청
      console.log('like count in query: ', response.data.count);
      return response.data.count; // 총 댓글 수 반환
    },
    staleTime: 10000, // 캐시 유지 시간 (10초)
    refetchOnWindowFocus: true, // 창이 포커스될 때 다시 데이터 요청
  });
  //          function: 저장 개수 업데이트          //
  const { data: saveData } = useQuery({
    queryKey: ['saves', recordId],
    queryFn: async () => {
      const response = await getSaveCountRecordRequest(
        recordId,
        cookies.accessToken,
      ); // 첫 번째 페이지에서 댓글 데이터 요청
      console.log('save count in query: ', response.data.count);
      return response.data.count; // 총 댓글 수 반환
    },
    staleTime: 10000, // 캐시 유지 시간 (10초)
    refetchOnWindowFocus: true, // 창이 포커스될 때 다시 데이터 요청
  });
  //          function: 좋아요 여부 업데이트          //
  const { data: likeListData } = useQuery({
    queryKey: ['likeList', recordId],
    queryFn: async () => {
      const response = await getLikeListRequest(recordId, cookies.accessToken);

      return response.data.likeList; // 좋아요한 사용자 목록 반환
    },
    staleTime: 10000,
  });
  const isLikedByUser = likeListData?.some(
    (like: { userName: string }) => like.userName === user.nickname,
  );
  //   function: 스택 아이콘 처리 함수    //
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
      case 'Node.js':
      case 'node':
        return (
          <FaNodeJs className={`${styles['stack-tag']} ${styles['node']}`} />
        );
      case 'python':
        return (
          <FaPython className={`${styles['stack-tag']} ${styles['python']}`} />
        );
      case 'Vue.js':
      case 'vue':
        return (
          <FaVuejs className={`${styles['stack-tag']} ${styles['vue']}`} />
        );
      case 'Angular':
      case 'angular':
        return (
          <FaAngular
            className={`${styles['stack-tag']} ${styles['angular']}`}
          />
        );
      case 'Sass':
      case 'sass':
        return (
          <FaSass className={`${styles['stack-tag']} ${styles['sass']}`} />
        );
      case 'js':
      case 'javascript':
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
      case 'Yarn':
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
      case 'Figma':
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
  useEffect(() => {
    document.querySelectorAll('[data-class]').forEach((el) => {
      const className = el.getAttribute('data-class');
      if (className) {
        el.classList.add(styles[className]); // `module.css` 스타일 적용
        el.removeAttribute('data-class'); // `data-class` 속성 제거
      }
    });
  }, [sanitizedContent]);
  //          render: 게시물 카드형 렌더링          //
  return (
    <div className={styles['list-container']} onClick={handleCardClick}>
      <div className={styles['list-top']}>
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
        <div className={styles['create-at']}>
          {formatElapsedTime(createdAt)}
        </div>
        {/* profileimgae-box와 user-nickname 클릭시 해당 유저의 프로필로 이동해야함 */}
        <div className={styles['stack-tag-box']}>
          <div className={styles['stack-tag']}>
            {tagNames.map((tag, index) => (
              <span
                key={index}
                className={`${styles['stack-tag']} ${styles[tag.toLowerCase()]}`}>
                {getTagIcon(tag)} {tag}
                {index < tagNames.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles['list-main']}>
        <div className={styles['text-container']}>
          <div className={styles['list-title']}>
            {'Title: '}
            {title}
          </div>
          <div
            className={styles['list-content']}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
        {medias.length > 0 && (
          <div className={styles['list-image']}>
            <img
              src={medias[0].mediaUrl}
              alt="Media"
              className={styles['title-image']}
            />
          </div>
        )}
      </div>

      <div className={styles['list-bottom']}>
        <div className={styles['list-like-box']}>
          <div className={styles['list-like-icon']}></div>
          <div className={styles['list-like-count']}>
            {' '}
            {likeData ?? likeCount}
          </div>
        </div>

        <div className={styles['list-comment-box']}>
          <div className={styles['list-comment-icon']}></div>
          <div className={styles['list-comment-count']}>
            {commentData ?? commentCount}
          </div>
        </div>

        <div className={styles['list-save-box']}>
          <div className={styles['list-save-icon']}></div>
          <div className={styles['list-save-count']}>
            {' '}
            {saveData ?? saveCount}
          </div>
        </div>
      </div>
    </div>
  );
}
