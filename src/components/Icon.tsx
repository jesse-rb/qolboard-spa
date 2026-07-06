type TypeProps = {
    iconName: string;
};

function Icon({ iconName }: TypeProps) {
    return (
        <>
            <span className="material-icons">{iconName}</span>
        </>
    );
}

export default Icon;
