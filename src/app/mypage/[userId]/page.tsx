'use client';

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import styles from './OtherUserPage.module.css';
import Header from '../../header/page';
import NavBar from '../../navBar/page';
import TabNavigation from '@/components/tab/tabNavigation/page';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useLoginUserStore } from '@/store';
import { useCookies } from 'react-cookie';
import {
  getLikeListRecordRequest,
  getSaveListRecordRequest,
  getUserRecordRequest,
  getOtherUserProfileRequest,
  getOtherUserRecordRequest,
  getUserFollowCountRequest,
  getUserFollowStatusRequest,
  postUserFollowRequest,
  deleteUserFollowRequest,
  getUserFollowerRequest,
  getUserFollowingRequest,
  // getOtherUserRecordRequest,
} from '@/apis';
import { RecordListItem, User } from '@/types/interface';
import PostItemListType from '@/components/post/postItemListType/page';
import { patchUserRequestDto } from '@/apis/request/user';
import { removeCookie } from '../../cookies';

export default function OtherUserMyPage() {
  //    state: 라우팅    //
  const router = useRouter();
  //        state: record Id varibale 상태        //
  const { userId } = useParams(); // URL에서 recordId를 가져옴
  const [otherUser, setOtherUser] = useState<User | null>(null);
  //        state: 유저 로그인 상태(zustand)        //
  const { user, setUser, logout } = useLoginUserStore();
  //        state: cookie 상태        //
  const [cookies] = useCookies();
  //          state: 프로필 이미지 입력 요소 참조 상태          //
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  //          state: 프로필 이미지 미리보기 URL 상태          //
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  //          state: Tab Navigation 선택 상태         //
  const [activeTab, setActivetab] = useState<string>('POSTS');
  //         state: 게시물 리스트 상태         //
  const [recordList, setRecordList] = useState<RecordListItem[]>([]);
  //         state: 현재 페이지 상태(페이지네이션)         //
  const [currentPage, setCurrentPage] = useState<number>(0);
  //         state: 전체 페이지 상태(페이지네이션)         //
  const [totalPages, setTotalPages] = useState<number>(1);
  //         state: 로딩 상태(페이지네이션)         //
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //         state: 게시글 개수 상태(페이지네이션)         //
  const [postCounts, setPostsCounts] = useState<number>(0);
    //         state: 팔로워 수 상태         //
    const [followerCount, setFollowerCount] = useState<number>(0);
    //         state: 팔로잉 수 상태         //
    const [followingCount, setFollowingCount] = useState<number>(0);
  //     function: userId가 string|string[] 형식일 경우 number로 변환     //
  const id = Array.isArray(userId) ? Number(userId[0]) : Number(userId);
  if (!id || isNaN(id)) {
    console.error('Invalid userId:', userId);
    return undefined;
  }
  //          event handler: 탭 버튼 클릭 이벤트 처리          //
  const handleTabClick = (tab: string) => {
    setActivetab(tab);

    if (tab === 'SAVE' || tab === 'LIKE') {
      setRecordList([]); // 데이터를 클리어
      setTotalPages(1);
      setCurrentPage(0);
    } else {
      fetchData(0); // 첫 페이지의 데이터를 가져오기
    }
  };
  //        function: getUser 처리 함수(사용자 정보를 받아온다다)       //
  const getOtherUserRequestAPI = async () => {
    try {
      const UserResponse = await getOtherUserProfileRequest(
        id,
        cookies.accessToken,
      );

      console.log(UserResponse);
      if (UserResponse.code === 'U002') {
        setOtherUser({
          email: UserResponse.data.email,
          nickname: UserResponse.data.nickname,
          experience: UserResponse.data.experience,
          age: UserResponse.data.age,
          field: UserResponse.data.field,
          profileImage: UserResponse.data.profileImage,
          userId: UserResponse.data.id,
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

  //      function: 게시물 데이터 가져오기      //
  const fetchData = async (page: number) => {
    setIsLoading(true);
    setRecordList([]); // 빈 배열로 초기화
    try {
      let response;

      if (activeTab === 'POSTS') {
        response = await getOtherUserRecordRequest(
          id,
          page,
          5,
          cookies.accessToken,
        );
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageable.pageNumber);
        setPostsCounts(response.data.totalElements);
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

  //      function: 페이지 클릭 핸들러 (페이지네이션)      //
  const handlePageClick = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  //      function: 이전 그룹으로 이동 (페이지네이션)     //
  const handlePreviousGroup = () => {
    if (currentPageGroup > 0) {
      const newGroup = currentPageGroup - 1;
      setCurrentPageGroup(newGroup);
      setCurrentPage(newGroup * maxButtons); // 이전 그룹의 첫 번째 페이지로 이동
    }
  };

  //      function: 다음 그룹으로 이동 (페이지네이션)     //
  const handleNextGroup = () => {
    if ((currentPageGroup + 1) * maxButtons < totalPages) {
      const newGroup = currentPageGroup + 1;
      setCurrentPageGroup(newGroup);
      setCurrentPage(newGroup * maxButtons); // 다음 그룹의 첫 번째 페이지로 이동
    }
  };
  //      function: 현재 그룹의 페이지 버튼 생성 (페이지네이션)     //
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


  
    //    function: 팔로워,팔로잉 카운트 조회   //
    const FollowerFollowingCount = async () => {
      if (!cookies.accessToken || !user?.userId) return;
      try {
        const response = await getUserFollowCountRequest(
          user?.userId,
          cookies.accessToken,
        );
        console.log('팔로잉 팔로워 카운트 조회 api');
        if (response.code === 'UF04') {
          console.log('팔로잉 팔로워 카운트 api 성공값', response.data);
          setFollowerCount(response.data.followerCount);
          setFollowingCount(response.data.followingCount);
        }
      } catch (error) {
        console.error('팔로잉 팔로워 카운트 에러', error);
      }
    };
  
  //     effect: 탭 변경에 따른 데이터 렌더링    //
  useEffect(() => {
    setRecordList([]); // 탭 변경 시 기존 데이터를 클리어
    fetchData(currentPage);
  }, [activeTab, currentPage]);
  //     effect: user email path variable 변경시 실행(user email에 따라 해당 유저의 데이터 마운트)     //
  useEffect(() => {
    if (!cookies.accessToken) {
      alert('로그인이 필요합니다.');
      router.push('/auth'); // 로그인 페이지로 이동
      return;
    }
    getOtherUserRequestAPI(); // 유저 정보 가져오기
  }, [cookies.accessToken]);
  //     effect: 팔로워.팔로잉 각종 상태    //
  useEffect(() => {
    if (!cookies.accessToken || !user?.userId) return;
   
    FollowerFollowingCount();
  }, [cookies.accessToken, user?.userId]);
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
            {otherUser?.profileImage !== null ? (
              <div
                className={styles['user-profile-image']}
                style={{
                  backgroundImage: `url(${otherUser?.profileImage})`,
                }}></div>
            ) : (
              <div className={styles['user-Image']}></div>
            )}

            <div className={styles['user-Data-Wrapper']}>
              <div className={styles['user-Data']}>
                <div className={styles['user-Posts']}>
                  <div className={styles['data-Number']}>{postCounts}</div>
                  <div>posts</div>
                </div>

                <div className={styles['user-Followers']}>
                  <div className={styles['data-Number']}>  {followerCount}</div>
                  <div>followers</div>
                </div>

                <div className={styles['user-Following']}>
                  <div className={styles['data-Number']}> {followingCount}</div>
                  <div>following</div>
                </div>

                <div className={styles['user-Name']}>{otherUser?.nickname}</div>
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
                        recordListItem={{
                          ...recordListItem,
                          tagNames: recordListItem.tagNames || [],
                        }}
                      />
                    ))
                  ) : (
                    <div className={styles['no-records']}>
                      {activeTab === 'SAVE' || activeTab === 'LIKE' ? (
                        <p>You do not have permission.</p>
                      ) : (
                        <p>No records found.</p>
                      )}
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
        </div>
      </div>
    </>
  );
}
