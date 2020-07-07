<script>
    import { userSeedCheck } from "root/Config.js"
    import {
        FreighterPrivateChannel,
        Freighter,
        FreighterPolling
    } from "freighter";
    import Button from 'root/views/Button.svelte'
    import PatientView from "root/views/PatientView.svelte"
    import { iota } from "root/Singleton.js";
    import { push } from "svelte-spa-router";
    import { onMount } from 'svelte';

    const FhirPatient = require('root/FhirExamples/Patient')
    const FhirWithdrawConsent = require('root/FhirExamples/FhirWithdrawConsent')
    const crypto = require('crypto');
    const store = require('store2');

    let currentPatient = null;
    let username = "", password = "";
    let keyPair = null, privateChannel = null;
    let loading = false, sendingMsg = false;
    let loggedIn = false;
    let freighter, polling;
    let historyIndex = -1;

    function seedStoredCheck() {
        if(!store.has('encryptedSeed')) {
            push('/intro')
        }
    }

    async function loadHistory() {
        const historyMessages = await Freighter.getChannelHistory(iota.instance, freighter.getAddressSeed(), historyIndex, 15)
        if(historyMessages !== null && historyMessages.length > 0) {
            historyIndex = historyMessages[0].index
            historyMessages.reverse().forEach(processMessage)
            if(historyIndex > 0) {
                await loadHistory()
            }
        }
    }

    function processMessage(msg) {
        try {
            const json = JSON.parse(msg.message.toString('ascii'))
            console.log('json', json);
            switch(json.resourceType) {
            case 'Patient':
                currentPatient = json
                break
            }
        }
        catch(e) {
            console.error('error (ignored)', e)
        }
    }

    async function sharePatient() {
        sendingMsg = true
        let patientJSON = FhirPatient()
        const msgToSend = JSON.stringify(patientJSON)
        try {
            await freighter.sendMessage("FREIGHTER9DEMO", msgToSend, iota.mwm)
        }
        catch(e) {
            alert(`Error: ${e.message}`)
        }
        sendingMsg = false
    }

    async function removeConsent() {
        if(confirm("This will remove the data on this app and on the side of the organisation you shared your data with, are you sure?")) {
            sendingMsg = true
            let withdrawConsentJSON = FhirWithdrawConsent()
            const msgToSend = JSON.stringify(withdrawConsentJSON)
            try {
                await freighter.sendMessage("FREIGHTER9DEMO", msgToSend, iota.mwm)
                store.remove('encryptedSeed')
                push('/intro')
            }
            catch(e) {
                alert(`Error: ${e.message}`)
            }
            sendingMsg = false
        }        
    }

    async function start(seed) {
        loading = true
        const rootKey = Buffer.from(store.get('rootKey'), 'hex')
        const nickname = Buffer.from(store.get('fullname'), 'ascii')
        try {
            let channelKey = await FreighterPrivateChannel.dial(iota.instance, Freighter, rootKey, nickname, iota.mwm)
            freighter = new Freighter(iota.instance, channelKey)
            polling = new FreighterPolling(Freighter, iota.instance, freighter.getAddressSeed())
            polling.on('messages', (newMsgs) => {
                newMsgs.reverse().forEach(processMessage)
            })
            polling.startPolling()
            loadHistory().then()
        }
        catch (e) {
            alert("Error trying to find channel: " + e.message)
        }

        loading = false
    }

    function login() {
        const encryptedSeed = Buffer.from(store.get('encryptedSeed'), 'hex')
        const key = crypto.createHmac('sha256', password).update("user:" + username).digest()
        const iv = encryptedSeed.slice(encryptedSeed.length - 16, encryptedSeed.length)
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        const decryptedSeed = decipher.update(encryptedSeed.slice(0, encryptedSeed.length - 16))
        if(decryptedSeed.slice(0, userSeedCheck.length).equals(userSeedCheck)) {
            loggedIn = true;
            start(decryptedSeed.slice(userSeedCheck.length, decryptedSeed.length))
        }
        else {
            alert('Username or password is incorrect')
        }
    }

    onMount(() => {
        seedStoredCheck()
    })
</script>
<div>
    {#if !loggedIn}
    <p>Log in</p>
    <form on:submit|preventDefault={login}>
        <input type="text" bind:value="{username}" placeholder="Username">
        <input type="password" bind:value="{password}" placeholder="Password">
        <br />
        <input type="submit" value="Login">
    </form>
    {:else}
    <div>
        <h1>Patient view</h1>
        {#if loading}
            Loading...
        {:else}
            <p>Connected to the private channel of FHIR-Freighter PoC</p>
            <h2>Patient details</h2>
            {#if currentPatient !== null}
                <h2>Shared the following details</h2>
                <PatientView patient={currentPatient}></PatientView>
                <Button callback="{removeConsent}" type="delete">Remove consent</Button>
            {/if}
            <Button callback="{sharePatient}" type="primary">Share</Button>
        {/if}
    </div>
    {/if}
</div>