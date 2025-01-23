'use client';

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import styles from './MyPage.module.css';
import Header from '../header/page';
import NavBar from '../navBar/page';
import TabNavigation from '@/components/tab/tabNavigation/page';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useLoginUserStore } from '@/store';
import { useCookies } from 'react-cookie';
import {
  getLikeListRecordRequest,
  getSaveListRecordRequest,
  getUserRecordRequest,
  getUserRequest,
  putUserProfileImageUpdateRequest,
  patchUserUpdateRequest,
} from '@/apis';
import { RecordListItem, User } from '@/types/interface';
import PostItemListType from '@/components/post/postItemListType/page';
import { patchUserRequestDto } from '@/apis/request/user';
import { removeCookie } from '../cookies';
import LoadingSpinner from '@/components/LoadingSpinner/page';

export default function MyPage() {
  //    state: 라우팅    //
  const router = useRouter();
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
  //         state: password 상태         //
  const [password, setPassword] = useState<string>('');
  //         state: nickname 상태         //
  const [nickname, setNickname] = useState<string>('');
  //         state: experience 상태         //
  const [experience, setExperience] = useState<number | null>(null);
  //         state: age 상태         //
  const [age, setAge] = useState<number | null>(null);
  //         state: field 상태         //
  const [field, setField] = useState<string>('');
  //          state:     pw input 참조 상태          //
  const passwordRef = useRef<HTMLInputElement | null>(null);
  //          state:     nickname input 참조 상태          //
  const nicknameRef = useRef<HTMLInputElement | null>(null);
  //          state:     experience input 참조 상태          //
  const experienceRef = useRef<HTMLInputElement | null>(null);
  //          state:     age input 참조 상태          //
  const ageRef = useRef<HTMLInputElement | null>(null);
  //          state:     field input 참조 상태          //
  const fieldRef = useRef<HTMLInputElement | null>(null);
  //         state: Modal Open 상태         //
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  //         state: 모달창 배경 참조 상태         //
  const modalBackground = useRef();

  //        event handler:  PW 변경 이벤트 처리        //
  const onPassWordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setPassword(value);

    console.log(password);
  };
  //        event handler:  nickname 변경 이벤트 처리        //
  const onNicknameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNickname(value);

    console.log(nickname);
  };
  //        event handler:  Experience 변경 이벤트 처리        //
  const onExperienceChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setExperience(value ? Number(value) : null);
    console.log(experience);
  };
  //        event handler:  Age 변경 이벤트 처리        //
  const onAgeChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAge(value ? Number(value) : null);
    console.log(age);
  };
  //        event handler:  Field 변경 이벤트 처리        //
  const onFieldChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setField(value);
    console.log(field);
  };
  //          event handler: PW 키 다운 이벤트 처리 (엔터키 입력히 Nickname 포커스)           //
  const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (!nicknameRef.current) return;
    nicknameRef.current.focus();
  };
  //          event handler: Nickname 키 다운 이벤트 처리 (엔터키 입력히 Experience 포커스)           //
  const onNicknameKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (!experienceRef.current) return;
    experienceRef.current.focus();
  };
  //          event handler: Experience 키 다운 이벤트 처리 (엔터키 입력히 Age 포커스)           //
  const onExperienceKeyDownHandler = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') return;
    if (!ageRef.current) return;
    ageRef.current.focus();
  };
  //          event handler: Age 키 다운 이벤트 처리 (엔터키 입력히 Field 포커스)           //
  const onAgeKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (!fieldRef.current) return;
    fieldRef.current.focus();
  };
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
  //          event handler: 유저 프로필 변경 이벤트 처리(변경한 값만 전송)          //
  const onUserProfileUpdateHandler = async () => {
    if (!user || !cookies.accessToken) return;

    // 기존 값과 비교하여 변경된 값만 추출
    const updatedUser: Partial<patchUserRequestDto> = {};

    if (password && password.trim() !== '') updatedUser.password = password;
    if (nickname && nickname !== user.nickname)
      updatedUser.nickname = nickname ?? null;
    if (age !== null && age !== user.age) updatedUser.age = age;
    if (experience !== null && experience !== user.experience)
      updatedUser.experience = experience;
    if (field && field !== user.field) updatedUser.field = field ?? null;

    // 변경된 필드가 없으면 요청하지 않음
    if (Object.keys(updatedUser).length === 0) {
      alert('변경된 내용이 없습니다.');
      return;
    }

    try {
      const response = await patchUserUpdateRequest(
        updatedUser as patchUserRequestDto,
        cookies.accessToken,
      );

      if (response.code === 'U004') {
        console.log('update user', response.data);
        console.log('현재 입력된 password:', password);
        console.log('업데이트할 유저 데이터:', updatedUser);

        alert('프로필이 성공적으로 업데이트되었습니다. 다시 로그인해주세요.');
        setUser({ ...user, ...(updatedUser as Partial<User>) }); // 상태 업데이트

        removeCookie('accessToken'); // 토큰 초기화
        removeCookie('refreshToken'); // 토큰 초기화
        router.push('/auth'); // 로그인 페이지로 이동
        setModalOpen(false);
      } else {
        alert('프로필 업데이트 실패');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패', error);
      alert('오류가 발생했습니다.');
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
      const UserResponse = await getUserRequest(cookies.accessToken);
      const PostsResposne = await getUserRecordRequest(
        0,
        5,
        cookies.accessToken,
      );
      if (UserResponse.code === 'U002') {
        setUser({
          email: UserResponse.data.email,
          nickname: UserResponse.data.nickname,
          experience: UserResponse.data.experience,
          age: UserResponse.data.age,
          field: UserResponse.data.field,
          profileImage: UserResponse.data.profileImage,
          userId: UserResponse.data.userId,
        });
        setPostsCounts(PostsResposne.data.totalElements);
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
        response = await getUserRecordRequest(page, 5, cookies.accessToken);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageable.pageNumber);

        console.log('posts tab result', response.data);
      } else if (activeTab === 'SAVE') {
        response = await getSaveListRecordRequest(page, 5, cookies.accessToken);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageable.pageNumber);
        console.log('save tab result', response.data);
      } else if (activeTab === 'LIKE') {
        response = await getLikeListRecordRequest(page, 5, cookies.accessToken);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageable.pageNumber);
        console.log('like tab result', response.data);
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
                  <div className={styles['data-Number']}>{postCounts}</div>
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
                <button
                  className={styles['edit-Button']}
                  onClick={() => setModalOpen(true)}>
                  Edit profile
                </button>
                <div className={styles['user-Name']}>{user?.nickname}</div>
              </div>
            </div>
          </div>

          <div className={styles['tab-Content']}>
            <TabNavigation activeTab={activeTab} onTabClick={handleTabClick} />

            <div className={styles['postContentWrapper']}>
              {isLoading ? (
                <div className={styles['no-records']}>
                  <LoadingSpinner />
                </div>
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

          {modalOpen && (
            <div
              className={styles['modal-overlay']}
              onClick={() => setModalOpen(false)}>
              <div
                className={styles['modal-content']}
                onClick={(e) => e.stopPropagation()}>
                <div className={styles['modal-header']}>Edit Profile</div>
                <div className={styles['modal-nickname']}>
                  <span>{'Nickname: '}</span>
                  <span>{user?.nickname}</span>
                  <input
                    ref={nicknameRef}
                    type="text"
                    placeholder="Enter your Nickname"
                    className={styles['modal-input']}
                    value={nickname === null ? '' : nickname}
                    onChange={onNicknameChangeHandler}
                    onKeyDown={onNicknameKeyDownHandler}
                  />
                </div>
                <div className={styles['modal-pw']}>
                  <span>{'Change '}</span>
                  <span>{'PW'}</span>
                  <input
                    ref={passwordRef}
                    type="text"
                    placeholder="Change your Password?"
                    className={styles['modal-input']}
                    value={password === null ? '' : password}
                    onChange={onPassWordChangeHandler}
                    onKeyDown={onPasswordKeyDownHandler}
                  />
                </div>
                <div className={styles['modal-age']}>
                  <span>{'Age(나이): '}</span>
                  <span>
                    {user?.age}
                    {'세'}
                  </span>

                  <input
                    ref={ageRef}
                    type="text"
                    placeholder="Enter your Age"
                    className={styles['modal-input']}
                    value={age === null ? '' : age}
                    onChange={onAgeChangeHandler}
                    onKeyDown={onAgeKeyDownHandler}
                  />
                </div>
                <div className={styles['modal-exp']}>
                  <span>{'Exp(연차): '}</span>
                  <span>
                    {user?.experience}
                    {'년차'}
                  </span>
                  <input
                    ref={experienceRef}
                    type="text"
                    placeholder="Enter your Experience"
                    className={styles['modal-input']}
                    value={experience === null ? '' : experience}
                    onChange={onExperienceChangeHandler}
                    onKeyDown={onExperienceKeyDownHandler}
                  />
                </div>

                <div className={styles['modal-field']}>
                  <span>{'Field(분야): '}</span>
                  <span>{user?.field}</span>
                  <input
                    ref={fieldRef}
                    type="text"
                    placeholder="Enter your Field"
                    className={styles['modal-input']}
                    value={field === null ? '' : field}
                    onChange={onFieldChangeHandler}
                  />
                </div>
                <div className={styles['modal-button-group']}>
                  <button
                    className={`${styles['modal-button']} ${styles['save']}`}
                    onClick={async () => {
                      await onUserProfileUpdateHandler();
                      setModalOpen(false);
                    }}>
                    Save
                  </button>
                  <button
                    className={`${styles['modal-button']} ${styles['cancel']}`}
                    onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
