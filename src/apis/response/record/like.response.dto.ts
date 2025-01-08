import ResponseDto from '../Response.dto';
//          interface: 좋아요 수 조회 응답 DTO         //
export interface GetRecordLikeCountResponseDto extends ResponseDto {
    data: {
        count: number;
    };
}

//          interface: 좋아요한 유저 목록 응답 DTO      //
export interface GetRecordLikeListResponseDto extends ResponseDto {
    data: {
        likeList: {
            userName: string;
            profileImage: string | null;
        }[];
    };
}