<script>
    import { onMount } from "svelte";
    export let object, mapping = null, displayKeys = null;
    
    const SpecialKeys = {
        pre: '*'
    }
    let displayObject = []
    
    onMount(() => {
        const keysToLoop = displayKeys === null ? Object.keys(object) : displayKeys
        for(let i in keysToLoop) {
            let k = keysToLoop[i]
            let value = object[k]
            let displayK = k
                
            if(mapping !== null) {
                if(SpecialKeys.pre in mapping) {
                    const mappingResult = mapping[SpecialKeys.pre](k, object[k])
                    displayK = mappingResult.k
                    value = mappingResult.v
                }
                
                if(k in mapping) {
                    const mappingType = typeof(mapping[k])
                    if(mappingType === 'string') {
                        displayObject.push([mapping[k], object[k]])
                        continue
                    }
                    else if(mappingType === 'function') {
                        const mappingResult = mapping[k](displayK, object[k])
                        displayObject.push([mappingResult.k, mappingResult.v])
                        continue
                    }
                }
            }            
            displayObject.push([displayK, object[k]])
        }
        displayObject = displayObject
    })
</script>
<div class="keyed-view">
    {#each displayObject as kv}
    {kv[0]}: {kv[1]}
    <br />
    {/each}
</div>
