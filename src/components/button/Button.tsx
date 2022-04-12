import './Button.css';

function Button(props: {label: String, callback: Function}) {
    let toRender = (
        <button className='button' onClick={ () => props.callback() }>{ props.label }</button>
    );
    return toRender;
}

export default Button;