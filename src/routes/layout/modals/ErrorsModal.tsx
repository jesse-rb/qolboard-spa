import Errors from "../../../components/Errors";
import Modal, { type TypeUseModal } from "../../../components/Modal";
import type { TypeError } from "../../../services/api_service/types";

type TypeProps = {
    errors: TypeError[];
} & TypeUseModal;

function ErrorsModal({ errors, isOpen, close }: TypeProps) {
    return (
        <>
            <Modal isOpen={isOpen} close={close}>
                <h2>Error</h2>
                <Errors errors={errors} shouldUsePortal={false} />
            </Modal>
        </>
    );
}

export default ErrorsModal;
