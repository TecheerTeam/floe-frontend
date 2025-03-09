'use client';

import React, { useEffect, useState } from 'react';
import styles from './NavBar.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLoginUserStore, useAlarmStore } from '@/store';
import { useCookies } from 'react-cookie';
import {
  deleteAlarmRequest,
  deleteAlreadyReadAllAlarmRequest,
  getAlarmListRequest,
  getUnreadAlarmCountRequest,
  patchReadAlarmRequest,
  patchReadAllAlarmRequest,
  withDrawUserRequest,
} from '@/apis';
import { log } from 'console';
import WithdrawModal from '@/components/common/WithDrawModal';
//   function: 날짜 처리 함수    //
const formatElapsedTime = (createdAt: string) => {
  // 'YYYY-MM-DD HH:mm:ss' 형식의 문자열을 Date 객체로 변환
  const date = new Date(createdAt);
  const now = new Date();

  // 날짜 차이 계산
  const diffInMs = now.getTime() - date.getTime(); // 밀리초 차이
  const diffInSec = diffInMs / 1000; // 초
  const diffInMin = diffInSec / 60; // 분
  const diffInHour = diffInMin / 60; // 시간
  const diffInDay = diffInHour / 24; // 일

  // "몇 분 전", "몇 시간 전", "몇 일 전" 형식으로 변환
  if (diffInDay >= 1) {
    const daysAgo = Math.floor(diffInDay);
    return `${daysAgo}일 전`;
  } else if (diffInHour >= 1) {
    const hoursAgo = Math.floor(diffInHour);
    return `${hoursAgo}시간 전`;
  } else if (diffInMin >= 1) {
    const minutesAgo = Math.floor(diffInMin);
    return `${minutesAgo}분 전`;
  } else {
    return '방금 전';
  }
};

