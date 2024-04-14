<script>
    export let label = '';
    export let icon = '';
    export let onclick = () => {};
    export let active = false;
    
</script>

<button class="button-component" class:active={active} on:click="{ onclick }" >
    <span class="icon" class:icon-only={label.length<=0} class:material-icons={icon.length>0} >{icon}</span>
    <span class="label" >{label}</span>
</button>

<style>
    .button-component {
        border-radius: 5px;
        padding: 10px;
        margin: 2px;
        border: none;
        border: 1px solid var(--color-back-3);
        background-color: var(--color-back-3);
        color: var(--color-a);
        transition-duration: 0.2s;
        font-size: large;
        display: inline-flex;
        align-items: center;
        text-wrap: nowrap;
        box-sizing: border-box;
    }
    .icon {
        margin-right: 5px;
    }
    .icon.icon-only {
        margin-right: 0;
    }

    .button-component.active {
        border: 1px solid var(--color-fore);
    }
    
    .button-component:hover {
        animation: 0.2s forwards hover;
    }
    
    .button-component:active {
        animation: 0.5s click;
    }


    @keyframes hover {
        100% {
            transform: scale(1.05);
        }
    }

    @keyframes click {
        50% {
            transform: scale(0.95);
        }
        100% {
            transform: scale(1);
        }
    }
</style>