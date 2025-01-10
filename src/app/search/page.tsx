'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchPage.module.css';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCookies } from 'react-cookie';
import Banner from '@/assets/Banner.gif';
import Header from '@/app/header/page';
import NavBar from '@/app/navBar/page';
import SideBar from '@/app/sideBar/page';
import PostItemCardType from '@/components/post/postItemCardType/page';
import PostItemListType from '@/components/post/postItemListType/page';
import { getRecordRequest, getSearchRecordRequest } from '@/apis';
import { RecordListItem } from '@/types/interface';
import { GetRecordResponseDto } from '@/apis/response/record';
import { ResponseDto } from '@/apis/response';
import { useInView } from 'react-intersection-observer';
import { RecordType } from '@/apis/request/search/search.request.dto';

export default function SearchResult() {
  const { ref, inView } = useInView();
  //     state: 쿠키     //
  const [cookies] = useCookies();
  // 검색 조건 가져오기
  const searchParams = useSearchParams(); //          state: View Mode(카드형 or 리스트형) 상태         //

  const recordType = searchParams.get('recordType') || 'FLOE';
  const title = searchParams.get('title') || null;
  const tag = searchParams.get('tag') || null;

  const {
    data,
    refetch,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['search', recordType, title, tag], // 캐시 키
    queryFn: async ({ pageParam = 0 }) => {
      // API 호출
      const response = await getSearchRecordRequest(
        {
          recordType: recordType as RecordType,
          title,
          tagNames: tag ? [tag] : [],
        }, // 검색 조건
        pageParam, // 페이지 번호
        10, // 페이지 크기
        cookies.accessToken,
      );
      console.log('Search Response:', response);
      return response; // API 응답 반환
    },
    getNextPageParam: (last: GetRecordResponseDto) => {
      if (!last || last.data.last) {
        return undefined;
      }
      const nextPage = last.data.pageable.pageNumber + 1;
      return nextPage;
    },
    initialPageParam: 0,
  });
  //          effect: 스크롤 감지해서 다음 페이지로 넘기기(무한 스크롤)          //
  useEffect(() => {
    fetchNextPage();
  }, [inView]);
  return (
    <>
      <Header />
      <div className={styles['page-container']}>
        <aside className={styles['navbar']}>
          <NavBar />
        </aside>
        <main className={styles['main-content']}>
          <div className={styles['search-keyword-result']}>
            <h2>
              {recordType && `Category: '${recordType}'`}{' '}
              {tag && `, Tag: '${tag}'`}
              {title && `, Title: '${title}'`}에 대한 검색 결과입니다.
            </h2>
          </div>
          {isFetching ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className={styles['list-view']}>
                {Array.isArray(data?.pages) && data?.pages.length > 0 ? (
                  data?.pages.map((page, pageIndex) => {
                    if (page.data.content && Array.isArray(page.data.content)) {
                      return page.data.content.length > 0 ? (
                        page.data.content.map((recordListItem) => {
                          return (
                            <PostItemListType
                              key={recordListItem.recordId}
                              recordListItem={recordListItem}
                            />
                          );
                        })
                      ) : (
                        <p key={pageIndex}></p> // 빈 페이지일 때
                      );
                    } else {
                      return <p key={pageIndex}></p>; // content가 없을 때
                    }
                  })
                ) : (
                  <></> // 데이터가 없을 때
                )}
              </div>

              {isFetchingNextPage && <p>Loading more...</p>}
              <div ref={ref} style={{ height: '1px' }} />
            </>
          )}
        </main>

        <aside className={styles['sidebar']}>
          <SideBar />
        </aside>
      </div>
    </>
  );
}
