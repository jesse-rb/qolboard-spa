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

    function handleAnimationEnd(i: number) {
        setShouldRender([
            ...shouldRender.slice(0, i),
            ...shouldRender.slice(i + 1),
        ]);
    }

    if (shouldRender.length > 0) {
        return (
            <>
                {shouldRender.map((v, i) => {
                    const shouldRemove =
                        errors.filter((v2) => compareErrors(v, v2)).length <= 0;
                    const portalElem = document.getElementById(
                        `field.${v.field}`,
                    );
                    const elem = (
                        <p
                            key={v.message + v.field + v.value}
                            className={`text-red-400 text-sm ${!shouldRemove ? "animate-slide-in" : "animate-slide-out"}`}
                            onAnimationEnd={() =>
                                shouldRemove && handleAnimationEnd(i)
                            }
                        >
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
