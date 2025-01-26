'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './NavBar.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLoginUserStore, useAlarmStore } from '@/store';
import { useCookies } from 'react-cookie';
import { EventSourcePolyfill } from 'event-source-polyfill';
import {
  deleteAlarmRequest,
  getAlarmListRequest,
  patchReadAlarmRequest,
} from '@/apis';
import { AlarmResponseDto } from '@/apis/response/user';
export default function NavBar() {
  const [cookies] = useCookies(); // 쿠키 상태 관리
  const router = useRouter();
  const { user: loginUser, setUser, logout } = useLoginUserStore(); // Zustand로 로그인
  //          state: See More 버튼 팝업 상태          //
  const [showSeeMorePopup, setShowSeeMorePopup] = useState<boolean>(false);
  //          state: Alarm 버튼 팝업 상태          //
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);
  //          state: 다크모드 상태 관리          //
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const {
    alarms,
    addAlarm,
    isSubscribed,
    subscribeToAlarm,
    unsubscribeFromAlarm,
    removeAlarm,
  } = useAlarmStore();
  //    state: 알람 읽음 상태    //
  const [isRead, setIsRead] = useState<boolean>(false);
  //    state: 알람 삭제제 상태    //
  const [isDelete, setIsDelete] = useState<boolean>(false);
  //          function: See More 팝업 토글 함수          //
  const toggleSeeMorePopup = () => {
    setShowSeeMorePopup(!showSeeMorePopup);
  };

  //          function: Alarm 팝업 토글 함수          //
  const toggleAlarmPopup = () => {
    if (!loginUser) {
      return;
    }
    setShowAlarmPopup(!showAlarmPopup);
  };
  //          function: 다크/라이트모드 토글 함수          //
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    setShowSeeMorePopup(false); // 팝업 닫기
  };

  const toggleAlarmSubscription = () => {
    if (!loginUser) {
      return;
    }

    if (!isSubscribed) {
      subscribeToAlarm(cookies.accessToken);
    } else {
      unsubscribeFromAlarm();
    }
  };

  //    function: 해당 알람 읽음 처리 함수     //
  const onReadAlarmHandler = async (notificationId: number) => {
    try {
      const response = await patchReadAlarmRequest(
        notificationId,
        cookies.accessToken,
      );
      if (response.code === 'N003') {
        console.log('알림읽음처리 api 결과 navbar', response.data);
      }
    } catch (error) {
      console.error('Alarm List Request Error', error);
    }
  };
  //    function: 알람 리스트 조회 함수     //
  const getAlarmListApi = async () => {
    try {
      const response = await getAlarmListRequest(cookies.accessToken);
      if (response.code === 'N002') {
        console.log('알람 리스트 조회 API 요청 성공 Navbar:', response.data);
        addAlarm(response.data);
      }
    } catch (error) {
      console.error('Alarm List Request Error', error);
    }
  };
  //    function: 해당 알람 삭제 처리 함수     //
  const onDeleteAlarmHandler = async (notificationId: number) => {
    try {
      const response = await deleteAlarmRequest(
        notificationId,
        cookies.accessToken,
      );
      if (response.code === 'N005') {
        console.log('알림 삭제 처리 성공', response.data);
        removeAlarm(response.data.notificationId);
      }
    } catch (error) {
      console.error('Alarm List Request Error', error);
    }
  };
  //     event handler: 로그아웃 이벤트 처리     //
  const onLogoutButtonClickHandler = () => {
    logout();

    // 로컬 스토리지 초기화
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 홈으로 리디렉션
    router.push('/');
  };

  //          effect: 페이지 로드 시 다크모드 여부를 로컬 스토리지에서 확인 //
  useEffect(() => {
    const savedMode = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(savedMode);
    document.body.classList.toggle('dark-mode', savedMode);
  }, []);
  useEffect(() => {
    getAlarmListApi();
  }, [cookies.accessToken]);
  //          render: NavBar 렌더링          //
  return (
    <div className={styles['navBar-container']}>
      <Link href="/" passHref style={{ textDecoration: 'none' }}>
        <button
          className={`${styles['Home-Button']} ${
            isActive('/') ? styles['active'] : ''
          }`}>
          <div
            className={`${styles['Home-Icon']} ${
              isActive('/') ? styles['active-icon'] : ''
            }`}></div>
          Home
        </button>
      </Link>

      <button
        className={`${styles['Alarm-Button']} ${
          isActive('/alarm') ? styles['active'] : ''
        }`}
        onClick={toggleAlarmPopup}>
        <div
          className={`${styles['Heart-Icon']} ${
            isActive('/alarm') ? styles['active-icon'] : ''
          }`}></div>
        Alarm
      </button>

      {showAlarmPopup && (
        <div className={styles['alarm-popup-container']}>
          <div className={styles['alarm-popup-Top']}>
            <div
              className={styles['alarm-popup-Top-User-Profile-Image']}
              style={{
                backgroundImage: `url(${loginUser?.profileImage})`,
              }}></div>
            <div className={styles['alarm-popup-Top-User-More']}>
              <div className={styles['alarm-popup-Top-User-Follow-Request']}>
                {'Follow Request'}
              </div>
              <div className={styles['alarm-popup-Top-User-Nickname']}>
                {loginUser?.nickname}
              </div>
            </div>
            <div
              className={styles['alarm-popup-Top-More']}
              onClick={toggleAlarmSubscription}>
              {isSubscribed ? (
                <div className={styles['alarm-subscribe-button']}></div>
              ) : (
                <div className={styles['alarm-unsubscribe-button']}></div>
              )}
            </div>
          </div>
          <div className={styles['alarm-popup-Bottom']}>
            <div className={styles['alarm-popup-Today']}>
              {alarms.map((alarm) => {
                return (
                  <div
                    key={alarm.id}
                    className={styles['alarm-popup-Item']}
                    onClick={() => {
                      router.push(`/post/${alarm.relatedUrl}`);
                    }}>
                    <img
                      src={alarm.senderProfileImage}
                      alt="프로필 이미지"
                      className={styles['alarm-popup-Item-Profile']}
                    />
                    <div className={styles['alarm-Content']}>
                      <div className={styles['alarm-popup-Item-Text']}>
                        <strong>{alarm.senderNickname}</strong>님이
                        {alarm.notificationType === 'NEW_COMMENT'
                          ? '댓글을 남겼습니다.'
                          : '알림이 도착했습니다.'}
                      </div>
                      <div className={styles['alarm-popup-Item-Time']}>
                        {new Date(alarm.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className={styles['alarm-popup-Item-button']}>
                      <div
                        className={
                          styles['alarm-popup-Item-Read-button']
                        }></div>
                      <div
                        className={styles['alarm-popup-Item-Delete-button']}
                        onClick={() => onDeleteAlarmHandler(alarm.id)}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles['alarm-popup-This-Week']}></div>
            {/* <div className={styles['alarm-popup-This-Month']}></div>
            <div className={styles['alarm-popup-Earlier']}></div> */}
          </div>
        </div>
      )}

      <Link href="/post/write" passHref style={{ textDecoration: 'none' }}>
        <button
          className={`${styles['Post-Button']} ${
            isActive('/post') ? styles['active'] : ''
          }`}>
          <div
            className={`${styles['Add-Icon']} ${
              isActive('/post') ? styles['active-icon'] : ''
            }`}></div>
          Post
        </button>
      </Link>
      {/* /mypage/save -> /mypage 로 임시변경 */}
      <Link href="/mypage" passHref style={{ textDecoration: 'none' }}>
        <button
          className={`${styles['Save-Button']} ${
            isActive('/mypage') ? styles['active'] : ''
          }`}
          onClick={(e) => {
            e.preventDefault(); // 기본 동작 방지
            if (loginUser) {
              router.push('/mypage'); // 로그인 상태면 /mypage로 이동
            } else {
              router.push('/auth'); // 비로그인 상태면 /auth로 이동
            }
          }}>
          <div
            className={`${styles['Save-Icon']} ${
              isActive('/mypage') ? styles['active-icon'] : ''
            }`}></div>
          Save
        </button>
      </Link>
      <Link href="/issue" passHref style={{ textDecoration: 'none' }}>
        <button
          className={`${styles['Issue-Button']} ${
            isActive('/issue') ? styles['active'] : ''
          }`}>
          <div
            className={`${styles['Issue-Icon']} ${
              isActive('/issue') ? styles['active-icon'] : ''
            }`}></div>
          Issue
        </button>
      </Link>
      <div className={styles['spacer']}></div>
      <button
        className={styles['See-More-Button']}
        onClick={toggleSeeMorePopup}>
        <div className={styles['More-Icon']}></div>
        More
      </button>

      {showSeeMorePopup && (
        <div className={styles['popup-container']}>
          {loginUser && (
            <button className={styles['option-button']}>
              <div className={styles['Option-Icon']}></div> Option
            </button>
          )}
          {loginUser && ( // 유저가 로그인된 상태에서만 렌더링
            <button
              className={styles['logout-button']}
              onClick={onLogoutButtonClickHandler}>
              <div className={styles['logout-Icon']}></div> Logout
            </button>
          )}
          <button className={styles['mode-button']} onClick={toggleDarkMode}>
            <div
              className={
                isDarkMode ? styles['Sun-Icon'] : styles['Moon-Icon']
              }></div>
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      )}
      <Link
        href={loginUser ? '/mypage' : '/auth'}
        passHref
        style={{ textDecoration: 'none' }}>
        <button className={styles['Profile-Button']}>
          {loginUser?.profileImage !== null ? (
            <div
              className={styles['user-profile-image']}
              style={{
                backgroundImage: `url(${loginUser?.profileImage})`,
              }}></div>
          ) : (
            <div className={styles['Guest-Icon']}></div>
          )}
          {loginUser ? loginUser?.nickname : 'Guest'}
        </button>
      </Link>
    </div>
  );
}
