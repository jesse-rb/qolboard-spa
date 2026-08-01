import { Link, Outlet } from "react-router";
import type { TypeAuthService } from "../../services/auth/types";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import AboutModal from "./modals/AboutModal";
import { useStateModal } from "../../components/Modal";
import { useEffect, useRef, useState } from "react";
import RegisterModal from "./modals/RegisterModal";
import { useAuth } from "../../context_providers/AuthProvider";
import type { TypeError } from "../../services/api_service/types";
import ErrorsModal from "./modals/ErrorsModal";

type TypeProps = {
    authService: TypeAuthService;
};

function Layout({ authService }: TypeProps) {
    const aboutModal = useStateModal(false);
    const registerModal = useStateModal(false);
    const errorsModal = useStateModal(false);
    const headerDivRef = useRef<HTMLDivElement>(null);
    const [errors, setErrors] = useState<TypeError[]>([]);
    const [logoutIsLoading, setLogoutIsLoading] = useState(false);
    const { auth } = useAuth();

    const resizeObserver = useRef(
        new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Handle header height resize
                if (
                    headerDivRef.current &&
                    entry.target === headerDivRef.current
                ) {
                    document.body.style.setProperty(
                        "--header-height",
                        `${entry.contentRect.height}px`,
                    );
                }
            }
        }),
    );

    // Observe resizes
    useEffect(() => {
        headerDivRef.current &&
            resizeObserver.current.observe(headerDivRef.current);
        return () => {
            headerDivRef.current &&
                resizeObserver.current.unobserve(headerDivRef.current);
        };
    }, [headerDivRef.current]);

    // Clear errors when errors modal closes
    useEffect(() => {
        errorsModal.isOpen || setErrors([]);
    }, [errorsModal.isOpen]);

    async function handleClickLogout() {
        setLogoutIsLoading(true);
        const resp = await authService.logout();
        setErrors(resp.errors);
        if (resp.errors.length > 0) {
            errorsModal.open();
        }
        setLogoutIsLoading(false);
    }

    return (
        <>
            <div
                ref={headerDivRef}
                className="text-lg bg-back-2 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4"
            >
                <div className="flex items-center gap-4">
                    <Link to="/" className="h-full flex items-center">
                        <img src="/qolboard.svg" className="min-w-8" />
                    </Link>
                    <Button className="grow" onClick={aboutModal.open}>
                        <Icon iconName="info" />
                        About
                    </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {auth.isAuthenticated ? (
                        <>
                            <p>{auth.user?.email}</p>
                            <Button onClick={handleClickLogout}>
                                {logoutIsLoading ? (
                                    <Icon
                                        iconName="refresh"
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Icon iconName="logout" />
                                )}{" "}
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={registerModal.open}>
                                <Icon iconName="person" />
                                Register
                            </Button>
                        </>
                    )}

                    {/* <p> */}
                    {/*     isAuthenticated:{" "} */}
                    {/*     {auth.isAuthenticated ? "true" : "false"} */}
                    {/* </p> */}
                    {/* <p>email: {auth.user?.email}</p> */}
                    {/* <Button onClick={handleRequestOTP}>request otp</Button> */}
                </div>
            </div>

            <RegisterModal authService={authService} {...registerModal} />
            <AboutModal {...aboutModal} />
            <ErrorsModal errors={errors} {...errorsModal} />

            <Outlet />
        </>
    );
}

export default Layout;
