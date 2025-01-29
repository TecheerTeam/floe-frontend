import ResponseDto from '../Response.dto';
//          interface: 좋아요 수 조회 응답 DTO         //
export default interface GetTagRatioResponseDto extends ResponseDto {
    data: {
        tagName: string;
        count: number;
        ratio: string;
    };
}