export default function NavBar() {
  const [cookies] = useCookies(); // 쿠키 상태 관리
  const router = useRouter();
  const { user: loginUser, logout } = useLoginUserStore(); // Zustand로 로그인
  //          state: See More 버튼 팝업 상태          //
  const [showSeeMorePopup, setShowSeeMorePopup] = useState<boolean>(false);
  //          state: Alarm 버튼 팝업 상태          //
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);
  //          state: 다크모드 상태 관리          //
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { alarms, setAlarms, readAllAlarms, deleteAlarm, readAlarm } =
    useAlarmStore();
  const [alarmCounts, setAlarmCounts] = useState<number>(0);
  const [withDrawModalOpen, setWithDrawModalOpen] = useState<boolean>(false);
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
    if (!cookies.accessToken) return;
    try {
      const response = await patchReadAlarmRequest(
        notificationId,
        cookies.accessToken,
      );
      if (response.code === 'N003') {
        console.log('알림읽음처리 api 결과 navbar', response.data);
        readAlarm(notificationId); // Zustand 상태 업데이트
        setAlarmCounts((prev) => prev - 1);
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
  //    function: 해당 알람 삭제 처리 함수     //
  const onDeleteAlarmHandler = async (
    notificationId: number,
    isRead: boolean,
  ) => {
    if (!cookies.accessToken) return;
    const alarm = alarms.find((alarm) => alarm.id === notificationId);
    if (!alarm) return; // 알람이 없다면 처리 안함
    try {
      const response = await deleteAlarmRequest(
        notificationId,
        cookies.accessToken,
      );
      if (response.code === 'N005') {
        console.log('알림삭제처리 api 결과 navbar', response.data);
        deleteAlarm(notificationId); // Zustand 상태 업데이트
        if (!isRead) {
          setAlarmCounts((prev) => prev - 1);
        }
      } else {
        console.error(
          '알림 읽음 처리 실패: 응답 코드가 없거나 예상한 코드가 아닙니다.',
          response,
        );
      }
    } catch (error) {
      console.error('Alarm Delete Request Error', error);
      console.log('id', notificationId);
    }
  };
  //    function: 모든 알람 읽음 처리 함수     //
  const onReadAllAlarmHandler = async () => {
    if (!cookies.accessToken) return;
    try {
      const response = await patchReadAllAlarmRequest(cookies.accessToken);
      if (response.code === 'N004') {
        console.log('모든 알람 읽음 처리 성공', response.data);
        useAlarmStore.getState().readAllAlarms();
        setAlarmCounts(0); // alarmCounts를 0으로 설정
      }
    } catch (error) {
      console.error('Read All Alarm Request Error', error);
    }
  };

  //    function: 읽은 알람 모두 삭제 처리 함수     //
  const onDeleteAllReadAlarmHandler = async () => {
    if (!cookies.accessToken) return;
    try {
      const response = await deleteAlreadyReadAllAlarmRequest(
        cookies.accessToken,
      );
      if (response.code === 'N006') {
        console.log('읽은 알람 모두 삭제 처리 성공', response.data);
        // isRead가 true인 알림만 삭제
        useAlarmStore.getState().setAlarms(
          alarms.filter((alarm) => !alarm.isRead), // isRead가 true인 알림은 제외
        );
      }
    } catch (error) {
      console.error('Delete All Alarm Request Error', error);
    }
  };
  //    function: 읽지 않은 알람 카운트 함수     //
  const onAlarmCountsHandler = async () => {
    if (!cookies.accessToken) return;
    try {
      const response = await getUnreadAlarmCountRequest(cookies.accessToken);
      if (response.code === 'N007') {
        console.log('알림 개수 조회 성공', response.data);
        setAlarmCounts(response.data.count);
      }
    } catch (error) {
      console.error('Delete All Alarm Request Error', error);
    }
  };

  //   function: URL에서 recordId 추출하는 함수  //
  const extractRecordId = (url: string) => {
    const match = url.match(/\/records\/(\d+)/); // "/records/" 뒤의 숫자만 추출
    return match ? match[1] : null; // 없으면 null을 반환
  };

  //   function: 알림 클릭 시 해당 recordId로 이동하고 읽음 처리하는 함수 //
  const onAlarmClickHandler = (notificationId: number, relatedUrl: string) => {
    // 해당 알림을 읽음 처리
    onReadAlarmHandler(notificationId);
    // 관련 URL에서 recordId 추출
    const recordId = extractRecordId(relatedUrl);
    if (recordId) {
      router.push(`/post/${recordId}`); // 해당 recordId로 이동
    }
  };

  //     event handler: 로그아웃 이벤트 처리     //
  const onLogoutButtonClickHandler = () => {
    if (!cookies.accessToken) return;
    logout();
    // 로컬 스토리지 초기화
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    console.log('🟢 로컬 스토리지 및 쿠키 초기화 완료');
    // 홈으로 리디렉션
    router.push('/');
  };

  //          function: Alarm 팝업 토글 함수          //
  const toggleWithDrawModalOpen = () => {
    if (!loginUser) {
      return;
    }
    setShowAlarmPopup(!showAlarmPopup);
  };
  //     event handler: 회원탈퇴 이벤트 처리     //
  const withdrawClickHandler = async () => {
    if (!cookies.accessToken || !loginUser) return;
    try {
      const response = await withDrawUserRequest(cookies.accessToken);
      if (response.code === 'U003') {
        logout();
        router.push('/');
      }
    } catch (error) {
      console.error('with Draw User Request Error', error);
    }
  };
  useEffect(() => {
    console.log('🔵 현재 로그인 상태:', loginUser);
  }, [loginUser]);
  useEffect(() => {
    console.log(
      '🟢 Zustand getState()로 확인:',
      useLoginUserStore.getState().user,
    );
  }, []);
  //          effect: 페이지 로드 시 다크모드 여부를 로컬 스토리지에서 확인 //
  useEffect(() => {
    const savedMode = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(savedMode);
    document.body.classList.toggle('dark-mode', savedMode);
  }, []);

  useEffect(() => {
    if (cookies.accessToken) {
      getAlarmListApi();
      onAlarmCountsHandler();
    }
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
          <div className={styles['button-text']}>Home</div>
        </button>
      </Link>

      <button
        className={`${styles['Alarm-Button']} ${
          isActive('/alarm') ? styles['active'] : ''
        }`}
        onClick={toggleAlarmPopup}>
        <div
          className={`${styles['Heart-Icon']} ${alarmCounts > 0 ? styles['has-alarm'] : ''} ${
            isActive('/alarm') ? styles['active-icon'] : ''
          }`}></div>
        <div className={styles['button-text']}>Alarm</div>
      </button>

      {showAlarmPopup && (
        <div
          className={styles['alarm-overlay']}
          onClick={() => setShowAlarmPopup(false)}>
          <div
            className={styles['alarm-popup-container']}
            onClick={(e) => e.stopPropagation()}>
            <div className={styles['alarm-popup-Top']}>
              {loginUser?.profileImage !== null ? (
                <div
                  className={styles['alarm-popup-Top-User-Profile-Image']}
                  style={{
                    backgroundImage: `url(${loginUser?.profileImage})`,
                  }}></div>
              ) : (
                <div className={styles['default-icon']}></div>
              )}
              <div className={styles['alarm-popup-Top-User-More']}>
                <div className={styles['alarm-popup-Top-User-Nickname']}>
                  {loginUser?.nickname}
                </div>
                <div className={styles['alarm-popup-Top-User-Alarm-Count']}>
                  {'New Alarm'}
                  <div className={styles['Alarm-Count']}>{alarmCounts}</div>
                </div>
              </div>
              <div className={styles['alarm-popup-Top-More']}>
                <div
                  className={`${styles['alarm-All-Read-button']} ${
                    alarmCounts > 0 ? '' : styles['active']
                  }`}
                  onClick={onReadAllAlarmHandler}></div>

                <div
                  className={styles['alarm-All-Delete-button']}
                  onClick={onDeleteAllReadAlarmHandler}></div>
              </div>
            </div>
            <div className={styles['alarm-popup-Bottom']}>
              <div className={styles['alarm-popup-list']}>
                {alarms
                  .filter((alarm) => !alarm.isDelete) // 삭제된 알람을 제외하고 렌더링
                  .map((alarm) => {
                    return (
                      <div
                        key={alarm.id}
                        className={`${styles['alarm-popup-Item']} ${alarm.isRead ? styles['read'] : ''}`}
                        onClick={() =>
                          onAlarmClickHandler(alarm.id, alarm.relatedUrl)
                        }>
                        {alarm.senderProfileImage !== null ? (
                          <img
                            src={alarm.senderProfileImage}
                            alt="프로필 이미지"
                            className={styles['alarm-popup-Item-Profile']}
                          />
                        ) : (
                          <div
                            className={
                              styles['alarm-popup-default-Profile']
                            }></div>
                        )}
                        <div className={styles['alarm-Content']}>
                          <div className={styles['alarm-popup-Item-Text']}>
                            <div
                              className={styles['alarm-popup-Item-Nickname']}>
                              {alarm.senderNickname}
                              {'님이'}
                            </div>
                            {alarm.notificationType === 'NEW_COMMENT'
                              ? '내 게시글에 댓글을 남겼습니다.'
                              : '내 댓글에 대댓글을 남겼습니다.'}
                          </div>
                          <div className={styles['alarm-popup-Item-Time']}>
                            {formatElapsedTime(alarm.createdAt)}
                          </div>
                        </div>
                        <div className={styles['alarm-popup-Item-button']}>
                          <div
                            className={`${styles['alarm-popup-Item-Read-button']} ${alarm.isRead ? styles['active-icon'] : ''}`}
                            onClick={() => onReadAlarmHandler(alarm.id)}></div>
                          <div
                            className={styles['alarm-popup-Item-Delete-button']}
                            onClick={() =>
                              onDeleteAlarmHandler(alarm.id, alarm.isRead)
                            }></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
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
          <div className={styles['button-text']}>Post</div>
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
          <div className={styles['button-text']}>Issue</div>
        </button>
      </Link>
      <div className={styles['spacer']}></div>
      <button
        className={styles['See-More-Button']}
        onClick={toggleSeeMorePopup}>
        <div className={styles['More-Icon']}></div>
        <div className={styles['button-text']}>More</div>
      </button>

      {showSeeMorePopup && (
        <div className={styles['popup-container']}>
          {loginUser && (
            <button
              className={styles['option-button']}
              onClick={() => setWithDrawModalOpen(true)}>
              <div className={styles['Option-Icon']}></div>회원탈퇴
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
      {withDrawModalOpen && (
        <WithdrawModal
          onClose={() => setWithDrawModalOpen(false)}
          onWithdraw={withdrawClickHandler}
        />
      )}

      <Link
        href={loginUser ? '/mypage' : '/auth'}
        passHref
        style={{ textDecoration: 'none' }}>
        <button className={styles['Profile-Button']}>
          {loginUser ? (
            loginUser.profileImage !== null ? (
              // 로그인한 유저의 프로필 이미지가 있을 경우
              <div
                className={styles['user-profile-image']}
                style={{
                  backgroundImage: `url(${loginUser.profileImage})`,
                }}></div>
            ) : (
              // 로그인한 유저의 프로필 이미지가 없을 경우
              <div className={styles['Guest-Icon']}></div>
            )
          ) : (
            // 로그인하지 않은 경우
            <div className={styles['Guest-Icon']}></div>
          )}
          {loginUser ? (
            <div className={styles['user-nickname']}>{loginUser?.nickname}</div>
          ) : (
            <div className={styles['guest-Text']}>{'Guest'}</div>
          )}
        </button>
      </Link>
    </div>
  );
}
