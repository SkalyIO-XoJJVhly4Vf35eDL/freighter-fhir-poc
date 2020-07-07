<script>
    import { userSeedCheck } from "root/Config.js"
    import {
        FreighterPrivateChannel,
        Freighter,
        FreighterPolling
    } from "freighter";
    import { iota } from "root/Singleton.js";
    import { push, link } from "svelte-spa-router";
    import { onMount, onDestroy } from 'svelte';

    const crypto = require('crypto');
    const store = require('store2');

    let patients = [];
    let username = "", password = "";
    let keyPair = null, privateChannel = null;

    function seedStoredCheck() {
        if(!store.has('encryptedSeed')) {
            push('/intro')
        }
    }

    async function start(seed) {
        const privateKey = Freighter.getKey(seed, 'Key:FPC')
        keyPair = await FreighterPrivateChannel.generatePrivateChannel(privateKey)
        privateChannel = new FreighterPrivateChannel(
            Freighter,
            FreighterPolling,
            iota.instance,
            keyPair.privateKey
        )
        privateChannel.mwm = iota.mwm
        await privateChannel.openChannel()
        privateChannel.on('dial', (obj) => {
            patients.push({ key: obj.channelKey.toString('hex'), name: obj.metadata.toString('ascii') })
            patients = patients
        })
    }

    function login() {
        const encryptedSeed = Buffer.from(store.get('encryptedSeed'), 'hex')
        const key = crypto.createHmac('sha256', password).update("user:" + username).digest()
        const iv = encryptedSeed.slice(encryptedSeed.length - 16, encryptedSeed.length)
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        const decryptedSeed = decipher.update(encryptedSeed.slice(0, encryptedSeed.length - 16))
        if(decryptedSeed.slice(0, userSeedCheck.length).equals(userSeedCheck)) {
            start(decryptedSeed.slice(userSeedCheck.length, decryptedSeed.length))
        }
        else {
            alert('Username or password is incorrect')
        }
    }

    onDestroy(() => {
        if(privateChannel !== null) {
            privateChannel.destroy()
            privateChannel = null
        }
    })

    onMount(() => {
        seedStoredCheck()
    })
</script>
<div>
    {#if keyPair === null}
    <p>Log in</p>
    <form on:submit|preventDefault={login}>
        <input type="text" bind:value="{username}" placeholder="Username">
        <input type="password" bind:value="{password}" placeholder="Password">
        <br />
        <input type="submit" value="Login">
    </form>
    {:else}
        <h1>Patient list</h1>
        {#if patients.length === 0}
            <p>No patients found yet. Make sure to open the demo patient app and add the following root key to allow patients to talk to you!</p>
            <p>{ keyPair.address.toString('hex') }</p>
        {:else}
            {#each patients as patient}
                <a use:link href="/patient/{patient.key}">{patient.name.toString('ascii')}</a>
                <br />
            {/each}
        {/if}
    {/if}
</div>