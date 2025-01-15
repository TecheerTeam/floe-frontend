'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Banner from './../../assets/Banner.gif';
import styles from './Issue.module.css';
import Header from './../header/page';
import NavBar from './../navBar/page';
import SideBar from './../sideBar/page';
import PostItemListType from '@/components/post/postItemListType/page';
import { usePathname, useRouter } from 'next/navigation';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { RecordListItem } from '@/types/interface';
import { getRecordRequest } from '@/apis';
import { GetRecordResponseDto } from '@/apis/response/record';
export default function Issue() {
  //        state : 라우팅     //
  const router = useRouter();
  const pathname = usePathname(); // 현재 경로 감지
  const { ref, inView } = useInView();
  const [recordList, setRecordList] = useState<RecordListItem[]>([]);
  const [queryKey, setQueryKey] = useState(['Issue', new Date().getTime()]);
  const queryClient = useQueryClient();

  const {
    data, // 불러온 데이터
    refetch, // 데이터 최신화
    fetchNextPage, // 다음 페이지 요청
    hasNextPage, // 다음 페이지 여부
    isFetchingNextPage, // 다음 페이지 로드 중인지 여부
    isLoading, // 데이터 로딩 중
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getRecordRequest(pageParam, 5);
      console.log(response);
      console.log('queryKey:', ['Issue']);
      return response;
    },
    getNextPageParam: (last: GetRecordResponseDto) => {
      if (!last || last.data.last) {
        return undefined;
      }
      const nextPage = last.data.pageable.pageNumber + 1;
      return nextPage;
    },
    initialPageParam: 0,
    staleTime: 0, // 데이터를 항상 새로 가져옴
    refetchOnMount: 'always', // 마운트 시 데이터 자동 요청
  });

  //          effect: 게시글 데이터 최신화          //
  useEffect(() => {
    if (pathname === '/issue') {
      setQueryKey(['Issue', new Date().getTime()]); // queryKey 변경
    }
  }, [pathname]);
  //          effect: 스크롤 감지해서 다음 페이지로 넘기기(무한 스크롤)          //
  useEffect(() => {
    fetchNextPage();
  }, [inView]);
  return (
    <div>
      <>
        <Header />
        <div className={styles['page-container']}>
          <aside className={styles['navbar']}>
            <NavBar />
          </aside>
          <main className={styles['main-content']}>
            <div className={styles['main-banner']}>
              <Image src={Banner} alt="banner" className={styles['banner']} />
            </div>

            {/* <div className={styles['list-view']}>
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
            </div> */}
            <div className={styles['list-view']}>
              {Array.isArray(data?.pages) && data?.pages.length > 0 ? (
                data?.pages.map((page, pageIndex) => {
                  const filteredContent = page.data.content.filter(
                    (recordListItem) => recordListItem.recordType === 'ISSUE',
                  );
                  if (filteredContent.length > 0) {
                    return filteredContent.map((recordListItem) => (
                      <PostItemListType
                        key={recordListItem.recordId}
                        recordListItem={recordListItem}
                      />
                    ));
                  } else {
                    return <p key={pageIndex}></p>; // 빈 페이지일 때
                  }
                })
              ) : (
                <></> // 데이터가 없을 때
              )}
            </div>

            {isFetchingNextPage && <p>Loading more...</p>}
            <div ref={ref} style={{ height: '1px' }} />
          </main>
          <aside className={styles['sidebar']}>
            <SideBar />
          </aside>
        </div>
      </>
    </div>
  );
}
