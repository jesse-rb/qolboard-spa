<script>
export let label = '';
export let onclick = () => {};
</script>

<button id="button-component" on:click="{ onclick }" class="{label.length <= 1 ? 'symbol' : ''}">{label}</button>

<style>
    #button-component {
        border-radius: 50px;
        padding: 10px;
        border: none;
        background-color: #e78e8e;
        transition-duration: 1s;
    }
    #button-component.symbol {
        border-radius: 50%;
        padding: 0;
        width: 30px;
        height: 30px;
    }
    
    #button-component:hover {
        animation: 0.2s forwards hover;
    }
    
    #button-component:active {
        animation: 0.5s click;
    }

    @keyframes hover {
        100% {
            transform: scale(1.1);
        }
    }

    @keyframes click {
        50% {
            transform: scale(0.8);
        }
        100% {
            transform: scale(1);
        }
    }
</style>