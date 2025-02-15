'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Home.module.css';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import Banner from '@/assets/Banner.gif';
import Header from '@/app/header/page';
import NavBar from '@/app/navBar/page';
import SideBar from '@/app/sideBar/page';
import PostItemCardType from '@/components/post/postItemCardType/page';
import PostItemListType from '@/components/post/postItemListType/page';
import { getRecordRequest, getUserRecordRequest, getUserRequest } from '@/apis';
import { RecordListItem } from '@/types/interface';
import { GetRecordResponseDto } from '@/apis/response/record';
import { ResponseDto } from '@/apis/response';
import { useInView } from 'react-intersection-observer';
import LoadingSpinner from '@/components/LoadingSpinner/page';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store';

//     component: 메인(홈) 페이지     //
export default function Main() {
  //        state : 라우팅     //
  const router = useRouter();
  //        state: cookie 상태        //
  const [cookies] = useCookies();
  const { setUser } = useLoginUserStore();
  //          state: Splash Screen 상태          //
  const [showSplash, setShowSplash] = useState(true);
  //          state: Fade Out 효과 상태          //
  const [fadeOut, setFadeOut] = useState(false);
  //          state: View Mode(카드형 or 리스트형) 상태         //
  const [viewMode, setViewMode] = useState('card');
  const pathname = usePathname(); // 현재 경로 감지
  const { ref, inView } = useInView();
  const [recordList, setRecordList] = useState<RecordListItem[]>([]);
  const [queryKey, setQueryKey] = useState(['records', new Date().getTime()]);
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
      console.log('queryKey:', ['records']);
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

  //          effect: 스플래쉬 스크린           //
  useEffect(() => {
    // 0.75초 후에 페이드아웃 시작
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 750);

    // 페이드아웃 애니메이션 후 리디렉션
    const redirectTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1200); // 1.2초 후에 리디렉션

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, []);
  //        function: getUser 처리 함수(사용자 정보를 받아온다)       //
  const getUserRequestAPI = async () => {
    try {
      const UserResponse = await getUserRequest(cookies.accessToken);
      if (UserResponse.code === 'U002') {
        setUser({
          email: UserResponse.data.email,
          nickname: UserResponse.data.nickname,
          experience: UserResponse.data.experience,
          age: UserResponse.data.age,
          field: UserResponse.data.field,
          profileImage: UserResponse.data.profileImage,
          userId: UserResponse.data.id, // ✅ 여기서 userId를 저장
        });
      }
    } catch (error) {
      console.error('사용자 정보 요청 실패:', error);
    }
  };
  //      event handler: 토글 버튼을 클릭할 때 뷰 모드 변경     //
  const toggleViewCardMode = () => setViewMode('card');
  const toggleViewListMode = () => setViewMode('list');

  //          effect: 게시글 데이터 최신화          //
  useEffect(() => {
    if (pathname === '/') {
      setQueryKey(['records', new Date().getTime()]); // queryKey 변경
    }
  }, [pathname]);
  useEffect(() => {
    if (cookies.accessToken) {
      getUserRequestAPI(); // 🛠️ 메인 페이지에서도 실행하도록 설정
    }
  }, [cookies.accessToken]);
  //          effect: 스크롤 감지해서 다음 페이지로 넘기기(무한 스크롤)          //
  useEffect(() => {
    fetchNextPage();
  }, [inView]);
  //          render: 렌더링          //  /
  return (
    <>
      {showSplash && (
        //스플래시 화면(온보딩)
        <div
          className={`${styles['splash-screen']} ${
            fadeOut ? styles['fade-out'] : ''
          }`}>
          <div className={styles['onboard-image']}></div>
          <div className={styles['onboard-text']}>
            Develop flow
            <br />
            <br />A place to make your only develop Floor
            <br />
            <br />
          </div>
        </div>
      )}
      {!showSplash && (
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
              <div className={styles['toggle-button']}>
                <button
                  className={styles['card-icon']}
                  onClick={toggleViewCardMode}></button>

                <button
                  className={styles['list-icon']}
                  onClick={toggleViewListMode}></button>
              </div>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {viewMode === 'card' ? (
                    <div className={styles['card-view']}>
                      {Array.isArray(data?.pages) && data?.pages.length > 0 ? (
                        data?.pages.map((page, pageIndex) => {
                          const filteredContent = page.data.content.filter(
                            (recordListItem) =>
                              recordListItem.recordType === 'FLOE',
                          );
                          if (filteredContent.length > 0) {
                            return filteredContent.map((recordListItem) => (
                              <PostItemCardType
                                key={recordListItem.recordId}
                                recordListItem={recordListItem}
                              />
                            ));
                          } else {
                            return <p key={pageIndex}></p>; // 빈 페이지일 때
                          }
                        })
                      ) : (
                        <p></p> // 데이터가 없을 때
                      )}
                    </div>
                  ) : (
                    <div className={styles['list-view']}>
                      {Array.isArray(data?.pages) && data?.pages.length > 0 ? (
                        data?.pages.map((page, pageIndex) => {
                          const filteredContent = page.data.content.filter(
                            (recordListItem) =>
                              recordListItem.recordType === 'FLOE',
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
                  )}
                  {isFetchingNextPage && <LoadingSpinner />}
                  <div ref={ref} style={{ height: '1px' }} />
                </>
              )}
            </main>

            <aside className={styles['sidebar']}>
              <SideBar />
            </aside>
          </div>
        </>
      )}
    </>
  );
}
