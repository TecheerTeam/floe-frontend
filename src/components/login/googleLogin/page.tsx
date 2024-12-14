'use client';

import React from 'react';
import styles from './Google.Login.module.css';

interface GoogleLoginButtonProps {
  buttonText: string;
}

export default function GoogleLoginButton({ buttonText }: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    try {
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_BASE_URL}?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`;

      // Google 로그인 페이지로 이동
      window.location.href = googleAuthUrl;
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('구글 로그인 요청 중 오류:', error);
    }
  };

  return (
    <button className={styles['google-login-button']} onClick={handleGoogleLogin}>
      <img
        src={'/signin-assets/Web/svg/light/web_light_sq_na.svg'}
        alt="Google icon"
        className={styles['google-icon']}
      />
      {buttonText}
    </button>
  );
}
