// 'use client';

// import React, { useEffect, useState } from 'react';
// import styles from './Posts.Contents.module.css';
// import { useCookies } from 'react-cookie';
// import PostItemListType from '@/components/post/postItemListType/page';
// import { getUserRecordRequest } from '@/apis';
// import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
// import { RecordListItem } from '@/types/interface';
// import { useInView } from 'react-intersection-observer';
// import { GetUserRecordResponseDto } from '@/apis/response/record/record.response.dto';

// //     component: 유저 게시글 보여주기 탭 컴포넌트     //
// export default function PostsContents() {
//   //        state: cookie 상태        //
//   const [cookies] = useCookies();
//   //        state: 게시글 리스트 상태        //
//   const [records, setRecords] = useState<RecordListItem[]>([]);
//   //        state: 현재 페이지 번호        //
//   const [currentPage, setCurrentPage] = useState<number>(0);
//   //        state: 총 페이지 수        //
//   const [totalPages, setTotalPages] = useState<number>(1);
//   //        state: 로딩 상태        //
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const fetchRecords = async (page: number) => {
//     setIsLoading(true);
//     try {
//       const response: GetUserRecordResponseDto = await getUserRecordRequest(
//         page,
//         5,
//         cookies.accessToken,
//       );
//       setRecords(response.data.content);
//       setTotalPages(response.data.totalPages);
//       setCurrentPage(response.data.pageable.pageNumber);
//     } catch (error) {
//       console.error('Error fetching user records:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   //      function: 페이지 클릭 핸들러      //
//   const handlePageClick = (pageNumber: number) => {
//     if (pageNumber >= 0 && pageNumber < totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   //          effect: 스크롤 감지해서 다음 페이지로 넘기기(무한 스크롤)          //
//   useEffect(() => {
//     fetchRecords(currentPage);
//   }, [currentPage]);
//   //     render: 사용자 게시물 렌더링    //
//   return (
//     <div className={styles['postContentWrapper']}>
//       {isLoading ? (
//         <p>Loading...</p>
//       ) : (
//         <>
//           {records.length > 0 ? (
//             records.map((recordListItem) => (
//               <PostItemListType
//                 key={recordListItem.recordId}
//                 recordListItem={recordListItem}
//               />
//             ))
//           ) : (
//             <div className={styles['no-records']}>
//               <p>No records found.</p>
//             </div>
//           )}
//         </>
//       )}
//       <div className={styles['paginationWrapper']}>
//         {Array.from({ length: totalPages }, (_, index) => (
//           <button
//             key={index}
//             className={
//               index === currentPage
//                 ? styles['paginationButtonActive']
//                 : styles['paginationButton']
//             }
//             onClick={() => handlePageClick(index)}>
//             {index + 1}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }
'use client';

import React, { useEffect, useState } from 'react';
import styles from './Posts.Contents.module.css';
import { useCookies } from 'react-cookie';
import PostItemListType from '@/components/post/postItemListType/page';
import { getUserRecordRequest } from '@/apis';
import { RecordListItem } from '@/types/interface';
import { GetUserRecordResponseDto } from '@/apis/response/record/record.response.dto';

//     component: 유저 게시글 보여주기 탭 컴포넌트     //
export default function PostsContents() {
  const [cookies] = useCookies();
  const [records, setRecords] = useState<RecordListItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 페이지네이션 관련 상태
  const maxButtons = 10; // 한 번에 보여질 최대 페이지 버튼 수
  const [currentPageGroup, setCurrentPageGroup] = useState<number>(0); // 현재 페이지 그룹

  //      function: 데이터 가져오기      //
  const fetchRecords = async (page: number) => {
    setIsLoading(true);
    try {
      const response: GetUserRecordResponseDto = await getUserRecordRequest(
        page,
        5,
        cookies.accessToken,
      );
      setRecords(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.pageable.pageNumber);
    } catch (error) {
      console.error('Error fetching user records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //      function: 페이지 클릭 핸들러      //
  const handlePageClick = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  //      function: 이전 그룹으로 이동      //
  const handlePreviousGroup = () => {
    if (currentPageGroup > 0) {
      const newGroup = currentPageGroup - 1;
      setCurrentPageGroup(newGroup);
      setCurrentPage(newGroup * maxButtons); // 이전 그룹의 첫 번째 페이지로 이동
    }
  };

  //      function: 다음 그룹으로 이동      //
  const handleNextGroup = () => {
    if ((currentPageGroup + 1) * maxButtons < totalPages) {
      const newGroup = currentPageGroup + 1;
      setCurrentPageGroup(newGroup);
      setCurrentPage(newGroup * maxButtons); // 다음 그룹의 첫 번째 페이지로 이동
    }
  };

  //     effect: 페이지 변경 시 데이터 가져오기     //
  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage]);

  //      function: 현재 그룹의 페이지 버튼 생성      //
  const renderPageButtons = () => {
    const startPage = currentPageGroup * maxButtons;
    const endPage = Math.min(startPage + maxButtons, totalPages); // 마지막 그룹에서 totalPages를 초과하지 않도록 제한

    return Array.from({ length: endPage - startPage }, (_, index) => {
      const page = startPage + index;
      return (
        <button
          key={page}
          className={
            page === currentPage
              ? styles['paginationButtonActive']
              : styles['paginationButton']
          }
          onClick={() => handlePageClick(page)}>
          {page + 1}
        </button>
      );
    });
  };

  //     render: 사용자 게시물 렌더링    //
  return (
    <div className={styles['postContentWrapper']}>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {records.length > 0 ? (
            records.map((recordListItem) => (
              <PostItemListType
                key={recordListItem.recordId}
                recordListItem={recordListItem}
              />
            ))
          ) : (
            <div className={styles['no-records']}>
              <p>No records found.</p>
            </div>
          )}
        </>
      )}
      <div className={styles['paginationWrapper']}>
        {currentPageGroup > 0 && (
          <button
            className={styles['paginationButton']}
            onClick={handlePreviousGroup}>
            &lt;
          </button>
        )}
        {renderPageButtons()}
        {(currentPageGroup + 1) * maxButtons < totalPages && (
          <button className={styles['paginationButton']} onClick={handleNextGroup}>
            &gt;
          </button>
        )}
      </div>
    </div>
  );
}
