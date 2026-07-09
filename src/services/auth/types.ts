import type { TypeShowResponse } from "../api_service/types";
import type { Model } from "../common/types";

export type TypeAuthService = {
    register: (email: string) => Promise<TypeShowResponse<TypeUser>>;
    requestOTP: (email: string) => Promise<TypeShowResponse<TypeUser>>;
    login: (otp: string) => Promise<TypeShowResponse<TypeUser>>;
    logout: () => Promise<TypeShowResponse<TypeUser>>;
    user: () => Promise<TypeShowResponse<TypeUser>>;
};

export type TypeUser = Model & {
    email: string;
};
