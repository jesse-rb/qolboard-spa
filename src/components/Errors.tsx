import { createPortal } from "react-dom";
import type { TypeError } from "../services/api_service/types";
import { useEffect, useState } from "react";
import { compareErrors } from "../services/api_service/utils";

type TypeProps = {
    errors: TypeError[];
    shouldUsePortal: boolean;
};

function Errors({ errors, shouldUsePortal }: TypeProps) {
    const [shouldRender, setShouldRender] = useState(errors);

    useEffect(() => {
        setShouldRender([
            ...shouldRender,
            ...errors.filter(
                (item) =>
                    shouldRender.filter((v) => compareErrors(item, v)).length <=
                    0,
            ),
        ]);
    }, [errors]);

    function handleAnimationEnd() {
        setShouldRender(errors);
    }

    if (shouldRender.length > 0) {
        return (
            <>
                {shouldRender.map((v) => {
                    const key = v.message + v.field + v.value;
                    const shouldRemove =
                        errors.filter((v_) => compareErrors(v, v_)).length <= 0;
                    const portalElem = document.getElementById(
                        `field.${v.field}`,
                    );
                    const elem = (
                        <p
                            key={key}
                            className={`text-red-400 text-sm ${!shouldRemove ? "animate-slide-in" : "animate-slide-out"}`}
                            onAnimationEnd={() =>
                                shouldRemove && handleAnimationEnd()
                            }
                        >
                            {v.message}
                        </p>
                    );

                    return shouldUsePortal && portalElem != null
                        ? createPortal(elem, portalElem, key)
                        : elem;
                })}
            </>
        );
    }
}

export default Errors;
