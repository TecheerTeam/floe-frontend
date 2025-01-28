'use client';

import React, { useRef, useState } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchRecordRequestDto } from '@/apis/request/search';
import { RecordType } from '@/apis/request/search/search.request.dto';
import { getSearchRecordRequest } from '@/apis';
import { useCookies } from 'react-cookie';
export default function Header() {
  //     state: 쿠키     //
  const [cookies] = useCookies();
  //     state:   검색 게시물 타입 상태     //
  const [recordType, setRecordType] = useState<RecordType>('FLOE');
  //     state:   검색 태그 상태     //
  const [tag, setTag] = useState<string>('');
  //     state:   검색 태그 참조 상태     //
  const tagRef = useRef<HTMLInputElement>(null);
  //     state:   검색 제목 상태     //
  const [title, setTitle] = useState<string>('');
  //     state:   검색 제목 참조 상태     //
  const titleRef = useRef<HTMLInputElement>(null);
  //     state:   검색창 확장 상태     //
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  //     state:  닫기 애니메이션 상태     //
  const [isClosing, setIsClosing] = useState<boolean>(false); // 닫기 애니메이션 상태
  //     state:  라우팅     //
  const router = useRouter();
  // tag와 title이 빈 문자열이면 null로 변환
  const Tag = tag.trim() === '' ? null : tag;
  const Title = title.trim() === '' ? null : title;

  //    event handler: 검색 버튼 클릭 처리     //
  const onClickSearchButton = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const searchRequest: SearchRecordRequestDto = {
      recordType: recordType, // 기록 타입
      title: Title, // 제목 (null이면 undefined로 변환)
      tagNames: Tag ? [Tag] : [], // 태그 배열로 변환
    };
    console.log('Search Request:', searchRequest);

    const queryParams = new URLSearchParams();
    queryParams.append('recordType', recordType);
    if (Title) queryParams.append('title', Title);
    else queryParams.delete('title'); // 명시적으로 삭제
    if (Tag) queryParams.append('tagNames', Tag);
    else queryParams.delete('tag'); // 명시적으로 삭제

    try {
      // API 호출
      const response = await getSearchRecordRequest(
        searchRequest,
        0,
        10,
        cookies.accessToken,
      );
      console.log('Search Results:', response);

      // 검색 결과 페이지로 이동 (검색 조건 전달)
      router.push(
        `/search?recordType=${recordType}&title=${title || ''}&tag=${tag || ''}`,
      );
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  //    event handler: 닫기 버튼 클릭 처리     //
  const closeSearchBar = () => {
    setIsClosing(true); // 닫기 애니메이션 활성화
    setTimeout(() => {
      setIsExpanded(false); // 닫기 애니메이션 후 검색창 숨김
      setIsClosing(false); // 상태 초기화
    }, 300); // CSS transition 시간과 동일
  };

  return (
    <div id={styles['Header-Wrapper']}>
      <div className={styles['Header-Container']}>
        <Link href="/" passHref>
          <div className={styles['Header-Logo']}>
            <div className={styles['Header-Logo-Image']}></div>
          </div>
          <div className={styles['Header-Logo-Text']}>FLOE</div>
        </Link>

        {/* 검색 아이콘 */}
        {!isExpanded && (
          <div
            className={styles['searchBar-icon']}
            onClick={() => setIsExpanded(true)} // 아이콘 클릭 시 검색창 확장
          ></div>
        )}

        {/* 검색창 */}
        <form
          className={`${styles['searchBar-wrapper']} ${
            isExpanded ? styles['expanded'] : ''
          } ${isClosing ? styles['closing'] : ''}`} // 닫기 상태 추가
          onSubmit={onClickSearchButton}>
          {/* RecordType Select */}
          <select
            className={styles['searchBar-select']}
            onChange={(e) => setRecordType(e.target.value as RecordType)}>
            <option value="FLOE">FLOE</option>
            <option value="ISSUE">ISSUE</option>
          </select>

          {/* Tag Input */}
          <div className={styles['tag-Text']}>{'Tag'}</div>
          <input
            ref={tagRef}
            value={tag}
            type="text"
            placeholder="Tag..."
            className={styles['searchBar-input']}
            onChange={(e) => setTag(e.target.value)}
          />

          {/* Title Input */}
          <div className={styles['title-Text']}>{'Title'}</div>
          <input
            ref={titleRef}
            value={title}
            type="text"
            placeholder="Title..."
            className={styles['searchBar-input']}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button type="submit" className={styles['searchBar-button']}>
            Search
          </button>

          {/* 닫기 버튼 */}
          <button
            type="button"
            className={styles['close-button']}
            onClick={closeSearchBar} // 닫기 버튼 클릭 시 검색창 축소
          >
            ✕
          </button>
        </form>
      </div>
    </div>
  );
}
