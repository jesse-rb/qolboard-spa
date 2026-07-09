import { createPortal } from "react-dom";
import type { TypeError } from "../services/api_service/types";

type TypeProps = {
    errors: TypeError[];
    shouldUsePortal: boolean;
};

function Errors({ errors, shouldUsePortal }: TypeProps) {
    if (errors.length > 0) {
        return (
            <>
                {errors.map((v, _) => {
                    const portalElem = document.getElementById(
                        `field.${v.field}`,
                    );
                    const elem = (
                        <p className="text-red-400 text-sm animate-slide-in">
                            {v.message}
                        </p>
                    );

                    return shouldUsePortal && portalElem != null
                        ? createPortal(elem, portalElem)
                        : elem;
                })}
            </>
        );
    }
}

export default Errors;
