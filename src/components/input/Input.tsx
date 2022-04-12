import React from 'react';
import { ReactNode } from 'react';
import './Input.css';

function Input(props: {label: string, children: ReactNode}) {
    let children = React.Children.toArray(props.children);
    let elementProps = children.map((c: any) => c.props)[0]; // TODO: figure out how TS works.
    console.log(elementProps);
    let toRender = (
        <div className='input'>
            <label htmlFor={elementProps.id}>{props.label}</label>
            {props.children}
        </div>
    );
    return toRender;
}

export default Input;