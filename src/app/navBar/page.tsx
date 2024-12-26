'use client';

import React, { useEffect, useState } from 'react';
import styles from './NavBar.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLoginUserStore } from '@/store';

export default function NavBar() {
  const { user } = useLoginUserStore(); // Zustand로 로그인
  //          state: See More 버튼 팝업 상태          //
  const [showSeeMorePopup, setShowSeeMorePopup] = useState<boolean>(false);
  //          state: Alarm 버튼 팝업 상태          //
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);
  //          state: 다크모드 상태 관리          //
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  //          function: See More 팝업 토글 함수          //
  const toggleSeeMorePopup = () => {
    setShowSeeMorePopup(!showSeeMorePopup);
  };

  //          function: Alarm 팝업 토글 함수          //
  const toggleAlarmPopup = () => {
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

  //          effect: 페이지 로드 시 다크모드 여부를 로컬 스토리지에서 확인 //
  useEffect(() => {
    const savedMode = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(savedMode);
    document.body.classList.toggle('dark-mode', savedMode);
  }, []);

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
            <div className={styles['alarm-popup-Top-User-Profile-Image']}></div>
            <div className={styles['alarm-popup-Top-User-More']}>
              <div className={styles['alarm-popup-Top-User-Follow-Request']}>
                {'Follow Request'}
              </div>
              <div className={styles['alarm-popup-Top-User-Nickname']}>
                {'JAEJAE'}
              </div>
            </div>
            <div className={styles['alarm-popup-Top-More']}></div>
          </div>
          <div className={styles['alarm-popup-Bottom']}>
            <div className={styles['alarm-popup-Today']}>
              {'Today'}
              <div className={styles['alarm-popup-Item']}>
                <div className={styles['alarm-popup-Item-Profile']}></div>
                <div className={styles['alarm-popup-Item-Content']}>
                  <div className={styles['alarm-popup-Item-Text']}>
                    JAEJAE, JAEJAE and JAEJAE liked your post
                  </div>
                  <span className={styles['alarm-popup-Item-Time']}>1h</span>
                </div>
                <div className={styles['alarm-popup-Item-Images']}></div>
              </div>

              <div className={styles['alarm-popup-Item']}>
                <div className={styles['alarm-popup-Item-Profile']}></div>
                <div className={styles['alarm-popup-Item-Content']}>
                  <div className={styles['alarm-popup-Item-Text']}>
                    JAEJAE, JAEJAE and JAEJAE liked your post
                  </div>
                  <span className={styles['alarm-popup-Item-Time']}>1h</span>
                </div>
                <div className={styles['alarm-popup-Item-Images']}></div>
              </div>

              <div className={styles['alarm-popup-Item']}>
                <div className={styles['alarm-popup-Item-Profile']}></div>
                <div className={styles['alarm-popup-Item-Content']}>
                  <div className={styles['alarm-popup-Item-Text']}>
                    JAEJAE, JAEJAE and JAEJAE liked your post
                  </div>
                  <span className={styles['alarm-popup-Item-Time']}>1h</span>
                </div>
                <div className={styles['alarm-popup-Item-Images']}></div>
              </div>
            </div>

            <div className={styles['alarm-popup-This-Week']}></div>
            <div className={styles['alarm-popup-This-Month']}></div>
            <div className={styles['alarm-popup-Earlier']}></div>
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
          }`}>
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
          <button className={styles['option-button']}>
            <div className={styles['Option-Icon']}></div> Option
          </button>
          <button className={styles['mode-button']} onClick={toggleDarkMode}>
            <div
              className={
                isDarkMode ? styles['Sun-Icon'] : styles['Moon-Icon']
              }></div>
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      )}
      <Link href="/auth" passHref style={{ textDecoration: 'none' }}>
        <button className={styles['Profile-Button']}>
          {user?.profileImage !== null ? (
            <div
              className={styles['user-profile-image']}
              style={{ backgroundImage: `url($${user?.profileImage})` }}></div>
          ) : (
            <div className={styles['Guest-Icon']}></div>
          )}
          {user ? user?.nickname : 'Guest'}
        </button>
      </Link>
    </div>
  );
}
