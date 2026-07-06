import { Link, Outlet } from "react-router";
import { useAuth } from "../../context_providers/AuthProvider";
import type { TypeAuthService } from "../../services/auth/types";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import AboutModal from "./modals/AboutModal";
import { useStateModal } from "../../components/Modal";

type TypeProps = {
    authService: TypeAuthService;
};

function Layout({ authService }: TypeProps) {
    const { auth, setAuth } = useAuth();
    const aboutModal = useStateModal(false);

    /*
     * TODO: temporary placeholder to demonstrate useAuth(), should be moved to it's own auth related components
     * */
    async function handleRequestOTP() {
        const user = await authService.requestOTP(
            "jesse.reynekebarnard@gmail.com",
        );
        if (user !== null) {
            setAuth((v) => ({
                ...v,
                isAuthenticated: true,
                user: user,
            }));
        }
    }

    return (
        <>
            <div className="bg-back-2 min-h-(--header-height) w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link to="/" className="pl-4 h-full flex items-center">
                        <img src="/qolboard.svg" className="min-w-8" />
                    </Link>
                    <Button className="grow" onClick={aboutModal.open}>
                        <Icon iconName="info" />
                        About
                    </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <p>
                        isAuthenticated:{" "}
                        {auth.isAuthenticated ? "true" : "false"}
                    </p>
                    <p>email: {auth.user?.email}</p>
                    <Button onClick={handleRequestOTP}>request otp</Button>
                </div>
            </div>

            <AboutModal {...aboutModal} />

            <Outlet />
        </>
    );
}

export default Layout;
