import {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";
import type { TypeUser } from "../services/auth/types";

type TypeUseAuth = {
    isAuthenticated: boolean;
    user: TypeUser | null;
};

type TypeProps = {
    children: ReactNode;
};

type TypeAuthContext = {
    auth: TypeUseAuth;
    setAuth: Dispatch<SetStateAction<TypeUseAuth>>;
};

export const AuthContext = createContext<TypeAuthContext | undefined>(
    undefined,
);

function AuthProvider({ children }: TypeProps) {
    const [auth, setAuth] = useState<TypeUseAuth>({
        isAuthenticated: false,
        user: null,
    });
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
