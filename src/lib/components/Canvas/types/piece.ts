export type PieceSettings = {
    size: number
    color: string
};

export type PieceSerialized = {
    settings: PieceSettings
    path: string
    move: string
    pan: string
    leftMost: number
    rightMost: number
    topMost: number
    bottomMost: number
};