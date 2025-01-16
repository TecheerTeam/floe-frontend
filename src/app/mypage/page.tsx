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
import { getUserRequest, putUserProfileImageUpdateRequest } from '@/apis';

export default function MyPage() {
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
  const [activeTab, setActivetab] = useState('POSTS');

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
  };
  //          event handler: 탭 버튼 클릭 라우팅 처리          //
  const TabContent = () => {
    switch (activeTab) {
      case 'POSTS':
        return PostsContents();
      case 'LIKE':
        return LikeContents();
      case 'SAVE':
        return SaveContents();
      default:
        return <div> Default Contents </div>;
    }
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
        {/* 
          - Profile 영역 
            1. Image ✅
            2. posts ✅
            3. followers ✅
            4. following ✅
            5. Setting ✅
            6. Edit Profile ✅
            7. User Name ✅
        */}
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

          {/* 
          - Tab Bar 영역
            1. POSTS
            2. LIKE
            3. SAVE
        */}
          <div className={styles['tab-Content']}>
            <TabNavigation activeTab={activeTab} onTabClick={handleTabClick} />
            <div>{TabContent()}</div>
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
