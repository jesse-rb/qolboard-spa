import { useState } from "react";
import Button from "../../../components/Button";
import Icon from "../../../components/Icon";
import type { TypeUseModal } from "../../../components/Modal";
import Modal from "../../../components/Modal";
import type { TypeAuthService } from "../../../services/auth/types";

type TypeProps = TypeUseModal & {
    authService: TypeAuthService;
};

function RegisterModal(props: TypeProps) {
    const [email, setEmail] = useState("");
    const [registerIsLoading, setRegisterIsLoading] = useState(false);

    async function handleClickRegister() {
        setRegisterIsLoading(true);
        try {
            const user = await props.authService.register(email);
        } finally {
            setRegisterIsLoading(false);
        }
    }

    return (
        <>
            <Modal isOpen={props.isOpen} close={props.close}>
                <h2>Register</h2>
                <div className="flex flex-col">
                    <input
                        type="email"
                        placeholder="Email"
                        defaultValue={email}
                        onChange={(e) => setEmail(e.target.value)}
                    ></input>

                    <p>
                        We will send an email verification link via your email.
                    </p>
                    <Button onClick={handleClickRegister}>
                        {registerIsLoading ? (
                            <Icon iconName="sync" className="animate-spin" />
                        ) : (
                            <Icon iconName="mail" />
                        )}
                        Register
                    </Button>
                </div>
            </Modal>
        </>
    );
}

export default RegisterModal;
