import Button from "../../button/Button";
import Form from "../../form/Form";
import Input from "../../input/Input";
import { useDispatch } from 'react-redux';
import { login } from "../../../store/userSlice";

function Login() {
    const dispatch = useDispatch();
    let toReturn = (
        <Form>
            <Input label='Email'>
                <input type='text' id='email' placeholder='e.g. john@gmail.com'/>
            </Input>

            <Input label='Password'>
                <input type='password' id='password' placeholder='e.g. supersecretpassword'/>
            </Input>

            <Button label='Login' callback={ () => dispatch(login()) }></Button>
        </Form>
    );
    return toReturn;
}

export default Login;