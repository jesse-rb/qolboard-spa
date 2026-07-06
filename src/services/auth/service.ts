import type { TypeAPIService, TypeShowResponse } from "../api_service/types";
import type { TypeAuthService, TypeUser } from "./types";

function CreateAuthService(apiService: TypeAPIService): TypeAuthService {
    const requestOTP = async (email: string): Promise<TypeUser | null> => {
        const response = await apiService.request("POST", "auth/request_otp", {
            email: email,
        });

        if (response?.status === 200) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body.data;
        }

        return null;
    };

    const login = async (otp: string): Promise<TypeUser | null> => {
        const response = await apiService.request("POST", "auth/login", {
            otp: otp,
        });

        if (response?.status === 200) {
            const body: TypeShowResponse<TypeUser> = await response.json();
            return body.data;
        }

        return null;
    };

    const logout = async (): Promise<void> => {
        const response = await apiService.request("POST", "user/logout");

        if (response?.status === 200) {
            // const body: TypeShowResponse<TypeUser> = await response.json()
        }
    };

    return { requestOTP, login, logout };
}

export default CreateAuthService;
