<script>
import {push} from 'svelte-spa-router'
import { link } from "svelte-spa-router";
import { userSeedCheck } from "root/Config.js"
import Button from 'root/views/Button.svelte'
import CryptoBox from 'root/views/CryptoBox.svelte'

const crypto = require('crypto');
const store = require('store2');

// we need 16 bytes for the AES256-CBC IV and 32 bytes for the seed
const requireEntropy = 48

let channelKeyInput = ''
let entropy;
let state = 0;

let username = "", password = "", password2 = "";

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
    state++
}
</script>

<main>
    <h1>FHIR-Freighter PoC Dashboard</h1>
    <p>
        The idea of this PoC is to get into the role of a practictioner, or a medical healthcare professional. Troughout this process, and in combination with the user-facing web app, you will be able to set up an identity, where you can review user's details, which you can only see if they consent to sharing them.
    </p>

    {#if state === 0}
    <div>
        <p><b>To begin...</b> you need to generate a seed. This seed is like your keychain, and will be stored locally, protected by a username and password. This is very close to what Skaly does in our own dashboard!</p>
        <CryptoBox callback={onEntropy} requireEntropy={requireEntropy} />
    </div>
    {:else if state === 1}
    <div>
        <p>Register a user account that is used to encrypt your seed and to log in later. This data is not sent anywhere.</p>
        <form on:submit|preventDefault={registerUser}>
            <input type="text" bind:value="{username}" placeholder="Username">
            <input type="password" bind:value="{password}" placeholder="Password">
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