'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchPage.module.css';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import Banner from '@/assets/Banner.gif';
import Header from '@/app/header/page';
import NavBar from '@/app/navBar/page';
import SideBar from '@/app/sideBar/page';
import PostItemCardType from '@/components/post/postItemCardType/page';
import PostItemListType from '@/components/post/postItemListType/page';
import { getRecordRequest } from '@/apis';
import { RecordListItem } from '@/types/interface';
import { GetRecordResponseDto } from '@/apis/response/record';
import { ResponseDto } from '@/apis/response';
import { useInView } from 'react-intersection-observer';

export default function SearchResult() {
  return (
    <>
      <Header />
      <div className={styles['page-container']}>
        <aside className={styles['navbar']}>
          <NavBar />
        </aside>
        <main className={styles['main-content']}></main>

        <aside className={styles['sidebar']}>
          <SideBar />
        </aside>
      </div>
    </>
  );
}
