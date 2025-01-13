export enum ResponseCode {
    // Comment
    COMMENT_CREATE_SUCCESS = "C001", // 댓글 생성 성공
    COMMENT_GET_SUCCESS = "C002",    // 댓글 조회 성공
    COMMENT_DELETE_SUCCESS = "C003", // 댓글 삭제 성공
    COMMENT_UPDATE_SUCCESS = "C004", // 댓글 수정 성공
    COMMENT_lIKE_COUNT_GET_SUCCESS = "CL01", // 댓글 수정 성공
    // Record
    RECORD_CREATE_SUCCESS = "R001",   // 기록 생성 성공
    RECORD_DELETE_SUCCESS = "R002",   // 기록 삭제 성공
    DETAIL_RECORD_GET_SUCCESS = "R003", // 개별 기록 조회 성공
    RECORD_PAGING_GET_SUCCESS = "R004", // 페이징된 전체 기록 조회 성공
    RECORD_MODIFY_SUCCESS = "R005",   // 기록 수정 성공
    RECORD_SEARCH_SUCCESS = "R006",   // 기록 검색 성공
    GET_USER_RECORDS_SUCCESS = "R009", // 유저 전체 게시물 조회 성공

    // User
    USER_CREATE_SUCCESS = "U001", // 유저 생성 성공
    USER_GET_SUCCESS = "U002",    // 유저 조회 성공
    USER_DELETE_SUCCESS = "U003", // 유저 삭제 성공
    USER_UPDATE_SUCCESS = "U004", // 유저정보 수정 성공
    USER_OAUTH_SIGNUP_SUCCESS = "U005", // 소셜 로그인 유저 회원가입 성공
    USER_LOGIN_FAIL = "U006",           // 로그인 실패
    USER_PROFILE_IMAGE_UPDATE_SUCCESS = "U007", // 프로필 사진 업데이트 성공

    // Record Save
    RECORD_SAVE_POST_SUCCESS = "RS02", // 기록 저장 성공
    RECORD_SAVE_DELETE_SUCCESS = "RS03", // 기록 저장 삭제 성공
    RECORD_SAVE_COUNT_GET_SUCCESS = "RS01", // 기록 저장 개수 조회 성공
    RECORD_SAVE_LIST_GET_SUCCESS = "RS04",  // 저장한 기록 목록 조회 성공

    // Record Like
    RECORD_LIKE_COUNT_GET_SUCCESS = "RL01", // 기록 좋아요 개수 조회 성공
    RECORD_LIKE_POST_SUCCESS = "RL02",      // 기록 좋아요 추가 성공
    RECORD_LIKE_DELETE_SUCCESS = "RL03",    // 기록 좋아요 삭제 성공
    RECORD_LIKE_LIST_GET_SUCCESS = "RL04",  // 기록 좋아요 유저 목록 조회 성공

    // Tag
    GET_TAG_STATISTICS_SUCCESS = "T001", // 전체 태그 통계 조회 성공
    GET_USER_TAG_STATISTICS_SUCCESS = "T002", // 유저 태그 통계 조회 성공
}

export default ResponseCode;
