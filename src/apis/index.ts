import axios from 'axios';
import { ResponseDto } from './response';
import { PostRecordResponseDto, PutRecordResponseDto, DeleteRecordResponseDto, PostCommentResponseDto, GetCommentResponseDto, DeleteCommentResponseDto, GetRecordResponseDto, GetRecordLikeCountResponseDto, GetRecordLikeListResponseDto } from './response/record';
import { PostCommentRequestDto, PutRecordRequestDto, PostRecordRequestDto } from './request/record';
import { SignInRequestDto, SignUpRequestDto } from './request/auth';
import { SignUpResponseDto } from './response/auth';
import GetDetailRecordResponseDto from './response/record/record.response.dto';
import { GetUserResponseDto } from './response/user';

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
        `${GET_RECORD_URL()}?page=${page}&size=${size}`
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
export const putRecord = async (recordId: number, requestBody: PutRecordRequestDto, accessToken: string) => {
    const result = await axios.post(PUT_RECORD_URL(recordId), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PutRecordResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

//          function: 특정 기록 삭제 요청 API          //
export const deleteRecord = async (recordId: number, accessToken: string) => {
    const result = await axios.post(DELETE_RECORD_URL(recordId), authorization(accessToken))
        .then(response => {
            const responseBody: DeleteRecordResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

// 댓글 작성
const POST_COMMENT_URL = () => `${API_DOMAIN}/comments`;
// 댓글 수정
// const PUT_COMMENT_URL = (recordId: number | string, commentId: number | string) => `${API_DOMAIN}/comments/${recordId}`;
// 댓글 조회
const GET_COMMENT_URL = (recordId: number | string) => `${API_DOMAIN}/comments/${recordId}`;
// 댓글 삭제
const DELETE_COMMENT_URL = (recordId: number | string, commentId: number | string) => `${API_DOMAIN}/comments/${recordId}/${commentId}`;

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

//          function: 댓글 수정 요청 API          //
// export const putComment = async (recordId: number | string, commentId: number | string, requestBody: PostCommentRequestDto, accessToken: string) => {
//     const result = await axios.post(PUT_COMMENT_URL(recordId, commentId), requestBody, authorization(accessToken))
//         .then(response => {
//             const responseBody: PostCommentResponseDto = response.data;
//             return responseBody;
//         })
//         .catch(error => {
//             if (!error.response) return null;
//             const responseBody: ResponseDto = error.response.data;
//             return responseBody;
//         })
//     return result;
// }
//          function: 댓글 조회 요청 API          //
export const getCommentRequest = async (recordId: number | string) => {
    const result = await axios.post(GET_COMMENT_URL(recordId))
        .then(response => {
            const responseBody: GetCommentResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}
// //          function: 댓글 삭제 요청 API          //
// export const deleteComment = async (recordId: number | string, commentId: number | string, accessToken: string) => {
//     const result = await axios.post(DELETE_COMMENT_URL(recordId, commentId), authorization(accessToken))
//         .then(response => {
//             const responseBody: DeleteCommentResponseDto = response.data;
//             return responseBody;
//         })
//         .catch(error => {
//             if (!error.response) return null;
//             const responseBody: ResponseDto = error.response.data;
//             return responseBody;
//         })
//     return result;
// }

// // 대댓글 작성
// const POST_REPLY_URL = (recordId: number | string, commentId: number | string) => `${API_DOMAIN}/records/${recordId}/comments/${commentId}/replies`;
// // 대댓글 수정
// const PUT_REPLY_URL = (recordId: number | string, commentId: number | string, replyId: number | string) => `${API_DOMAIN}/records/${recordId}/comments/${commentId}/replies/${replyId}`;

// //          function: 대댓글 작성 요청 API          //
// export const postReply = async (recordId: number | string, commentId: number | string, requestBody: PostCommentRequestDto, accessToken: string) => {
//     const result = await axios.post(POST_REPLY_URL(recordId, commentId), requestBody, authorization(accessToken))
//         .then(response => {
//             const responseBody: PostCommentResponseDto = response.data;
//             return responseBody;
//         })
//         .catch(error => {
//             if (!error.response) return null;
//             const responseBody: ResponseDto = error.response.data;
//             return responseBody;
//         })
//     return result;
// }
// //          function: 대댓글 수정 요청 API          //
// export const putReply = async (recordId: number | string, commentId: number | string, replyId: number | string, requestBody: PostCommentRequestDto, accessToken: string) => {
//     const result = await axios.put(PUT_REPLY_URL(recordId, commentId, replyId), requestBody, authorization(accessToken))
//         .then(response => response.data)
//         .catch(error => {
//             if (!error.response) return null;
//             return error.response.data;
//         });
//     return result;
// };
// 유저 정보 조회

//         좋아요 추가 API         //
const POST_LIKE_URL = (recordId: number | string) => `${API_DOMAIN}/records/${recordId}/likes`;
//         좋아요 수 조회 API         //
const GET_LIKE_COUNT_URL = (recordId: number | string) => `${API_DOMAIN}/records/${recordId}/likes`;
//         좋아요 리스트 조회 API          //
const GET_LIKE_LIST_URL = (recordId: number | string) => `${API_DOMAIN}/records/${recordId}/like-list`;

//         function: 좋아요 추가 API         //
export const postLikeRequest = async (recordId: number | string, accessToken: string) => {
    const result = await axios.put(POST_LIKE_URL(recordId), {}, authorization(accessToken))
        .then(response => {
            const responseBody = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

//         function: 좋아요 수 조회 API         //
export const getLikeCountRequest = async (recordId: number | string) => {
    const result = await axios.get(GET_LIKE_COUNT_URL(recordId)) // GET 요청 URL
        .then(response => {
            const responseBody: GetRecordLikeCountResponseDto = response.data; // 응답 DTO 타입 지정
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data; // 오류 응답 처리
            return responseBody;
        });
    return result;
};

//         function: 좋아요 리스트 조회 API          //
export const getLikeListRequest = async (recordId: number | string) => {
    const result = await axios.get(GET_LIKE_LIST_URL(recordId)) // GET 요청 URL
        .then(response => {
            const responseBody: GetRecordLikeListResponseDto = response.data; // 응답 DTO 타입 지정
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data; // 오류 처리
            return responseBody;
        });
    return result;
};


const GET_USER_URL = () => `${API_DOMAIN}/users/`;

export const getUserRequest = async (accessToken: string) => {
    const result = await axios
        .get(GET_USER_URL(), {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
            const responseBody: GetUserResponseDto = response.data;
            return responseBody;
        })
        .catch((error) => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });

    return result;
};