import type { TypeAPIService, TypeShowResponse } from "../api_service/types";
import type { TypeAuthService, TypeUser } from "./types";

function defaultResponse(): TypeShowResponse<TypeUser> {
    return {
        data: {
            email: "",
        },
        errors: [],
    };
}

function CreateAuthService(apiService: TypeAPIService): TypeAuthService {
    const register = async (
        email: string,
    ): Promise<TypeShowResponse<TypeUser>> => {
        const response = await apiService.request("POST", "auth/register", {
            email: email,
        });

        if (response !== null) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body;
        } else {
            return defaultResponse();
        }
    };

    const requestOTP = async (email: string): Promise<TypeUser | null> => {
        const response = await apiService.request("POST", "auth/request_otp", {
            email: email,
        });

        if (response?.ok) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body.data;
        }

        return defaultResponse();
    };

    const login = async (otp: string): Promise<TypeUser | null> => {
        const response = await apiService.request("POST", "auth/login", {
            otp: otp,
        });

        if (response?.ok) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body.data;
        }

        return null;
    };

    const logout = async (): Promise<void> => {
        const response = await apiService.request("POST", "user/logout");

        if (response?.ok) {
            // const body: TypeShowResponse<TypeUser> = await response.json()
        }
    };

    const user = async (): Promise<TypeUser | null> => {
        const response = await apiService.request("GET", "user");
        if (response?.ok) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body.data;
        }
        return null;
    };

    return { register, requestOTP, login, logout, user };
}

export default CreateAuthService;
