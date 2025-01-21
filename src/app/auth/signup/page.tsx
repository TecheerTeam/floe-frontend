'use client';

import React from 'react';
import styles from './Signup.module.css';
import Link from 'next/link';
import { useState, KeyboardEvent, useRef, ChangeEvent, useEffect } from 'react';
import { ResponseDto } from '@/apis/response';
import { SignUpRequestDto } from '@/apis/request/auth';
import { SignUpResponseDto } from '@/apis/response/auth';
import { signUpRequest } from '@/apis/index';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation'; // App Router 전용
export default function SignUp() {
  //          component: 회원가입 화면 컴포넌트          //
  const router = useRouter();
  //         state: email 상태         //
  const [email, setEmail] = useState<string>('');
  //         state: password 상태         //
  const [password, setPassword] = useState<string>('');
  //         state: nickname 상태         //
  const [nickname, setNickname] = useState<string>('');
  //         state: experience 상태         //
  const [experience, setExperience] = useState<number | null>(null);
  //         state: age 상태         //
  const [age, setAge] = useState<number | null>(null);
  //         state: field 상태         //
  const [field, setField] = useState<string | null>(null);
  //          state: 프로필 이미지 미리보기 URL 상태          //
  const [imageUrl, setImageUrl] = useState<string>('');

  //          state: 이메일 에러 상태          //
  const [isEmailError, setEmailError] = useState<boolean>(false);
  //          state: 패스워드 에러 상태          //
  const [isPasswordError, setPasswordError] = useState<boolean>(false);
  //          state: 닉네임 에러 상태          //
  const [isNicknameError, setNicknameError] = useState<boolean>(false);
  //          state: 이메일 에러 메시지 상태          //
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
  //          state: 패스워드 에러 메시지 상태          //
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
  //          state: 닉네임 에러 메시지 상태          //
  const [nicknameErrorMessage, setNicknameErrorMessage] = useState<string>('');

  //          state:     email input 참조 상태          //
  const emailRef = useRef<HTMLInputElement | null>(null);
  //          state:     pw input 참조 상태          //
  const passwordRef = useRef<HTMLInputElement | null>(null);
  //          state:     nickname input 참조 상태          //
  const nicknameRef = useRef<HTMLInputElement | null>(null);
  //          state:     experience input 참조 상태          //
  const experienceRef = useRef<HTMLInputElement | null>(null);
  //          state:     age input 참조 상태          //
  const ageRef = useRef<HTMLInputElement | null>(null);
  //          state:     field input 참조 상태          //
  const fieldRef = useRef<HTMLInputElement | null>(null);
  //          state:     image input 참조 상태          //
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  //        event handler:  Email 변경 이벤트 처리        //
  const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setEmail(value);
    setEmailError(false);
    setEmailErrorMessage('');
    console.log(email);
  };
  //        event handler:  PW 변경 이벤트 처리        //
  const onPassWordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setPassword(value);
    setPasswordError(false);
    setPasswordErrorMessage('');
    console.log(password);
  };
  //        event handler:  nickname 변경 이벤트 처리        //
  const onNicknameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNickname(value);
    setNicknameError(false);
    setNicknameErrorMessage('');
    console.log(nickname);
  };
  //        event handler:  Experience 변경 이벤트 처리        //
  const onExperienceChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setExperience(value ? Number(value) : null);
    console.log(experience);
  };
  //        event handler:  Age 변경 이벤트 처리        //
  const onAgeChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAge(value ? Number(value) : null);
    console.log(age);
  };
  //        event handler:  Field 변경 이벤트 처리        //
  const onFieldChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setField(value);
    console.log(field);
  };
  //          event handler: Email 키 다운 이벤트 처리 (엔터키 입력히 pw 포커스)          //
  const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (!passwordRef.current) return;
    passwordRef.current.focus();
  };
  //          event handler: PW 키 다운 이벤트 처리 (엔터키 입력히 Nickname 포커스)           //
  const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (!nicknameRef.current) return;
    nicknameRef.current.focus();
  };
  //          event handler: Nickname 키 다운 이벤트 처리 (엔터키 입력히 Experience 포커스)           //
  const onNicknameKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (!experienceRef.current) return;
    experienceRef.current.focus();
  };
  //          event handler: Experience 키 다운 이벤트 처리 (엔터키 입력히 Age 포커스)           //
  const onExperienceKeyDownHandler = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') return;
    if (!ageRef.current) return;
    ageRef.current.focus();
  };
  //          event handler: Age 키 다운 이벤트 처리 (엔터키 입력히 Field 포커스)           //
  const onAgeKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (!fieldRef.current) return;
    fieldRef.current.focus();
  };
 

  const onSignUpButtonClickHandler = () => {
    const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
    const isEmailPattern = emailPattern.test(email);
    if (!isEmailPattern) {
      setEmailError(true);
      setEmailErrorMessage('이메일 주소 포멧이 맞지 않습니다.');
    }
    const isCheckedPassword = password.trim().length >= 8;
    if (!isCheckedPassword) {
      setPasswordError(true);
      setPasswordErrorMessage('비밀번호는 8자 이상 입력해주세요.');
    }
    const hasNickname = nickname.trim().length > 0;
    if (!hasNickname) {
      setNicknameError(true);
      setNicknameErrorMessage('닉네임을 입력해주세요.');
    }
    if (!isEmailPattern || !isCheckedPassword || !hasNickname) {
      return;
    }
    const requestBody: SignUpRequestDto = {
      email,
      password,
      nickname,
      profileImage: null,
      experience,
      field,
      age,
    };
    signUpRequest(requestBody).then(signUpResponse);
  };
  //          function: sign up response 처리 함수          //
  const signUpResponse = async (
    responseBody: SignUpResponseDto | ResponseDto | null,
  ) => {
    if (!responseBody) {
      alert('네트워크 이상입니다.');
      return;
    }
    const { code } = responseBody;
    console.log(responseBody);
    if (code === 'U003') alert('중복된 이메일입니다');
    if (code === 'U004') alert('중복된 닉네임입니다.');
    if (code !== 'U001') return;
    router.push('/');
  };

  //          render: 회원가입 페이지 렌더링          //
  return (
    <div className={styles['signUp-wrapper']}>
      <div className={styles['signUp-container']}>
        <div className={styles['signUp-top']}>
          <Link href="/" passHref style={{ textDecoration: 'none' }}>
            <div className={styles['signUp-logo']}>{'FLOE'}</div>
          </Link>
          <div className={styles['signUp-signUp']}>{'SignUp'}</div>
        </div>
        <div className={styles['signUp-input-section']}>
          <div className={styles['signUp-email-section']}>
            <div className={styles['E-MAIL']}>{'E-Mail *'}</div>
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
          <div className={styles['signUp-pw-section']}>
            <div className={styles['PW']}>{'PW *'}</div>
            <input
              ref={passwordRef}
              type="text"
              placeholder="Enter your Password"
              className={styles['pw-input']}
              value={password}
              onChange={onPassWordChangeHandler}
              onKeyDown={onPasswordKeyDownHandler}
            />
          </div>
          <div className={styles['divider']}></div>
          {/* 닉네임임 */}
          <div className={styles['signUp-nickname-input-section']}>
            <div className={styles['Nickname']}>{'Nickname *'}</div>
            <input
              ref={nicknameRef}
              type="text"
              placeholder="Enter your Nickname"
              className={styles['nickname-input']}
              value={nickname}
              onChange={onNicknameChangeHandler}
              onKeyDown={onNicknameKeyDownHandler}
            />
          </div>
          {/* 연차 */}
          <div className={styles['signUp-experience-input-section']}>
            <div className={styles['Experience']}>{'Experience(연차)'}</div>
            <input
              ref={experienceRef}
              type="text"
              placeholder="연차를 숫자로 입력하세요(ex. 1 -> 1년차)"
              className={styles['experience-input']}
              value={experience === null ? '' : experience.toString()} // null인 경우 빈 문자열로 처리
              onChange={onExperienceChangeHandler}
              onKeyDown={onExperienceKeyDownHandler}
            />
          </div>

          {/* 나이 */}
          <div className={styles['signUp-Age-input-section']}>
            <div className={styles['Age']}>{'Age(나이)'}</div>
            <input
              ref={ageRef}
              type="text"
              placeholder="Enter your Age (ex. 20)"
              className={styles['Age-input']}
              value={age === null ? '' : age.toString()} // null인 경우 빈 문자열로 처리
              onChange={onAgeChangeHandler}
              onKeyDown={onAgeKeyDownHandler}
            />
          </div>

          {/* 분야  */}
          <div className={styles['signUp-Field-input-section']}>
            <div className={styles['Field']}>{'Field(분야)'}</div>
            <input
              ref={fieldRef}
              type="tel"
              placeholder="Enter your Field (ex. Frontend / Backend)"
              className={styles['Field-input']}
              value={field === null ? '' : field.toString()} // null인 경우 빈 문자열로 처리
              onChange={onFieldChangeHandler}
            />
          </div>
        </div>

        <div
          className={styles['signUp-signUp-button']}
          onClick={onSignUpButtonClickHandler}>
          {'Sign Up'}
        </div>
        <div className={styles['signUp-bottom']}>
          <Link href="/auth" passHref style={{ textDecoration: 'none' }}>
            <div className={styles['return-button']}></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
