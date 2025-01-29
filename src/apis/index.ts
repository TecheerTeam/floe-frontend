import axios from 'axios';
import { ResponseDto } from './response';
import { PostRecordResponseDto, PutRecordResponseDto, DeleteRecordResponseDto, PostCommentResponseDto, GetCommentResponseDto, DeleteCommentResponseDto, GetRecordResponseDto, GetTagRatioResponseDto } from './response/record';
import { PostCommentRequestDto, PutRecordRequestDto, PostRecordRequestDto, PutCommentRequestDto } from './request/record';
import { SignInRequestDto, SignUpRequestDto } from './request/auth';
import { SignUpResponseDto } from './response/auth';
import GetDetailRecordResponseDto, { GetCheckSavedRecordResponseDto, GetUserRecordResponseDto } from './response/record/record.response.dto';
import { AlarmResponseDto, GetUserResponseDto } from './response/user';
import { SearchRecordRequestDto } from './request/search';
import { comment } from 'postcss';
import { GetCommentLikeCountResponseDto, GetCommentLikeListResponseDto, GetRecordLikeCountResponseDto, GetRecordLikeListResponseDto } from './response/record/like.response.dto';
import PatchUserResponseDto from './response/user/patch-user.resposne.dto';
import { patchUserRequestDto } from './request/user';
import { EventSourcePolyfill } from 'event-source-polyfill';
const DOMAIN = 'http://localhost:8080';
const API_DOMAIN = `${DOMAIN}/api/v1`;


const authorization = (accessToken: string) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } }
};
const SIGN_IN_URL = () => `${API_DOMAIN}/auth/login`;
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up`;


// 로그인 요청을 보내고 응답에서 'Authorization' 헤더를 추출
export const signInRequest = async (requestBody: SignInRequestDto) => {
    const result = await axios.post(SIGN_IN_URL(), requestBody, { withCredentials: true })
        .then(response => {
            console.log('Response Headers:', response.headers);
            // 응답 헤더에서 'accessToken'과 'refreshToken' 추출
            const accessToken = response.headers['authorization']; // 'authorization'이 맞는지 확인
            const refreshToken = response.headers['authorization-refresh']; // 'auth
            const expirationTime = response.headers['expires'];

            const responseBody = {
                ...response.data, // 기존 응답 데이터
                accessToken,       // 추가된 accessToken
                refreshToken,
                expirationTime      // 추가된 refreshToken
            };

            // 토큰 값이 없으면 실패 처리
            if (!accessToken || !refreshToken) {
                console.error('토큰 정보가 없습니다.');
                return null;  // 또는 error 처리
            }
            console.log('로그인 api 결과', responseBody);
            return responseBody;
        })
        .catch(error => {
            if (!error.response || !error.response.data) {
                return null;
            }
            const responseBody: ResponseDto = error.response.data;
            console.error('로그인 오류:', responseBody);
            return responseBody;
        });

    return result;
};

export const signUpRequest = async (requestBody: SignUpRequestDto) => {
    const result = await axios.post(SIGN_UP_URL(), requestBody)
        .then(response => {
            const responseBody: SignUpResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response.data) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });
    return result;
}

const GET_SIGN_IN_USER_URL = () => `${API_DOMAIN}/users`;
export const getSignInUserRequest = async (accessToken: string) => {
    const result = await axios.get(GET_SIGN_IN_USER_URL(), authorization(accessToken))
        .then(response => {
            const responseBody: GetUserResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

// 특정 기록 조회
const GET_DETAIL_RECORD_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}`;
// 전체 기록 조회(최신순 / 홈페이지)
const GET_RECORD_URL = () => `${API_DOMAIN}/records`;
// 기록 생성
const POST_RECORD_URL = () => `${API_DOMAIN}/records`;
// 특정 기록 수정
const PUT_RECORD_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}`;
// 특정 기록 삭제
const DELETE_RECORD_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}`;
// 기록 검색 api
const SEARCH_RECORD_URL = () => `${API_DOMAIN}/records/search`;
// 기록 저장 및 취소 api
const SAVE_RECORD_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}/save`;
// 기록 저장 횟수 조회 api
const SAVE_COUNT_RECORD_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}/save-count`;
// 저장 기록 여부 조회 api
const GET_IS_SAVE_RECORD_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}/save`;

//          function: 기록 저장 요청 API          //
export const saveRecordRequest = async (recordId: number, accessToken: string) => {
    try {
        const result = await axios.post(SAVE_RECORD_URL(recordId), {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        console.log('save result ', result);
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//          function: 기록 저장 취소 요청 API          //
export const saveCancelRecordRequest = async (recordId: number, accessToken: string) => {
    try {
        const result = await axios.delete(SAVE_RECORD_URL(recordId), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        console.log('save result ', result);
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//          function: 기록 저장 카운트 API          //
export const getSaveCountRecordRequest = async (recordId: number, accessToken: string) => {
    try {
        const result = await axios.get(SAVE_COUNT_RECORD_URL(recordId), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        console.log('save count result ', result);
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}

//          function: 기록 저장 여부 조회 API          //
export const getIsSaveRecordRequest = async (recordId: number, accessToken: string) => {
    try {
        const response = await axios.get<GetCheckSavedRecordResponseDto>(
            `${GET_IS_SAVE_RECORD_URL(recordId)}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
                },
            }
        );
        console.log('rr', response);
        return response.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//          function: 특정 기록 조회 요청 API          //
