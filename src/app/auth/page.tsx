'use client';
import Link from 'next/link';
import styles from './Auth.module.css';
import React from 'react';
import { useState } from 'react';

import GoogleLoginButton from '@/components/login/googleLogin/page';
import GithubLoginButton from '@/components/login/githubLogin/page';

export default function AuthPage() {
  // false: 라이트테마 true: 다크테마
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  //           render: Auth 메인 페이지 렌더링           //
  return (
    <div id={styles['auth-wrapper']} className={isDarkMode ? 'dark-mode' : ''}>
      <div className={styles['auth-left-box']}></div>
      <div className={styles['auth-right-box']}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <div className={styles['auth-right-top-title']}>FLOE</div>
        </Link>
        <div className={styles['auth-right-intro-title']}>
          Develop flow
          <br />A place to make your only develop Floor
        </div>

        <GoogleLoginButton buttonText="Sign in with Google" />
        <GithubLoginButton buttonText="Sign in with Github" />

        <div className={styles['divider']}>
          <span className={styles['line']}></span>
          <span className={styles['text']}>OR</span>
          <span className={styles['line']}></span>
        </div>
        <Link href="/auth/signup" passHref>
          <button className={styles['Button-Sign-Up']}>Sign Up</button>
        </Link>
        <div className={styles['Already-text']}>Already Have You Account?</div>
        <Link href="/auth/signin" passHref>
          <button className={styles['Button-Sign-In']}>Sign In</button>
        </Link>
        <Link href="/" passHref>
          <button className={styles['Button-Return-Home']}>
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
