'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './OAuthSignUp.module.css';
import axios from 'axios';
import { useCookies } from 'react-cookie';

export default function OAuthSignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [cookies, setCookie] = useCookies(['accessToken', 'refreshToken']);

  const [formData, setFormData] = useState({
    email: email || '',
    nickname: '',
    experience: 0,
    age: 0,
    field: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/auth/oauth/sign-up',
        formData,
        { withCredentials: true },
      );

      if (response.status === 200) {
        // 응답 헤더에서 토큰 추출
        const accessToken = response.headers['authorization'];
        const refreshToken = response.headers['authorization-refresh'];
        const expirationTime = response.headers['expires'];

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
          secure: false, // 개발 환경에서 false로 설정
          sameSite: 'strict', // CSRF 방지
        });

        setCookie('refreshToken', refreshToken, {
          expires,
          path: '/',
          secure: false,
          sameSite: 'strict',
        });

        // 홈페이지로 리다이렉트
        router.push('/');
      }
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience' || name === 'age' ? parseInt(value) : value,
    }));
  };

  return (
    <div className={styles['signUp-wrapper']}>
      <div className={styles['signUp-container']}>
        <h1>추가 정보 입력</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles['input-group']}>
            <label>닉네임</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles['input-group']}>
            <label>경력(년차)</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className={styles['input-group']}>
            <label>나이</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className={styles['input-group']}>
            <label>분야</label>
            <select
              name="field"
              value={formData.field}
              onChange={handleChange}
              required>
              <option value="">선택하세요</option>
              <option value="프론트엔드">프론트엔드</option>
              <option value="백엔드">백엔드</option>
              <option value="풀스택">풀스택</option>
              <option value="데브옵스">데브옵스</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <button type="submit" className={styles['submit-button']}>
            회원가입 완료
          </button>
        </form>
      </div>
    </div>
  );
}
