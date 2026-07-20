import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Icon from "../../../components/Icon";
import type { TypeUseModal } from "../../../components/Modal";
import Modal from "../../../components/Modal";
import type { TypeAuthService } from "../../../services/auth/types";
import Errors from "../../../components/Errors";
import type { TypeError } from "../../../services/api_service/types";

type TypeProps = TypeUseModal & {
    authService: TypeAuthService;
};

function RegisterModal(props: TypeProps) {
    const [email, setEmail] = useState("");
    const [registerIsLoading, setRegisterIsLoading] = useState(false);
    const [errors, setErrors] = useState<TypeError[]>([]);

    useEffect(() => {
        // Clear errors when modal is closed
        props.isOpen || setErrors([]);
    }, [props.isOpen]);

    async function handleClickRegister() {
        setRegisterIsLoading(true);
        const resp = await props.authService.register(email);
        setErrors(resp.errors);
        setRegisterIsLoading(false);
    }

    return (
        <>
            <Modal isOpen={props.isOpen} close={props.close}>
                <h2>Register</h2>
                <div className="flex flex-col">
                    <div id="field.email">
                        <input
                            className="w-full"
                            id="email"
                            type="email"
                            placeholder="Email"
                            defaultValue={email}
                            onChange={(e) => setEmail(e.target.value)}
                        ></input>
                    </div>

                    <Errors errors={errors} shouldUsePortal={true} />

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
