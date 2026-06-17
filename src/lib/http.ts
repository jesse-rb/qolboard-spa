import { goto } from "$app/navigation";
import { appStore } from "./store";

export type TypeHttpMethods = "GET" | "POST" | "PUT" | "DELETE";

export function getApiHost(): string {
    return import.meta.env.VITE_API_HOST;
}

export async function request(method: TypeHttpMethods, path: string, requestBody: object | null = null, allowRefresh: boolean = true): Promise<Response> {
    const apiHost = getApiHost();
    const url = `${apiHost}/${path}`;
    const resp = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {
            "content-type": "application/json",
        },
        body: requestBody ? JSON.stringify(requestBody) : null
    });
    if (resp.status == 429) {
        goto("/error?status=429");
    }
    if (resp.status == 401) {
        if (allowRefresh) {
            const refreshResp = await request("POST", "auth/refresh", null, false)
            if (refreshResp.status === 200) {
                // Only if refresh was successful, attempt to replay request (another refresh attempt will not be allowed)
                const resp = request(method, path, requestBody, false)
                return resp
            }
        }

        // If refresh was unsuccessful, update state to report a logged out state
        appStore.update((store) => {
            store.checkedIsAuthenticated = true;
            store.isAuthenticated = false;
            store.user.email = "";
            store.user.id = "";

            return store;
        });
    }

    return resp
}
