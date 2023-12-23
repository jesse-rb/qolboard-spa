export type PieceSettings = {
    size: number
    color: string
    resX: number
    resY: number
};

export type Serialized = {
    settings: PieceSettings
    path: string
    move: string
    pan: string
    leftMost: number
    rightMost: number
    topMost: number
    bottomMost: number
};