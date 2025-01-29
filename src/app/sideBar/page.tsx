import React, { useEffect, useState } from 'react';
import styles from './SideBar.module.css';
import { useCookies } from 'react-cookie';
import { usePathname } from 'next/navigation'; // usePathname 추가
import { getAllTagRatioRequest, getUserTagRatioRequest } from '@/apis';
import { Pie } from 'react-chartjs-2'; // Pie 차트 컴포넌트
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart.js 모듈 등록
ChartJS.register(ArcElement, Tooltip, Legend);

export default function SideBar() {
  const [cookies] = useCookies(); // 쿠키 상태 관리
  const pathname = usePathname(); // 현재 경로 확인
  const [tags, setTags] = useState<
    Array<{ tagName: string; count: number; ratio: number }>
  >([]);
  const [userTags, setUserTags] = useState<
    Array<{ tagName: string; count: number; ratio: number }>
  >([]);

  const TagHandler = async () => {
    if (!cookies.accessToken) return;
    try {
      const response = await getAllTagRatioRequest(cookies.accessToken);
      if (response.code === 'T001') {
        setTags(response.data); // 응답 받은 데이터로 tags 상태 설정
        console.log(response.data);
      }
    } catch (error) {
      console.error('Error posting record', error);
    }
  };
  const UserTagHandler = async () => {
    if (!cookies.accessToken) return;
    try {
      const response = await getUserTagRatioRequest(cookies.accessToken);
      if (response.code === 'T002') {
        setUserTags(response.data); // 응답 받은 데이터로 tags 상태 설정
        console.log(response.data);
      }
    } catch (error) {
      console.error('Error posting record', error);
    }
  };
  const chartData = {
    labels: (pathname === '/mypage' ? userTags : tags).map(
      (tag) => tag.tagName,
    ), // 경로가 /mypage이면 userTags 사용
    datasets: [
      {
        data: (pathname === '/mypage' ? userTags : tags).map(
          (tag) => tag.ratio,
        ), // 비율 데이터
        backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#F2F433'], // 태그별 색상 설정
        hoverOffset: 4,
      },
    ],
  };
  useEffect(() => {
    if (!cookies.accessToken) return;
    TagHandler();
    if (pathname === '/mypage') {
      UserTagHandler(); // /mypage 경로일 때만 UserTagHandler 호출
    }
  }, [cookies.accessToken, pathname]);

  return (
    <div className={styles['sidebar-wrapper']}>
      <div className={styles['Intro-Box']}>
        <div className={styles['Intro-Title']}>The FLOE</div>
        <div className={styles['Intro-other']}>
          <br />
          Share your major trouble with other people.
          <br />
          <br />
          Solve the problem and cool your head.
          <br />
          It’s good for your mental care.
        </div>
      </div>

      <div className={styles['Chart-Box']}>
        <div className={styles['Chart-Box-Title']}>
          {pathname === '/mypage' ? 'Tags of my Posts' : 'Tags of Total Posts'}
        </div>
        <div className={styles['pie-chart']}>
          <Pie data={chartData} /> {/* Pie 차트 렌더링 */}
        </div>
      </div>
    </div>
  );
}
