import type { TypeError } from "./types";

export function compareErrors(v1: TypeError, v2: TypeError) {
    return (
        v1.value === v2.value &&
        v1.field === v2.field &&
        v1.message === v2.message
    );
}
