<script>
import {push, link} from 'svelte-spa-router'
import { userSeedCheck } from "root/Config.js"
import CryptoBox from 'root/views/CryptoBox.svelte'
import Button from 'root/views/Button.svelte'

const crypto = require('crypto');
const store = require('store2');

// we need 16 bytes for the AES256-CBC IV and 32 bytes for the seed
const requireEntropy = 48

let channelKeyInput = ''
let entropy;
let state = 0;
let username = "", password = "", password2 = "", fullname = "";
let rootKey = '';

function onEntropy(entropy_) {
    entropy = entropy_
    state++
}

function registerUser() {
    if(password !== password2) {
        alert('Passwords do not match!')
        return
    }
    const key = crypto.createHmac('sha256', password).update("user:" + username).digest()
    let seed = entropy.slice(0, 32)
    // We add a static check value so we can see if we decrypt correctly when we log in.
    seed = Buffer.concat([userSeedCheck, seed])
    const iv = entropy.slice(32, entropy.length)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    const encryptedSeed = Buffer.concat([cipher.update(seed), cipher.final(), iv])
    store.set('encryptedSeed', encryptedSeed.toString('hex'))
    store.set('rootKey', rootKey)
    store.set('fullname', fullname)
    state++
}
</script>

<main>
    <h1>FHIR-Freighter Patient App</h1>
    <p>
        You will be able to link yourself as a patient to the complementary dashboard PoC.
    </p>

    {#if state === 0}
    <div>
        <p><b>To begin...</b> you need to generate a seed. This seed is like your keychain, and will be stored locally, protected by a username and password.</p>
        <CryptoBox callback={onEntropy} requireEntropy={requireEntropy} />
    </div>
    {:else if state === 1}
    <div>
        <p>Register a user account that is used to encrypt your seed and to log in later.</p>
        <p>Note that the data (except username and password) you use here will be sent over a secured Freighter-channel, but is in itself entirely fictional. <b>You don't have to use real data/details here.</b></p>
        <form on:submit|preventDefault={registerUser}>
            <input type="text" bind:value="{rootKey}" placeholder="Root Key (From Dashboard)">
            <br />
            <input type="text" bind:value="{username}" placeholder="Username">
            <br />
            <input type="text" bind:value="{fullname}" placeholder="Full Name">
            <br />
            <input type="password" bind:value="{password}" placeholder="Password">
            <br />
            <input type="password" bind:value="{password2}" placeholder="Password (confirm)">
            <br />
            <input type="submit" value="Register">
        </form>
    </div>
    {:else if state === 2}
    <p>Thank you! You're now ready to use the dashboard.</p>
    <Button callback="{() => push('/')}" type="primary">Go to Dashboard</Button>
    {/if}
</main>

<style>
	
</style>