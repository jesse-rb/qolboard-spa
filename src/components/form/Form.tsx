import { ReactNode } from 'react';
import './Form.css';

function Form(props: {children: ReactNode}) {
    return (
        <div className='form'>
            { props.children }
        </div>
    )
}

export default Form;