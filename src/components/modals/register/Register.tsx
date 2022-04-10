import React from 'react';
import './Register.css';
import Input from '../../input/Input';

function Register() {
    return (
        <div className='form'>
            <Input label='This is test'><input type='text' id='test' placeholder='Test'/></Input>
            <label htmlFor='name'>Display Name</label>
            <input type='text' id='name' placeholder='John'/>

            <label htmlFor='email'>Email</label>
            <input type='text' id='email' placeholder='john@gmail.com'/>

            <label htmlFor='password'>Password</label>
            <input type='password' id='password' placeholder='secretpassword'/>
        </div>
    );
}

export default Register;