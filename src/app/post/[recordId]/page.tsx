import { getDetailRecordRequest } from '@/apis';
import PostDetail from './PostDetail';
import { Metadata } from 'next';

// ✅ [SEO 적용] 메타데이터 동적 생성
export async function generateMetadata({
  params,
}: {
  params?: Promise<{ recordId?: string | string[] }>;
}): Promise<Metadata> {
  // ✅ `params`가 비동기적으로 반환될 수 있으므로 `await`으로 처리
  const resolvedParams = await params;

  if (!resolvedParams || !resolvedParams.recordId) {
    return {
      title: '게시물 없음',
      description: '요청한 게시물을 찾을 수 없습니다.',
    };
  }

  // ✅ recordId가 배열이면 첫 번째 값을 사용하고, 숫자로 변환
  const recordIdParam = Array.isArray(resolvedParams.recordId)
    ? resolvedParams.recordId[0]
    : resolvedParams.recordId;
  const id = Number(recordIdParam);

  if (isNaN(id) || id <= 0) {
    return {
      title: '게시물 없음',
      description: '잘못된 요청입니다.',
    };
  }

  try {
    const recordResponse = await getDetailRecordRequest(id);

    if (!recordResponse || recordResponse.code !== 'R003') {
      return {
        title: '게시물 없음',
        description: '게시물을 찾을 수 없습니다.',
      };
    }

    const record = recordResponse.data;

    return {
      title: `${record.title} | 게시물 제목`,
      description: record.description || '게시물 상세 내용',
      openGraph: {
        title: record.title,
        description: record.description || '게시물 상세 내용',
        images: [{ url: record.imageUrl || '/default-og-image.png' }],
        type: 'article',
      },
    };
  } catch (error) {
    console.error('❌ 게시물 메타데이터 불러오기 오류:', error);
    return {
      title: '게시물 없음',
      description: '게시물을 찾을 수 없습니다.',
    };
  }
}

export default async function PostDetailPage({
  params,
}: {
  params?: Promise<{ recordId?: string | string[] }>;
}) {
  // ✅ `params`가 비동기적으로 반환될 수 있으므로 `await`으로 처리
  const resolvedParams = await params;

  if (!resolvedParams || !resolvedParams.recordId) {
    console.error('⚠️ params가 존재하지 않음');
    return <div>잘못된 접근입니다.</div>;
  }

  // ✅ recordId가 배열이면 첫 번째 값을 사용하고, 숫자로 변환
  const recordIdParam = Array.isArray(resolvedParams.recordId)
    ? resolvedParams.recordId[0]
    : resolvedParams.recordId;
  const id = Number(recordIdParam);

  // ✅ 유효성 검사
  if (isNaN(id) || id <= 0) {
    console.error('⚠️ 잘못된 recordId:', recordIdParam);
    return <div>존재하지 않는 게시물입니다.</div>;
  }

  try {
    // ✅ 서버에서 데이터 가져오기 (SSR 적용)
    const recordResponse = await getDetailRecordRequest(id);

    if (!recordResponse || recordResponse.code !== 'R003') {
      console.error('⚠️ 게시물을 찾을 수 없습니다.');
      return <div>게시물을 찾을 수 없습니다.</div>;
    }

    console.log('✅ 게시물데이터 SSR', recordResponse.data);

    // ✅ SSR로 가져온 데이터를 클라이언트 컴포넌트로 전달
    return <PostDetail record={{ ...recordResponse.data }} />;
  } catch (error) {
    console.error('❌ 게시물 데이터 불러오기 오류:', error);
    return <div>오류 발생</div>;
  }
}
