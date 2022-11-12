<script>
    import { getContext } from "svelte";
    import Button from "../Button.svelte"

    let activeMode = getContext('activeMode');
</script>

<div class="control-panel">
    <!--modes-->
    <div class="control-group">
        <Button icon="draw" active={activeMode} />
    </div>
</div>

<style>
    
</style>