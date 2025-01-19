'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import styles from './MyPage.module.css';
import Header from '../header/page';
import NavBar from '../navBar/page';
import TabNavigation from '@/components/tab/tabNavigation/page';
import PostsContents from '@/components/tab/tabContents/postsContents/page';
import LikeContents from '@/components/tab/tabContents/likeContents/page';
import SaveContents from '@/components/tab/tabContents/saveContents/page';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useLoginUserStore } from '@/store';
import { useCookies } from 'react-cookie';
import {
  getSaveListRecordRequest,
  getUserRecordRequest,
  getUserRequest,
  putUserProfileImageUpdateRequest,
} from '@/apis';
import { RecordListItem } from '@/types/interface';
import { GetUserRecordResponseDto } from '@/apis/response/record/record.response.dto';
import PostItemListType from '@/components/post/postItemListType/page';

export default function MyPage() {
  //    state: 라우팅    //
  const router = useRouter();
  //        state: 유저 로그인 상태(zustand)        //
  const { user, setUser } = useLoginUserStore();
  //        state: cookie 상태        //
  const [cookies] = useCookies();
  //          state: 프로필 이미지 입력 요소 참조 상태          //
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  //          state: 프로필 이미지 미리보기 URL 상태          //
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  //          state: Tab Navigation 선택 상태         //
  const [activeTab, setActivetab] = useState<string>('POSTS');
  const [recordList, setRecordList] = useState<RecordListItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //          event handler: 이미지 업로드 버튼 클릭 이벤트 처리          //
  const onImageUploadButtonClickHandler = () => {
    if (!imageInputRef.current) return;
    imageInputRef.current.click();
  };

  //          event handler: 프로필 이미지 변경 이벤트 처리          //
  const onImageChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length) return;

    const file = event.target.files[0];
    const data = new FormData();
    data.append('profileImage', file);
    try {
      const response = await putUserProfileImageUpdateRequest(
        data,
        cookies.accessToken,
      );
      if (response.code === 'U007') {
        alert('프로필 이미지 수정 성공');
        if (user) {
          setUser({ ...user, profileImage: response.data.profileImage });
        }
        await getUserRequestAPI(); // 유저 프로필 이미지 변경 후 데이터 최신화
      }
    } catch (error) {
      console.error('fetch Like Count Error', error);
    }
  };

  //          event handler: 탭 버튼 클릭 이벤트 처리          //
  const handleTabClick = (tab: string) => {
    setActivetab(tab);
    console.log('Tab clicked:', tab); // 탭 클릭 시 어떤 탭이 눌렸는지 확인
  };
  //        function: getUser 처리 함수(사용자 정보를 받아온다다)       //
  const getUserRequestAPI = async () => {
    try {
      const response = await getUserRequest(cookies.accessToken);

      if (response.code === 'U002') {
        setUser({
          email: response.data.email,
          nickname: response.data.nickname,
          experience: response.data.experience,
          age: response.data.age,
          field: response.data.field,
          profileImage: response.data.profileImage,
        });
      }
    } catch (error) {
      console.error('fetch Like Count Error', error);
    }
  };
  useEffect(() => {
    console.log('Tab changed:', activeTab);
  }, [activeTab]);

  const maxButtons = 10; // 한 번에 보여질 최대 페이지 버튼 수
  const [currentPageGroup, setCurrentPageGroup] = useState<number>(0); // 현재 페이지 그룹

  //      function:  데이터 가져오기      //
  const fetchData = async () => {
    setIsLoading(true);
    setRecordList([]); // 빈 배열로 초기화
    try {
      let response;

      if (activeTab === 'POSTS') {
        response = await getUserRecordRequest(0, 5, cookies.accessToken);
        console.log('posts tab result', response.data);
      } else if (activeTab === 'SAVE') {
        response = await getSaveListRecordRequest(0, 5, cookies.accessToken);
        console.log('save tab result', response.data);
      }

      if (response && response.data && Array.isArray(response.data.content)) {
        setRecordList(response.data.content);
      } else {
        setRecordList([]); // API 응답이 비어 있을 경우 안전한 기본값 설정
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
      setRecordList([]); // 에러 발생 시 안전한 기본값 설정
    } finally {
      setIsLoading(false);
    }
  };

  //     effect: 탭 변경에 따른 데이터 렌더링    //
  useEffect(() => {
    setRecordList([]); // 탭 변경 시 기존 데이터를 클리어
    fetchData();
  }, [activeTab]);

  //      function: 페이지 클릭 핸들러      //
  const handlePageClick = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  //      function: 이전 그룹으로 이동      //
  const handlePreviousGroup = () => {
    if (currentPageGroup > 0) {
      const newGroup = currentPageGroup - 1;
      setCurrentPageGroup(newGroup);
      setCurrentPage(newGroup * maxButtons); // 이전 그룹의 첫 번째 페이지로 이동
    }
  };

  //      function: 다음 그룹으로 이동      //
  const handleNextGroup = () => {
    if ((currentPageGroup + 1) * maxButtons < totalPages) {
      const newGroup = currentPageGroup + 1;
      setCurrentPageGroup(newGroup);
      setCurrentPage(newGroup * maxButtons); // 다음 그룹의 첫 번째 페이지로 이동
    }
  };
  //      function: 현재 그룹의 페이지 버튼 생성      //
  const renderPageButtons = () => {
    const startPage = currentPageGroup * maxButtons;
    const endPage = Math.min(startPage + maxButtons, totalPages); // 마지막 그룹에서 totalPages를 초과하지 않도록 제한

    return Array.from({ length: endPage - startPage }, (_, index) => {
      const page = startPage + index;
      return (
        <button
          key={page}
          className={
            page === currentPage
              ? styles['paginationButtonActive']
              : styles['paginationButton']
          }
          onClick={() => handlePageClick(page)}>
          {page + 1}
        </button>
      );
    });
  };

  //     effect: user email path variable 변경시 실행(user email에 따라 해당 유저의 데이터 마운트)     //
  useEffect(() => {
    if (!cookies.accessToken) {
      alert('로그인이 필요합니다.');
      router.push('/auth'); // 로그인 페이지로 이동
      return;
    }
    getUserRequestAPI(); // 유저 정보 가져오기
  }, [cookies.accessToken]);

  //         render : 마이페이지 컴포넌트 렌더링         //
  return (
    <>
      <Header />
      <div className={styles['mypage-Container']}>
        <aside className={styles['navbar']}>
          <NavBar />
        </aside>

        <div className={styles['user-Contents']}>
          <div className={styles['user-Info']}>
            {user?.profileImage !== null ? (
              <div
                className={styles['user-profile-image']}
                style={{ backgroundImage: `url(${user?.profileImage})` }}
                onClick={onImageUploadButtonClickHandler}></div>
            ) : (
              <div
                className={styles['user-Image']}
                onClick={onImageUploadButtonClickHandler}></div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={onImageChangeHandler}
              style={{ display: 'none' }}
            />
            <div className={styles['user-Data-Wrapper']}>
              <div className={styles['user-Data']}>
                <div className={styles['user-Posts']}>
                  <div className={styles['data-Number']}></div>
                  <div>posts</div>
                </div>

                <div className={styles['user-Followers']}>
                  <div className={styles['data-Number']}>10</div>
                  <div>followers</div>
                </div>

                <div className={styles['user-Following']}>
                  <div className={styles['data-Number']}>10</div>
                  <div>following</div>
                </div>
              </div>

              <div className={styles['user-Edit']}>
                <button className={styles['user-setting']} />
                <button className={styles['edit-Button']}>Edit profile</button>
                <div className={styles['user-Name']}>{user?.nickname}</div>
              </div>
            </div>
          </div>

          <div className={styles['tab-Content']}>
            <TabNavigation activeTab={activeTab} onTabClick={handleTabClick} />

            <div className={styles['postContentWrapper']}>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <>
                  {recordList.length > 0 ? (
                    recordList.map((recordListItem) => (
                      <PostItemListType
                        key={recordListItem.recordId}
                        recordListItem={{...recordListItem, tagNames:recordListItem.tagNames || []}}
                      />
                    ))
                  ) : (
                    <div className={styles['no-records']}>
                      <p>No records found.</p>
                    </div>
                  )}
                </>
              )}
              <div className={styles['paginationWrapper']}>
                {currentPageGroup > 0 && (
                  <button
                    className={styles['paginationButton']}
                    onClick={handlePreviousGroup}>
                    &lt;
                  </button>
                )}
                {renderPageButtons()}
                {(currentPageGroup + 1) * maxButtons < totalPages && (
                  <button
                    className={styles['paginationButton']}
                    onClick={handleNextGroup}>
                    &gt;
                  </button>
                )}
              </div>
            </div>
          </div>

          {/*
          - Tab Bar에 따른 Show Components 영역
            1. 올린 게시물
            2. 좋아요 누른 게시물
            3. 저장한 게시물
        */}
        </div>
      </div>
    </>
  );
}
