import type { TypeHttpMethods, TypeAPIService } from "./types";

function getApiHost(): string {
    return import.meta.env.VITE_API_HOST;
}

function createAPIService(): TypeAPIService {
    const request = async function (
        method: TypeHttpMethods,
        path: string,
        requestBody: object | null = null,
        allowRefresh: boolean = true,
    ): Promise<Response | null> {
        const apiHost = getApiHost();
        const url = `${apiHost}/${path}`;
        try {
            const resp = await fetch(url, {
                method: method,
                credentials: "include",
                headers: {
                    "content-type": "application/json",
                },
                body: requestBody ? JSON.stringify(requestBody) : null,
            });
            if (resp.status == 401) {
                if (allowRefresh) {
                    const refreshResp = await request(
                        "POST",
                        "auth/refresh",
                        null,
                        false,
                    );
                    if (refreshResp?.ok) {
                        // Only if refresh was successful, attempt to replay request (another refresh attempt will not be allowed)
                        const resp = request(method, path, requestBody, false);
                        return resp;
                    }
                }
            }
            if (!resp.ok) {
                window.location.href = `/error?status=${resp.status}`;
                return null;
            }
            return resp;
        } catch (e) {
            window.location.href = "/error?status=500";
            return null;
        }
    };

    return { request };
}

export default createAPIService;
