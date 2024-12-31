'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { getUserRequest } from '@/apis';
import { GetUserResponseDto } from '@/apis/response/user';
import { ResponseDto } from '@/apis/response';

export default function MyPage() {
  const router = useRouter();
  //        state: 유저 로그인 상태(zustand)        //
  const { user } = useLoginUserStore();
  //        state: cookie 상태        //
  const [cookies] = useCookies();
  //          state: 파일 Input 참조 상태         //
  const fileInputRef = useRef<HTMLInputElement>(null);
  //          state: Tab Navigation 선택 상태         //
  const [activeTab, setActivetab] = useState('POSTS');
  //          state: 닉네임 상태          //
  const [nickname, setNickname] = useState<string>('');
  //          state: 프로필 이미지 상태          //
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // 현재 이미지를 클릭했을때
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Iamge 변경 함수
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        document.documentElement.style.setProperty(
          '--mypage-image-userInitialImage',
          `url(${reader.result})`,
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Tab 선택했을 때
  const handleTabClick = (tab: string) => {
    setActivetab(tab);
  };

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

  //        function: getUserResponse 처리 함수       //
  const getUserResponse = (
    responseBody: GetUserResponseDto | ResponseDto | null,
  ) => {
    if (!responseBody) return;
    const { code } = responseBody;
    if (code === 'U001') alert('유저를 찾을 수 없음');
    if (code !== 'U002') return;

    const { nickname, profileImage } = responseBody as GetUserResponseDto;
    setNickname(nickname);
    setProfileImage(profileImage);
  };

  //     effect: user email path variable 변경시 실행(user email에 따라 해당 유저의 데이터 마운트)     //
  useEffect(() => {
    if (!cookies.accessToken) {
      alert('로그인이 필요합니다.');
      router.push('/auth'); // 로그인 페이지로 이동
      return;
    }
    getUserRequest(cookies.accessToken).then(getUserResponse); // 유저 정보 가져오기
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
                onClick={handleImageClick}></div>
            ) : (
              <div
                className={styles['user-Image']}
                onClick={handleImageClick}></div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
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
