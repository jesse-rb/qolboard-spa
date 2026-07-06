import { useCallback, useEffect, useState, type ReactNode } from "react";
import Button from "./Button";
import Icon from "./Icon";

export type TypeProps = {
    isOpen: boolean;
    close: () => void;
    children: ReactNode;
};

export type TypeUseModal = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

export function useStateModal(initialState = false): TypeUseModal {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return { isOpen, open, close, toggle };
}

function Modal({ children, isOpen, close }: TypeProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        }
    }, [isOpen]);

    function handleAnimationEnd() {
        console.log("handleTransitionEnd");
        if (!isOpen) {
            setShouldRender(false);
        }
    }

    if (!shouldRender) {
        return null;
    }

    return (
        <>
            <div
                className={`z-50 absolute inset-0 flex justify-center items-center `}
                onAnimationEnd={handleAnimationEnd}
            >
                <div
                    onClick={close}
                    className={`${isOpen ? "animate-fade-in" : "animate-fade-out"}`}
                >
                    {/* Empty so that opacity does not affect "inner" */}
                    <div className="bg-back-3 opacity-40 z-unset absolute inset-0 "></div>
                </div>
                <div
                    className={`z-10 rounded-md border-t-8 border-b-8 border-back-3 p-4 opacity-100 h-fit w-full sm:w-fit sm:min-w-md bg-back-2 ${isOpen ? "animate-slide-in" : "animate-slide-out"}`}
                >
                    <span className="ml-1 float-right">
                        <Button onClick={close}>
                            <Icon iconName="close"></Icon>
                        </Button>
                    </span>
                    {children}
                </div>
            </div>
        </>
    );
}

export default Modal;
