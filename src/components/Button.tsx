type TypeProps = {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
    className?: string;
};

function Button({ onClick, children, className }: TypeProps) {
    return (
        <>
            <button
                className={`hover:animate-hover active:animate-click p-2.5 bg-back-3 rounded-md inline-flex gap-2 items-center${className && " " + className}`}
                onClick={onClick}
            >
                {children}
            </button>
        </>
    );
}

export default Button;
