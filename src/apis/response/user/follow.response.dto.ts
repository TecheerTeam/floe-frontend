import { User } from "@/types/interface";
import ResponseDto from "../Response.dto";

export interface UserFollowCountResponseDto extends ResponseDto {
    data: {
        followerCount: number;
        followingCount: number;
    };
}
export interface UserFollowStatusResponseDto extends ResponseDto {
    data: {
        isFollowed: boolean;
    };
}

export interface UserFollowerListResponseDto extends ResponseDto, User {
    data: {
        userFollowerList: {}[]
    }
}

export interface UserFollowingListResponseDto extends ResponseDto, User {
    data: {
        userFollowingList: {}[]
    }
}