import {
    createContext,
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";
import type { TypeAuthService, TypeUser } from "../services/auth/types";

type TypeUseAuth = {
    isAuthenticated: boolean;
    user: TypeUser | null;
};

type TypeProps = {
    children: ReactNode;
    authService: TypeAuthService;
};

type TypeAuthContext = {
    auth: TypeUseAuth;
    setAuth: Dispatch<SetStateAction<TypeUseAuth>>;
};

export const AuthContext = createContext<TypeAuthContext | undefined>(
    undefined,
);

function AuthProvider({ children, authService }: TypeProps) {
    const [auth, setAuth] = useState<TypeUseAuth>({
        isAuthenticated: false,
        user: null,
    });

    useEffect(() => {
        if (!auth.isAuthenticated) {
            (async () => {
                const user = await authService.user();
                if (user !== null) {
                    setAuth({
                        isAuthenticated: true,
                        user: user,
                    });
                }
            })();
        }
    }, []);

    return (
        <>
            <AuthContext value={{ auth, setAuth }}>{children}</AuthContext>
        </>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within a AuthProvider");
    }

    return context;
}

export default AuthProvider;
