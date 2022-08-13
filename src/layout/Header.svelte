<script>
    import { Link } from 'svelte-navigator';
    import Input from '../components/Input.svelte';
    import Modal from '../components/Modal.svelte';
    import Button from '../components/Button.svelte';

    let menuModal;
    let loginModal;
    let registerModal;
    let aboutModal;
</script>

<div class="header-layout">
    <div class="banner">
        <h1>Welcome to qolboard 2.0</h1>
        <Button icon="menu" label="Menu" onclick={()=>menuModal.toggle()} />
    </div>
    <div class="menu">
        
    </div>
</div>
<Modal bind:this={menuModal}>
    <Button label="Login" icon="login" onclick={()=>{
        loginModal.toggle(); registerModal.close(); aboutModal.close();
    }} />
    <Button label="Register" icon="person_add" onclick={()=>{
        registerModal.toggle(); loginModal.close(); aboutModal.close();
    }} />
    <Button label="About" icon="info" onclick={()=>{
        aboutModal.toggle(); loginModal.close(); registerModal.close();
    }} />

    <Modal bind:this={loginModal}>
        <h2>Login</h2>
        <form action="">
            <Input label="Display name" />
        </form>
    </Modal>

    <Modal bind:this={registerModal}>
        <h2>Register</h2>
    </Modal>

    <Modal bind:this={aboutModal}>
        <h2>About</h2>
        <h3>Privacy note</h3>
        <p>Please note that qolboard uses:</p>
        <ul>
            <li>session storage to carry your drawings over between page refreshes</li>
            <li>server memory to sync your drawing with anyone who joins the 'room' which you are currently in.</li>
        </ul>
        <p>Therefore <em>please do not use qolboard for any personal or private details</em>.</p>
    </Modal>
</Modal>

<style>
    .header-layout {
        display: flex;
        align-items: center;
        background-color: #754848;
        align-items: stretch;
    }
    .banner {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 2;
        padding: 20px;
    }
    .banner :global(.button-component) {
        margin-left: 10px;
    }
    .menu {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
    }
    h1 {
        margin: 0;
    }
</style>