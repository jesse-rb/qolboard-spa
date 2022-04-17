import Input from '../../input/Input';
import Form from '../../form/Form';
import Button from '../../button/Button';

function Register() {
    let toReturn = (
        <Form>
            <Input label='Display Name'>
                <input type='text' id='name' placeholder='e.g. John'/>
            </Input>

            <Input label='Email'>
                <input type='text' id='email' placeholder='e.g. john@gmail.com'/>
            </Input>

            <Input label='Password'>
                <input type='password' id='password' placeholder='e.g. supersecretpassword'/>
            </Input>

            <Input label='Confirm Password'>
                <input type='password' id='password-confirm' placeholder='e.g. supersecretpassword'/>
            </Input>

            <Button label='Register' callback={ () => alert('Hello') }></Button>
        </Form>
    );
    return toReturn;
}

export default Register;