'use client';

import React, { useEffect, useState } from 'react';
import styles from './NavBar.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLoginUserStore, useAlarmStore } from '@/store';
import { useCookies } from 'react-cookie';
import {
  deleteAlarmRequest,
  getAlarmListRequest,
  patchReadAlarmRequest,
} from '@/apis';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

// 경과 시간 표시 함수
const getElapsedTime = (createdAt: string) => {
  const now = dayjs().tz('Asia/Seoul'); // 현재 시간을 한국 시간으로 계산
  const writeTime = dayjs(createdAt).tz('Asia/Seoul'); // 작성 시간을 한국 시간으로 변환
  const gap = now.diff(writeTime, 's'); // 초 단위 차이 계산

  if (gap < 60) return `${gap}초 전`;
  if (gap < 3600) return `${Math.floor(gap / 60)}분 전`;
  if (gap < 86400) return `${Math.floor(gap / 3600)}시간 전`;
  return `${Math.floor(gap / 86400)}일 전`;
};

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
  const { alarms, setAlarms, resetAlarms, readAlarm } = useAlarmStore();

  //    state: 알람 읽음 상태    //
  // const [isRead, setIsRead] = useState<boolean>(false);
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

  //    function: 알람 리스트 조회 함수     //
  const getAlarmListApi = async () => {
    if (!cookies.accessToken) return;
    try {
      const response = await getAlarmListRequest(cookies.accessToken);
      if (response.code === 'N002') {
        console.log('알람 리스트 조회 API 요청 성공 Navbar:', response.data);
        setAlarms(response.data.notificationList || []);
      }
    } catch (error) {
      console.error('Alarm List Request Error', error);
    }
  };
  //    function: 해당 알람 읽음 처리 함수     //
  const onReadAlarmHandler = async (notificationId: number) => {
    readAlarm(notificationId); // Zustand 상태 업데이트
    if (!cookies.accessToken) return;
    try {
      const response = await patchReadAlarmRequest(
        notificationId,
        cookies.accessToken,
      );
      if (response.code === 'N003') {
        console.log('알림읽음처리 api 결과 navbar', response.data);
      } else {
        console.error(
          '알림 읽음 처리 실패: 응답 코드가 없거나 예상한 코드가 아닙니다.',
          response,
        );
      }
    } catch (error) {
      console.error('Alarm List Request Error', error);
      console.log('id', notificationId);
    }
  };

  const getAlarmDateCategory = (createdAt: string) => {
    const alarmDate = new Date(createdAt);
    const today = new Date();

    // 오늘 날짜와 비교
    if (alarmDate.toDateString() === today.toDateString()) {
      return 'today';
    }

    // 이번 주인지 확인
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay()),
    ); // 이번 주의 첫날 (일요일)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 이번 주의 마지막 날 (토요일)

    if (alarmDate >= startOfWeek && alarmDate <= endOfWeek) {
      return 'thisWeek';
    }

    // 이번 달인지 확인
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (alarmDate >= startOfMonth) {
      return 'thisMonth';
    }

    // 그 외는 "Earlier"
    return 'earlier';
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
            <div className={styles['alarm-popup-Top-More']}>
              <div className={styles['alarm-All-Read-button']}></div>

              <div className={styles['alarm-All-Delete-button']}></div>
            </div>
          </div>
          <div className={styles['alarm-popup-Bottom']}>
            <div className={styles['alarm-popup-list']}>
              {alarms.map((alarm) => {
                const dateCategory = getAlarmDateCategory(alarm.createdAt);
                return (
                  <div
                    key={alarm.id}
                    className={`${styles['alarm-popup-Item']} ${alarm.isRead ? styles['read'] : ''}`}>
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
                        {getElapsedTime(alarm.createdAt)}
                      </div>
                      
                    </div>
                    <div className={styles['alarm-popup-Item-button']}>
                      <div
                        className={`${styles['alarm-popup-Item-Read-button']} ${alarm.isRead ? styles['active-icon'] : ''}`}
                        onClick={() => onReadAlarmHandler(alarm.id)}></div>
                      <div
                        className={
                          styles['alarm-popup-Item-Delete-button']
                        }></div>
                    </div>
                  </div>
                );
              })}
            </div>
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
