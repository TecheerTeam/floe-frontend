'use client';
import React from 'react';
import styles from './SignIn.module.css';
import Link from 'next/link';
import { useState, KeyboardEvent, useRef, ChangeEvent, useEffect } from 'react';
import { ResponseDto } from '@/apis/response';
import { SignInRequestDto } from '@/apis/request/auth';
import { signInRequest } from '@/apis';
import { SignInResponseDto } from '@/apis/response/auth';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation'; // App Router 전용
export default function SignIn() {
  const router = useRouter();
  //          state: 쿠키 상태          //
  const [cookies, setCookie] = useCookies();
  //          state:     email input 상태          //
  const [email, setEmail] = useState<string>('');
  //          state:     pw input 상태          //
  const [password, setPassword] = useState<string>('');
  //          state:     email input 참조 상태          //
  const emailRef = useRef<HTMLInputElement | null>(null);
  //          state:     pw input 참조 상태          //
  const passwordRef = useRef<HTMLInputElement | null>(null);
  //         event handler:    이메일 변경 이벤트 처리      //
  const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setEmail(value);
  };
  //         event handler:    비밀번호호 변경 이벤트 처리      //
  const onPwChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setPassword(value);
  };
  //          event handler: 이메일 input 키 다운 이벤트 처리 (엔터키 입력히 pw 포커스)         //
  const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (!passwordRef.current) return;
    passwordRef.current.focus();
  };
  //          event handler: 패스워드 input 키 다운 이벤트 처리  (엔터키 입력히 로그인 버튼 클릭)          //
  const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    onSignInButtonClickHandler();
  };

  //          event handler: 로그인 버튼 클릭 이벤트 처리          //
  const onSignInButtonClickHandler = () => {
    const requestBody: SignInRequestDto = { email, password };
    signInRequest(requestBody).then(signInResponse);
    console.log(requestBody);
  };
  //          function: sign in response 처리 함수          //
  const signInResponse = (responseBody: any) => {
    console.log('Sign In Response:', responseBody); // 회원가입 응답 출력
    if (!responseBody) {
      alert('네트워크 이상입니다.');
      return;
    }
    console.log(responseBody);

    const { accessToken, refreshToken, expires } = responseBody;
    console.log('ex', expires);
    const now = new Date().getTime();
    const expirationTime = new Date(now + expires * 1000);

    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    // 쿠키에 accessToken 저장
    setCookie('accessToken', accessToken, {
      expires: expirationTime,
      path: '/',
    });
    setCookie('refreshToken', refreshToken, {
      expires: expirationTime,
      path: '/',
    });

    // 로그인 후 홈 페이지로 리디렉션
    router.push('/');
  };

  //          render: 로그인 페이지 렌더링          //
  return (
    <div className={styles['signIn-wrapper']}>
      <div className={styles['signIn-container']}>
        <div className={styles['signIn-top']}>
          <Link href="/" passHref style={{ textDecoration: 'none' }}>
            <div className={styles['signIn-logo']}>{'FLOE'}</div>
          </Link>
          <div className={styles['signIn-signin']}>{'SignIn'}</div>
        </div>
        <div className={styles['signIn-input-section']}>
          <div className={styles['signIn-email-section']}>
            <div className={styles['E-MAIL']}>{'E-Mail'}</div>
            <input
              ref={emailRef}
              type="text"
              placeholder="Enter your Email"
              className={styles['email-input']}
              value={email}
              onChange={onEmailChangeHandler}
              onKeyDown={onEmailKeyDownHandler}
            />
          </div>
          <div className={styles['signIn-pw-section']}>
            <div className={styles['PW']}>{'PW'}</div>
            <input
              ref={passwordRef}
              type="text"
              placeholder="Enter your Password"
              className={styles['pw-input']}
              value={password}
              onChange={onPwChangeHandler}
              onKeyDown={onPasswordKeyDownHandler}
            />
          </div>
        </div>
        <div
          className={styles['signIn-signIn-button']}
          onClick={onSignInButtonClickHandler}>
          {'Sign In'}
        </div>
        <div className={styles['other-text-section']}>
          <div className={styles['other-text-left']}>
            {"Don't Have An Account?"}
          </div>
          <Link href="/auth/signup" passHref style={{ textDecoration: 'none' }}>
            <div className={styles['other-text-right']}>{'Sign Up Here'}</div>
          </Link>
        </div>
        <div className={styles['divider']}></div>
        <div className={styles['signIn-bottom']}>
          <button className={styles['google-login-button']}>
            <img
              src={'/signin-assets/Web/svg/light/web_light_sq_na.svg'}
              alt="Google icon"
              className={styles['google-icon']}
            />
            Sign in With Google
          </button>
          <button className={styles['github-login-button']}>
            <div className={styles['github-icon']} />
            Sign in with Github
          </button>
          <Link href="/auth" passHref style={{ textDecoration: 'none' }}>
            <div className={styles['return-button']}></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
