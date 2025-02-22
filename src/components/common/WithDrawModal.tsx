'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './WithdrawModal.module.css';

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: () => void;
}

export default function WithdrawModal({ onClose, onWithdraw }: WithdrawModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'; // 모달이 열릴 때 스크롤 방지
    return () => {
      document.body.style.overflow = 'auto'; // 모달이 닫히면 원래대로 복구
    };
  }, []);

  return createPortal(
    <div className={styles['modal-backdrop']} onClick={onClose}>
      <div className={styles['modal-container']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-text']}>정말로 회원탈퇴 하시겠습니까?</div>
        <div className={styles['modal-text-red']}>(이메일은 30일 후에 재사용 가능합니다.)</div>
        <div className={styles['modal-buttons']}>
          <button className={styles['modal-confirm']} onClick={onWithdraw}>예</button>
          <button className={styles['modal-cancel']} onClick={onClose}>아니오</button>
        </div>
      </div>
    </div>,
    document.body // 📌 모달을 `body`에 직접 추가하여 `main-content`의 영향 받지 않음
  );
}