export const getDetailRecordRequest = async (recordId: number) => {
    const result = await axios.get(GET_DETAIL_RECORD_URL(recordId))
        .then(response => {
            const responseBody: GetDetailRecordResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}
//          function: 전체 기록 조회(최신순 / 홈페이지) 요청 API          //
export const getRecordRequest = async (page: number, size: number): Promise<GetRecordResponseDto> => {
    const response = await axios.get<GetRecordResponseDto>(
        `${GET_RECORD_URL()}?page=${page}&size=${size}`,
    );
    return response.data;
};
//          function: 기록 생성 요청 API          //
export const postRecordRequest = async (formData: FormData, accessToken: string) => {
    try {
        const result = await axios.post(POST_RECORD_URL(), formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        console.log('post ', result);
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
};
//          function: 특정 게시물 수정 요청 API          //
export const putRecordRequest = async (recordId: number, formData: FormData, accessToken: string) => {
    try {
        const result = await axios.put(PUT_RECORD_URL(recordId), formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        console.log('put: ', result);
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}

//          function: 특정 기록 삭제 요청 API          //
export const deleteRecordRequest = async (recordId: number, accessToken: string) => {
    try {
        const result = await axios.delete(DELETE_RECORD_URL(recordId), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        console.log('rr', result);
        return result;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}

//          function: 게시물 검색 요청 API(RecordType, Tag, Title을 query param으로 받는다.)          // 
export const getSearchRecordRequest = async (searchRequest: SearchRecordRequestDto, page: number, size: number, accessToken: string): Promise<GetRecordResponseDto> => {
    try {
        // 쿼리 파라미터 생성
        const params = new URLSearchParams();

        // 필수 파라미터
        params.append('page', page.toString());
        params.append('size', size.toString());

        // 선택적 파라미터 추가 (값이 존재할 때만 추가)
        if (searchRequest.recordType) {
            params.append('recordType', searchRequest.recordType);
        }
        if (searchRequest.title) {
            params.append('title', searchRequest.title);
        }
        if (searchRequest.tagNames && searchRequest.tagNames.length > 0) {
            searchRequest.tagNames.forEach(tag => params.append('tagNames', tag));
        }

        const response = await axios.get<GetRecordResponseDto>(
            `${SEARCH_RECORD_URL()}?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
};

// 댓글 작성
const POST_COMMENT_URL = () => `${API_DOMAIN}/comments`;
// 댓글 조회
const GET_COMMENT_URL = (recordId: number) => `${API_DOMAIN}/comments/${recordId}`;
// 대대댓글 조회
const GET_REPLY_URL = (commentId: number) => `${API_DOMAIN}/comments/${commentId}/replies`;
// 댓글 수정
const PUT_COMMENT_URL = (commentId: number) => `${API_DOMAIN}/comments/${commentId}`;
// 댓글 삭제
const DELETE_COMMENT_URL = (commentId: number) => `${API_DOMAIN}/comments/${commentId}`;
// 댓글 좋아요 추가
const ADD_COMMENT_LIKE_URL = (commentId: number) => `${API_DOMAIN}/comments/${commentId}/likes`;
// 댓글 좋아요 삭제
const DELETE_COMMENT_LIKE_URL = (commentId: number) => `${API_DOMAIN}/comments/${commentId}/likes`;
// 댓글 좋아요 카운트
const GET_COMMENT_LIKE_COUNT_URL = (commentId: number) => `${API_DOMAIN}/comments/${commentId}/likes/count`;
// 댓글 좋아요 목록 요청
const GET_COMMENT_LIKE_LIST_URL = (commentId: number) => `${API_DOMAIN}/comments/${commentId}/likes/users`;

//          function: 댓글 작성 요청 API          //
export const postCommentRequest = async (requestBody: PostCommentRequestDto, accessToken: string) => {
    try {
        const response = await axios.post(POST_COMMENT_URL(), requestBody, authorization(accessToken));
        return response.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//          function: 댓글 조회 요청 API  토큰X        //
// export const getCommentRequest = async (recordId: number, page: number, size: number): Promise<GetCommentResponseDto> => {
//     const response = await axios.get<GetCommentResponseDto>(
//         `${GET_COMMENT_URL(recordId)}?page=${page}&size=${size}`
//     );
//     console.log('ddd', response)
//     return response.data;

// };
//          function: 댓글 조회 요청 API  토큰O        //
export const getCommentRequest = async (recordId: number, page: number, size: number, accessToken: string): Promise<GetCommentResponseDto> => {
    try {
        const response = await axios.get<GetCommentResponseDto>(
            `${GET_COMMENT_URL(recordId)}?page=${page}&size=${size}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
};
//          function: 대댓글 조회 요청 API  토큰O        //
export const getReplyRequest = async (commentId: number, page: number, size: number, accessToken: string): Promise<GetCommentResponseDto> => {
    try {
        const response = await axios.get<GetCommentResponseDto>(
            `${GET_REPLY_URL(commentId)}?page=${page}&size=${size}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
                },
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
};
//          function: 댓글 수정 요청 API          //
export const putCommentRequest = async (commentId: number, requestBody: PutCommentRequestDto, accessToken: string) => {
    try {
        const response = await axios.put(PUT_COMMENT_URL(commentId), requestBody, authorization(accessToken));
        return response.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//          function: 댓글 삭제 요청 API          //
export const deleteCommentRequest = async (commentId: number, accessToken: string) => {
    try {
        const response = await axios.delete(DELETE_COMMENT_URL(commentId), authorization(accessToken));
        return response.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//          function: 댓글 좋아요 요청 API  토큰O        //
export const postCommentLikeRequest = async (commentId: number, accessToken: string) => {
    try {
        const response = await axios.post(ADD_COMMENT_LIKE_URL(commentId), {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
            },
        })

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
}
//          function: 댓글 좋아요 삭제 요청 API  토큰O        //
export const deleteCommentLikeRequest = async (commentId: number, accessToken: string) => {
    try {
        const response = await axios.delete(DELETE_COMMENT_LIKE_URL(commentId), {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
            },
        })

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
}
//          function: 댓글 좋아요 목록 요청 API  토큰O        //
export const getCommentLikeListRequest = async (commentId: number, accessToken: string) => {
    try {
        const response = await axios.get<GetCommentLikeListResponseDto>(
            `${GET_COMMENT_LIKE_LIST_URL(commentId)}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
            }
        }
        )
        console.log('get comment Like List API Response:', response); // 응답 전체 확인
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
}
//          function: 댓글 좋아요 개수 요청 API  토큰O        //
export const getCommentLikeCountRequest = async (commentId: number, accessToken: string) => {
    try {
        const response = await axios.get<GetCommentLikeCountResponseDto>(
            `${GET_COMMENT_LIKE_COUNT_URL(commentId)}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
            }
        }
        )
        console.log('get Like Count API Response:', response); // 응답 전체 확인
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }

}

//         게시글 좋아요 추가 API         //
const POST_LIKE_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}/likes`;
//         게시글 좋아요 수 조회 API         //
const GET_LIKE_COUNT_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}/likes`;
//         게시글 좋아요 유저 리스트 조회 API          //
const GET_LIKE_LIST_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}/like-list`;
//         게시글 좋아요 삭제 API          //
const DELETE_LIKE_URL = (recordId: number) => `${API_DOMAIN}/records/${recordId}/likes`;
//         function: 좋아요 추가 API         //
export const postLikeRequest = async (recordId: number, accessToken: string) => {
    try {
        const response = await axios.post(POST_LIKE_URL(recordId), {}, authorization(accessToken))
        console.log('post like request api response', response);
        return response;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
}
//         function: 좋아요 수 조회 API         //
export const getLikeCountRequest = async (recordId: number, accessToken: string) => {
    try {
        const response = await axios.get<GetRecordLikeCountResponseDto>(
            `${GET_LIKE_COUNT_URL(recordId)}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
            }
        }
        )
        console.log('get Like Count API Response:', response); // 응답 전체 확인
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
};
//         function: 좋아요 리스트 조회 API          //
export const getLikeListRequest = async (recordId: number, accessToken: string) => {
    try {
        const response = await axios.get<GetRecordLikeListResponseDto>(
            `${GET_LIKE_LIST_URL(recordId)}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
            }
        }
        )
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
};
//         function: 좋아요 삭제 API          //
export const deleteLikeRequest = async (recordId: number, accessToken: string) => {
    try {
        const response = await axios.delete(DELETE_LIKE_URL(recordId), authorization(accessToken))
        console.log('delete like request api response', response);
        return response;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
}

//         유저 정보 조회 API         //
const GET_USER_URL = () => `${API_DOMAIN}/users`;
//         타유저 정보 조회 API         //
const GET_OTHER_USER_URL = (userId: number) => `${API_DOMAIN}/users/${userId}`;
//         타 유저 게시글 조회 API         //
const GET_OTHER_USER_RECORD_URL = (userId: number) => `${API_DOMAIN}/records/users/${userId}`;
//         회원 탈퇴 API         //
const DELETE_USER_URL = () => `${API_DOMAIN}/users`;
//         유저 정보 수정 API         //
const PATCH_USER_UPDATE_URL = () => `${API_DOMAIN}/users/update`;
//         유저 프로필 이미지 수정 API         //
const PUT_USER_PROFILE_IMAGE_UPDATE_URL = () => `${API_DOMAIN}/users/profile`;
//         유저 게시글 조회 API       //
const GET_USER_RECORD_URL = () => `${API_DOMAIN}/records/users`;
//       유저 저장 기록 목록 조회 api       //   
const GET_SAVE_LIST_RECORD_URL = () => `${API_DOMAIN}/users/save/record-list`;
//       유저 좋아요 기록 목록 조회 api       //
const GET_LIKE_LIST_RECORD_URL = () => `${API_DOMAIN}/records/liked-list`;

//         function: 유저 데이터 조회 API          //
export const getUserRequest = async (accessToken: string) => {
    try {
        const result = await axios.get(GET_USER_URL(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('사용자 정보 추출출 api ', result);
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
};
//         function: 타 유저 데이터 조회 API          //
export const getOtherUserProfileRequest = async (userId: number, accessToken: string) => {
    try {
        const result = await axios.get(GET_OTHER_USER_URL(userId), {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('타 유저 정보 추출출 api ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//         function: 타유저 게시글 조회 API          //
export const getOtherUserRecordRequest = async (userId: number, page: number, size: number, accessToken: string) => {
    try {
        const response = await axios.get<GetUserRecordResponseDto>(
            `${GET_OTHER_USER_RECORD_URL(userId)}?page=${page}&size=${size}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
                },
            }
        );
        console.log('타유저 게시글 조회 api 결과:', response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
}

//         function: 프로필 이미지 변경 API          //
export const putUserProfileImageUpdateRequest = async (formData: FormData, accessToken: string) => {
    try {
        const result = await axios.put(PUT_USER_PROFILE_IMAGE_UPDATE_URL(), formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        console.log('프로필 이미지 변경 api ', result);
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//         function: 유저 정보 변경 API          //
export const patchUserUpdateRequest = async (requestBody: patchUserRequestDto, accessToken: string) => {
    try {
        const response = await axios.patch<PatchUserResponseDto>(
            `${PATCH_USER_UPDATE_URL()}`, requestBody, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
            }
        }
        )
        return response.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
};
//         function: 유저 게시글 조회 API          //
export const getUserRecordRequest = async (page: number, size: number, accessToken: string) => {
    try {
        const response = await axios.get<GetUserRecordResponseDto>(
            `${GET_USER_RECORD_URL()}?page=${page}&size=${size}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
                },
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Axios 에러라면 response 데이터 확인
            console.error('Error fetching comments:', error.response?.data || error.message);
        } else {
            // 일반적인 에러 메시지 출력
            console.error('Unknown error:', error);
        }
        throw error;
    }
}

//          function: 유저 저장 기록 목록 조회 API          //
export const getSaveListRecordRequest = async (page: number, size: number, accessToken: string) => {
    try {
        const result = await axios.get<GetUserRecordResponseDto>(
            `${GET_SAVE_LIST_RECORD_URL()}?page=${page}&size=${size}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
                },
            }
        );
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//          function: 유저 좋아요 기록 목록 조회 API          //
export const getLikeListRecordRequest = async (page: number, size: number, accessToken: string) => {
    try {
        const result = await axios.get<GetUserRecordResponseDto>(
            `${GET_LIKE_LIST_RECORD_URL()}?page=${page}&size=${size}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
                },
            }
        );
        return result.data;
    } catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//  알림 리스트 조회 API(실시간X / 매 요청마다 알림을 조회)   //
const GET_AlARM_LIST_URL = () => `${API_DOMAIN}/notification`;
//  해당 알림 읽음 처리 API    //
const PATCH_READ_ALARM_URL = (notificationId: number) => `${API_DOMAIN}/notification/${notificationId}/read`;
//  모든 알림 읽음 처리 API    //
const PATCH_READ_ALL_ALARM_URL = () => `${API_DOMAIN}/notification/read`;
//  해당 알림 삭제 처리 API    //
const DELETE_ALARM_URL = (notificationId: number) => `${API_DOMAIN}/notification/${notificationId}/delete`;
//  읽은 알림 모두 삭제 처리 API    //
const DELETE_ALL_ALARM_URL = () => `${API_DOMAIN}/notification/unread/delete`;
//  읽지 않은 알림 수 조회 API    //
const GET_UNREAD_ALARM_COUNT_URL = () => `${API_DOMAIN}/notification/unread/count`;

//         function: 알람 리스트 조회 API          //
export const getAlarmListRequest = async (accessToken: string) => {
    try {
        const result = await axios.get<AlarmResponseDto>(
            `${GET_AlARM_LIST_URL()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });
        console.log('알람 리스트 조회 api ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//         function: 해당 알람 읽음 처리 API          //
export const patchReadAlarmRequest = async (notificationId: number, accessToken: string) => {
    try {
        const result = await axios.patch<AlarmResponseDto>(`${PATCH_READ_ALARM_URL(notificationId)}`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('해당 알람 읽음 처리 api ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//         function: 모든 알람 읽음 처리 API          //
export const patchReadAllAlarmRequest = async (accessToken: string) => {
    try {
        const result = await axios.patch<AlarmResponseDto>(`${PATCH_READ_ALL_ALARM_URL()}`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('모든 알람 읽음 처리 api ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }

}
//         function: 해당 알람 삭제 처리 API          //
export const deleteAlarmRequest = async (notificationId: number, accessToken: string) => {
    try {
        const result = await axios.delete<AlarmResponseDto>(`${DELETE_ALARM_URL(notificationId)}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('해당 알람 삭제 처리 api ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }

}
//         function: 읽은 알람 모두 삭제 처리 API          //
export const deleteAlreadyReadAllAlarmRequest = async (accessToken: string) => {
    try {
        const result = await axios.delete<AlarmResponseDto>(`${DELETE_ALL_ALARM_URL()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('읽은 알람 모두 삭제 처리 api ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }

}
//         function: 읽지 않은 알림 수 카운트 API          //
export const getUnreadAlarmCountRequest = async (accessToken: string) => {
    try {
        const result = await axios.get<AlarmResponseDto>(`${GET_UNREAD_ALARM_COUNT_URL()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('읽지 않은 알림 수 카운트 api ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}
//  전체 태그 통계 조회 API   //
const GET_All_TAG_RATIO_URL = () => `${API_DOMAIN}/tags/all`;
//  전체 태그 통계 조회 API   //
const GET_USER_TAG_RATIO_URL = () => `${API_DOMAIN}/tags`;

export const getAllTagRatioRequest = async (accessToken: string) => {
    try {
        const result = await axios.get<GetTagRatioResponseDto>(`${GET_All_TAG_RATIO_URL()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('전체 태그 통계 조회 API 요청 ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}


export const getUserTagRatioRequest = async (accessToken: string) => {
    try {
        const result = await axios.get<GetTagRatioResponseDto>(`${GET_USER_TAG_RATIO_URL()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
        console.log('유저저 태그 통계 조회 API 요청 ', result);
        return result.data;
    }
    catch (error: unknown) {
        // error가 AxiosError인지 확인하고 안전하게 접근
        if (axios.isAxiosError(error)) {
            if (!error.response) return null;
            return error.response.data;
        } else {
            // AxiosError가 아닌 경우 처리
            console.error('An unexpected error occurred:', error);
            return null;
        }
    }
}