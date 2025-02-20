'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import styles from './Google.Login.module.css';

interface GoogleLoginButtonProps {
  buttonText: string;
}

export default function GoogleLoginButton({
  buttonText,
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const [cookies, setCookie] = useCookies(['accessToken', 'refreshToken']);

  const handleGoogleLogin = () => {
    try {
      // OAuth2 로그인 요청 URL로 리다이렉트
      window.location.href =
        'http://localhost:8080/oauth2/authorization/google';
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('구글 로그인 요청 중 오류:', error);
    }
  };

  // OAuth 로그인 성공 후 토큰 처리
  const handleOAuthLoginSuccess = (response: any) => {
    const { accessToken, refreshToken, expirationTime } = response;

    if (!accessToken || !refreshToken) {
      console.error('토큰 정보가 없습니다.');
      return;
    }

    // 만료 시간 설정
    const now = new Date().getTime();
    const expires = new Date(now + Number(expirationTime) * 1000);

    // 쿠키에 토큰 저장
    setCookie('accessToken', accessToken, {
      expires,
      path: '/',
      secure: false,
      sameSite: 'strict',
    });

    setCookie('refreshToken', refreshToken, {
      expires,
      path: '/',
      secure: false,
      sameSite: 'strict',
    });

    // 홈페이지로 리다이렉트
    router.push('/');
  };

  return (
    <button
      className={styles['google-login-button']}
      onClick={handleGoogleLogin}>
      <img
        src={'/signin-assets/Web/svg/light/web_light_sq_na.svg'}
        alt="Google icon"
        className={styles['google-icon']}
      />
      {buttonText}
    </button>
  );
}
