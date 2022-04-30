<script>
    import { Link } from 'svelte-navigator';
    import Button from '../components/Button.svelte';
    import Modal from '../components/Modal.svelte';

    let loginModal;
    let registerModal;
    let aboutModal;
</script>

<div id="header-layout">
    <Modal bind:this={loginModal} cinema={true}>
        <p>Login modal</p>
    </Modal>
    <Button label="Login" onclick={ () => loginModal.toggle() }/>
    <Button label="Register" />
    <Button label="About" />
    <h1>welcome to qolboard 2.0</h1>
</div>

<style>
    #header-layout {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }
</style>