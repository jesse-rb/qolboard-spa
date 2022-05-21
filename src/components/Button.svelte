<script>
    export let label = '';
    export let onclick = () => {};

    
</script>

<button class="button-component" on:click="{ onclick }" class:symbol={label.length <= 1}>{label}</button>

<style>
    .button-component {
        border-radius: 50px;
        padding: 10px;
        border: none;
        background-color: #e78e8e;
        transition-duration: 1s;
        font-size: large;
    }
    .button-component.symbol {
        border-radius: 50%;
        padding: 0;
        width: 35px;
        height: 35px;
        text-align: center;
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