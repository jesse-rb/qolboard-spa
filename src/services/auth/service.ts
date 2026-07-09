import type { TypeAPIService, TypeShowResponse } from "../api_service/types";
import type { TypeAuthService, TypeUser } from "./types";

function defaultResponse(): TypeShowResponse<TypeUser> {
    return {
        data: {
            email: "",
        },
        errors: [
            {
                field: "",
                message: "Sorry, something went wrong.",
                value: "",
            },
        ],
    };
}

function CreateAuthService(apiService: TypeAPIService): TypeAuthService {
    const register = async (
        email: string,
    ): Promise<TypeShowResponse<TypeUser>> => {
        const response = await apiService.request("POST", "auth/register", {
            email: email,
        });
        console.log(response);

        if (response != null) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body;
        }
        return defaultResponse();
    };

    const requestOTP = async (
        email: string,
    ): Promise<TypeShowResponse<TypeUser>> => {
        const response = await apiService.request("POST", "auth/request_otp", {
            email: email,
        });

        if (response != null) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body;
        }

        return defaultResponse();
    };

    const login = async (otp: string): Promise<TypeShowResponse<TypeUser>> => {
        const response = await apiService.request("POST", "auth/login", {
            otp: otp,
        });

        if (response != null) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body;
        }

        return defaultResponse();
    };

    const logout = async (): Promise<TypeShowResponse<TypeUser>> => {
        const response = await apiService.request("POST", "user/logout");

        if (response != null) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body;
        }

        return defaultResponse();
    };

    const user = async (): Promise<TypeShowResponse<TypeUser>> => {
        const response = await apiService.request("GET", "user");
        if (response != null) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body;
        }

        return defaultResponse();
    };

    return { register, requestOTP, login, logout, user };
}

export default CreateAuthService;
