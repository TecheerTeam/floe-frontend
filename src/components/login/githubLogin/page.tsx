'use client';

import React from 'react';
import styles from './Github.Login.module.css';

interface GithubLoginButtonProps {
  buttonText: string;
}

export default function GithubLoginButton({
  buttonText,
}: GithubLoginButtonProps) {
  const handleGithubLogin = () => {
    try {
      // OAuth2 로그인 요청 URL로 리다이렉트
      window.location.href =
        'http://localhost:8080/oauth2/authorization/github';
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('깃허브 로그인 요청 중 오류:', error);
    }
  };

  return (
    <button
      className={styles['github-login-button']}
      onClick={handleGithubLogin}>
      <div className={styles['github-icon']} />
      {buttonText}
    </button>
  );
}
