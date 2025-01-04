import React from 'react';
import styles from './Reply.module.css';

export default function Reply() {
  return (
    <div className={styles['reply-container']}>
      <div className={styles['reply-item-input-container']}>
        <div className={styles['user-profile-box']}>
          <div className={styles['user-profile-image']}></div>
          <div className={styles['user-profile-nickname']}>{'Kgccm'}</div>
        </div>
        <input
          type="text"
          placeholder="대댓글 추가..."
          className={styles['reply-input']}
        />
        <div className={styles['reply-Apply-Button']}>Apply</div>
      </div>
      <div className={styles['reply-item-list-container']}>
        <div className={styles['reply-item-list']}>
          <div className={styles['reply-item']}>
            <div className={styles['reply-user-profile-image']}></div>
            <div className={styles['reply-user-nickname']}>{'Kgccm'}</div>
            <div className={styles['reply-text']}>{'댓글입니다'}</div>
            <div className={styles['reply-write-time']}>{'3분전'}</div>
          </div>
          <div className={styles['reply-item']}>
            <div className={styles['reply-user-profile-image']}></div>
            <div className={styles['reply-user-nickname']}>{'Kgccm'}</div>
            <div className={styles['reply-text']}>{'댓글입니다'}</div>
            <div className={styles['reply-write-time']}>{'3분전'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
