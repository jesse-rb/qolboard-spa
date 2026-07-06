import Icon from "../../../components/Icon";
import Modal, { type TypeUseModal } from "../../../components/Modal";

function AboutModal(props: TypeUseModal) {
    return (
        <>
            <Modal isOpen={props.isOpen} close={props.close}>
                <h2>About</h2>
                {/* Open beta */}
                <h3 className="flex items-center gap-2">
                    <Icon iconName="science" />
                    <span>Open Beta</span>
                </h3>
                <p>
                    Please note that qolboard is in a <em>beta</em> stage of
                    development and is only a side project. Therefore please
                    bear with us while it is possible for breaking changes to
                    occur occasionally that could affect existing canvases, or
                    erase ALL data.
                </p>

                {/* Attributions */}
                <h3 className="flex items-center gap-2">
                    <Icon iconName="attribution" />
                    <span>Attributions</span>
                </h3>
                <ul>
                    <li>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://go.dev/"
                        >
                            Golang
                        </a>
                    </li>
                    <li>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://react.dev/"
                        >
                            React
                        </a>
                    </li>
                    <li>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://fonts.google.com/icons"
                        >
                            Google material design icons
                        </a>
                    </li>
                </ul>

                {/* Github */}
                <h3 className="flex items-center gap-2">
                    <Icon iconName="code" />
                    <span>Github</span>
                </h3>
                <a
                    href="https://github.com/jesse-rb"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    github.com/jesse-rb
                </a>
            </Modal>
        </>
    );
}

export default AboutModal;
