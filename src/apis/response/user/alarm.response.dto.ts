import ResponseDto from "../Response.dto";

export default interface AlarmResponseDto extends ResponseDto {
    data: {
        notificationList: {
            id: number,
            notificationType: string,
            receiverEmail: string,
            senderEmail: string,
            senderNickname: string
        }[];
    };
}