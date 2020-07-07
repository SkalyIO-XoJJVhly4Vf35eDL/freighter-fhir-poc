<script>
    export let requireEntropy = 32;
    export let requireRounds = 5;
    export let callback = null;

    const crypto = require('crypto')

    let state = 0;
    let buffer = null;
    let noiseCanvas;
    let instructions, finished;
    let shouldHideInstructions = false, shouldHideFinished = false;

    function whitenoise(ctx, buffer, origWidth, origHeight, progress) {
        let canvas = ctx.canvas
        if(origWidth > origHeight) {
            let ratio = origHeight / origWidth 
            let shift = Math.floor(buffer.length * ratio)
            canvas.height = shift 
            canvas.width = buffer.length - shift
            // console.log('ratio w', ratio, canvas.width, canvas.height, canvas.height + canvas.width, origWidth, origHeight);   
        }
        else if(origWidth < origHeight) {
            let ratio = origWidth / origHeight 
            let shift = Math.floor(buffer.length * ratio)
            canvas.height = shift 
            canvas.width = buffer.length - shift
            // console.log('ratio h', ratio, canvas.width, canvas.height, canvas.height + canvas.width, origWidth, origHeight);   
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let p = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pxLen = Math.round(p.data.length / 4)
        
        for (var i = 0; i < pxLen; i++) {
            let currentBufIdx = Math.floor(i / 8) % buffer.length
            let currentBit = i % 8
            const offset = i * 4
            p.data[offset] = p.data[offset + 1] = p.data[offset + 2] = ((buffer[currentBufIdx] % i) & (1 << currentBit)) === 0 ? 0 : 255;
            p.data[offset + 1] = Math.max(p.data[offset + 1], progress * 255)
            p.data[offset] = p.data[offset + 2] -= Math.min(p.data[offset], progress * 255)
        }
        ctx.putImageData(p, 0, 0);
    }

    function generate() {
        state = 1;
        buffer = new Uint8Array(requireEntropy)
        let currentIdx = 0;
        let rounds = 0;
        let oldFn = window.onmousemove;
        let ctx = noiseCanvas.getContext('2d');
        let origWidth = noiseCanvas.getBoundingClientRect().width;
        let origHeight = noiseCanvas.getBoundingClientRect().height;

        setTimeout(() => {
            shouldHideInstructions = true;
        }, 2000)
        let progress = 0;
        window.onmousemove = (e) => {
            currentIdx = (currentIdx + 1) % buffer.length
            buffer[currentIdx] ^= (e.clientX + e.clientY)
            if(currentIdx === 0) {
                rounds++;
                // console.log(`Round ${rounds} ${Buffer.from(buffer).toString('hex')}`);                
            }
            whitenoise(ctx, buffer, origWidth, origHeight, (progress / (buffer.length * requireRounds)))
            progress++;
            if(rounds == requireRounds) {
                window.onmousemove = oldFn;
                oldFn = null;
                // Mask the final output with random entropy, making sure any user movement is invisible.
                let randomBuf = crypto.randomBytes(requireEntropy)
                let final = Buffer.from(buffer)               
                for(var i = 0; i < requireEntropy; i++) {
                    final[i] ^= randomBuf[i]
                }
                state = 2
                setTimeout(() => {
                    shouldHideFinished = true
                    setTimeout(() => {
                        callback(final)
                    }, 1000)
                }, 1000)
            }
        }
    }
</script>

<div class="cryptobox">
    {#if state === 0}
    <div class="intro" on:click="{generate}">
        <h1>Random seed generator</h1>
        <p>Click here to start generating your random seed</p>
    </div>
    {/if}
    <div class="generation">
        <div hidden="{ state !== 1 }" bind:this="{instructions}" class="instructions {shouldHideInstructions ? 'hidden' : ''}">
            <h1>Move your mouse or finger in random directions over the page!</h1>
        </div>
        <div hidden="{ state !== 2 }" bind:this="{finished}" class="finished {shouldHideFinished ? 'hidden' : ''}">
            <h1>Good job!</h1>
        </div>
        <canvas class="noise" bind:this="{noiseCanvas}"></canvas>
    </div>
</div>

<style lang="stylus">
    .cryptobox
        width 100%
        h1
            font-size: 20px

    .generation
        position relative

    .noise
        width 100%
        height 150px
        image-rendering: -webkit-optimize-contrast; /* webkit */
        image-rendering: -moz-crisp-edges /* Firefox */ 
        border-radius 5px

    .instructions
        background rgba(255, 255, 255, 0.5)

    .instructions, .finished  
        position absolute
        left 0
        right 0
        top 0
        bottom 0
        opacity 1
        transition: opacity 1s ease 0s
        border-radius 5px

        &.hidden
            opacity 0

    .intro
        cursor pointer
        padding 5px
        display block
        background: #fff7d9
        transition: box-shadow 1s ease 0s
        border-radius 5px

        &:hover
            box-shadow:         0px 0px 50px 0px rgba(0, 0, 0, 0.75);
</style>