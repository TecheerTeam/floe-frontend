// store/alarm.store.ts
import { create } from 'zustand';

interface Alarm {
  id: number;
  senderProfileImage: string;
  senderNickname: string;
  notificationType: 'NEW_COMMENT' | 'NEW_LIKE' | 'FOLLOW_REQUEST';
  relatedUrl: string;
  createdAt: string;
  isRead: boolean;
  isDelete: boolean;
}


interface AlarmStore {
  alarms: Alarm[];
  alarmCounts: number; // 알림 카운트 상태 추가
  setAlarms: (alarms: Alarm[]) => void;
  readAllAlarms: () => void; // 모든 알람 읽음 처리 함수 추가
  readAlarm: (id: number) => void; // 읽음 처리 함수
  deleteAlarm: (id: number) => void; // 알람 삭제 처리 함수
  setAlarmCounts: (count: number) => void; // 알림 카운트 설정 함수
}

const useAlarmStore = create<AlarmStore>((set) => ({
  alarms: [],
  alarmCounts: 0, // 기본값 0
  setAlarms: (alarms) => set({ alarms }),
  resetAlarms: () => set({ alarms: [] }),

  readAlarm: (id: number) =>
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, isRead: true } : alarm
      ),
    })),

  // 모든 알림 읽음 처리 함수
  readAllAlarms: () =>
    set((state) => {
      const updatedAlarms = state.alarms.map((alarm) => ({ ...alarm, isRead: true })); // 모든 알람 읽음 처리
      return {
        alarms: updatedAlarms, // 알람 상태 업데이트
        alarmCounts: 0, // 카운트를 0으로 설정
      };
    }),
  // 알람 삭제 처리: 알림이 삭제되면 isDelete를 true로 설정
  deleteAlarm: (id: number) =>
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, isDelete: true } : alarm
      ),
    })),

  setAlarmCounts: (count: number) => set({ alarmCounts: count }), // 알림 카운트 설정
}));

export default useAlarmStore;
