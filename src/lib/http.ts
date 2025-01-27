export type TypeHttpMethods = "GET" | "POST" | "PUT" | "DELETE";

export function getApiHost(): string {
    return import.meta.env.VITE_API_HOST;
}

export async function request(method: TypeHttpMethods, path: string, requestBody: object | null = null): Promise<Response> {
    const apiHost = getApiHost();
    const url = `${apiHost}/${path}`;
    return fetch(url, {
        method: method,
        credentials: "include",
        headers: {
            "content-type": "application/json",
        },
        body: requestBody ? JSON.stringify(requestBody) : null
    });
}
