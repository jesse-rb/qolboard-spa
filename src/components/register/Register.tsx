import React from 'react';

function Register() {
    return (
        <div className='form'>
            <label htmlFor='name'>Display Name</label>
            <input type='text' id='name' placeholder='John'/>

            <label htmlFor='email'>Email</label>
            <input type='text' id='email' placeholder='john@gmail.com'/>

            <label htmlFor='password'></label>
            <input type='password' id='password' placeholder='secretpassword'/>
        </div>
    );
}

export default Register;