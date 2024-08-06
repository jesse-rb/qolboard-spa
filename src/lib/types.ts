export type Model = {
    id: number
    createdAt: string
    updatedAt: string
    deletedAt: string|null
}

export type Error = {
    message: string
    field: string
    value: any
}