import { create } from 'zustand';
import { EventSourcePolyfill } from 'event-source-polyfill';

interface Alarm {
  id: number;
  senderProfileImage: string;
  senderNickname: string;
  notificationType: 'NEW_COMMENT' | 'NEW_LIKE' | 'FOLLOW_REQUEST';
  relatedUrl: string;
  createdAt: string;
}


interface AlarmState {
  isSubscribed: boolean;
  eventSource: EventSource | null;
  alarms: Alarm[];
  subscribeToAlarm: (accessToken: string) => void;
  unsubscribeFromAlarm: () => void;
  addAlarm: (alarm: Alarm) => void;
  removeAlarm: (id: number) => void;
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  isSubscribed: false,
  eventSource: null,
  alarms: [],

  subscribeToAlarm: (accessToken: string) => {
    console.log('알람 구독 시작...');

    const connect = () => {
      const source = new EventSourcePolyfill(
        'http://localhost:8080/api/v1/notification/subscribe',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
          heartbeatTimeout: 60000, // 60초 동안 이벤트가 없으면 재연결 시도
        }
      );

      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('새 알람:', data);

        const extractRecordId = (url: string): string => {
          const match = url.match(/api\/v1\/records\/(\d+)/);
          return match ? match[1] : '/';
        };
        const newAlarm: Alarm = {
          id: data.id || new Date().getTime(),
          senderProfileImage: data.senderProfileImage || '/default-profile.png',
          senderNickname: data.senderNickname || '시스템',
          notificationType: data.notificationType || '알림',
          relatedUrl: extractRecordId(data.relatedUrl) || '/',
          createdAt: data.createdAt || new Date().toISOString(),
        };

        set((state) => ({
          alarms: [...state.alarms, newAlarm],
        }));

        // 5초 후 알람 자동 삭제
        setTimeout(() => {
          set((state) => ({
            alarms: state.alarms.filter((alarm) => alarm.id !== newAlarm.id),
          }));
        }, 5000);
      };

      source.onerror = (error) => {
        console.error('SSE 연결 오류:', error);
        source.close();
        set({ isSubscribed: false, eventSource: null });

        // 일정 시간 후 재연결 시도 (5초 후)
        setTimeout(() => {
          if (!get().isSubscribed) {
            console.log('재연결 시도...');
            connect();
          }
        }, 5000);
      };

      set({ isSubscribed: true, eventSource: source });
    };

    connect();
  },

  unsubscribeFromAlarm: () => {
    console.log('알람 구독 해제...');
    set((state) => {
      state.eventSource?.close();
      return { isSubscribed: false, eventSource: null };
    });
  },

  addAlarm: (alarm) => set((state) => ({ alarms: [...state.alarms, alarm] })),

  removeAlarm: (id) =>
    set((state) => ({ alarms: state.alarms.filter((alarm) => alarm.id !== id) })),
}));

export default useAlarmStore;
