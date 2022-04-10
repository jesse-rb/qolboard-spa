import React from 'react';
import { ReactNode } from 'react';
import './Input.css';

function Input(props: {label: string, children: ReactNode}) {
    let children = React.Children.toArray(props.children);
    children.map((c: any) => console.log(c.props)); // TODO: figure out how TS works.
    let toRender = (
        <label htmlFor=''></label>
    );
    return toRender;
}

export default Input;