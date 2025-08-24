export type Model = {
    id?: number
    createdAt?: string
    updatedAt?: string
    deletedAt?: string
}

export type Error = {
    message: string
    field: string
    value: any
}

export type ShowResponse<T> = {
    data: T
    errors: Array<Error>
}

export type IndexResponse<T> = {
    data: Array<T>
    errors: Array<Error>
}
