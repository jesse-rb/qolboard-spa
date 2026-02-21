<script lang="ts">
    interface Props {
        label?: string;
        icon?: string;
        onclick?: any;
        active?: boolean;
        isLoading?: boolean;
        disabled?: boolean;
    }

    let {
        label = '',
        icon = '',
        onclick = () => {},
        active = false,
        isLoading = false,
        disabled = false
    }: Props = $props();
    
</script>

<button class="button-component" class:icon-only={label.length<=0} class:active={active} {onclick} disabled={disabled} >
    {#if isLoading}
        <span class="material-icons icon animate-spin" class:icon-only={label.length<=0} >sync</span>
    {:else}
        <span class="icon" class:icon-only={label.length<=0} class:material-icons={icon.length>0} >{icon}</span>
    {/if}
    <span class="label" >{label}</span>
</button>

<style>
    .button-component {
        border-radius: 5px;
        padding: 10px;
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
    .button-component.icon-only {
        width: fit-content;
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