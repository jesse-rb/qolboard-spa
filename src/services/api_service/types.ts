export type TypeAPIService = {
    request: (
        method: TypeHttpMethods,
        path: string,
        requestBody?: object | null,
        allowRefresh?: boolean,
    ) => Promise<Response | null>;
};

export type TypeHttpMethods = "GET" | "POST" | "PUT" | "DELETE";

export type Error = {
    message: string;
    field: string;
    value: any;
};

export type TypeShowResponse<T> = {
    data: T;
    errors: Array<Error>;
};

export type TypeIndexResponse<T> = {
    data: Array<T>;
    errors: Array<Error>;
};
