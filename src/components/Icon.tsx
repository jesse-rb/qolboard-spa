type TypeProps = {
    className?: string;
    iconName: string;
};

function Icon({ className, iconName }: TypeProps) {
    return (
        <>
            <span className={`material-icons ${className}`}>{iconName}</span>
        </>
    );
}

export default Icon;
