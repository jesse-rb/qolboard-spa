import type { Model } from "../common/types";

export type TypeAuthService = {
    requestOTP: (email: string) => Promise<TypeUser | null>;
    login: (otp: string) => Promise<TypeUser | null>;
    logout: () => Promise<void>;
};

export type TypeUser = Model & {
    email: string;
};
