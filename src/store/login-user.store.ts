import { create } from 'zustand';
import { User } from '@/types/interface'; // User 인터페이스 임포트

interface LoginUserStore {
  user: User | null;  // User 타입을 사용하여 user 상태 설정
  setUser: (user: User) => void; // setUser는 User 타입을 받음
  logout: () => void; // 로그아웃 기능 추가
}

const useLoginUserStore = create<LoginUserStore>((set) => ({
  user: null, // 기본값은 null
  setUser: (user) => set(state => ({ ...state, user })),// 유저 정보를 받아 상태 업데이트
  logout: () => set(state => ({ ...state, user: null })) // 로그아웃 시 상태 초기화
}));

export default useLoginUserStore;
