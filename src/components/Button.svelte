<script>
    export let label = '';
    export let icon = '';
    export let onclick = () => {};
    
</script>

<button class="button-component" on:click="{ onclick }" >
    <span class="icon" class:icon-only={label.length<=0} class:material-icons={icon.length>0} >{icon}</span>
    <span class="label" >{label}</span>
</button>

<style>
    .button-component {
        border-radius: 5px;
        padding: 10px;
        border: none;
        background-color: #e78e8e;
        transition-duration: 1s;
        font-size: large;
        display: inline-flex;
        align-items: center;
    }
    .icon {
        margin-right: 5px;
    }
    .icon.icon-only {
        margin-right: 0;
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