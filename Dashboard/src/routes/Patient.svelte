<script>
  import { onMount, onDestroy } from "svelte";
  import { iota } from "../Singleton.js";
  import {
    FreighterPrivateChannel,
    Freighter,
    FreighterPolling
  } from "freighter";
  import { push } from "svelte-spa-router";
  import PatientView from "root/views/PatientView.svelte"

  const store = require('store2');

  export let params;

  let freighter, polling;
  let historyIndex = -1;
  let currentPatient = null;

  async function loadHistory() {
    const historyMessages = await Freighter.getChannelHistory(
      iota.instance,
      freighter.getAddressSeed(),
      historyIndex,
      15
    );
    if (historyMessages !== null && historyMessages.length > 0) {
      historyIndex = historyMessages[0].index;      
      historyMessages.reverse().forEach(processMessage)
      if (historyIndex > 0) {
        await loadHistory();
      }
    }
  }

  function processMessage(msg) {
      try {
        const json = JSON.parse(msg.message.toString('ascii'))
        switch(json.resourceType) {
          case 'Patient':
            currentPatient = json
            break
          case 'Consent':
            // Remove private key
            alert('Patient as asked to remove data from your system. Removal request:\n' + json.sourceAttachment.title)
            store.remove('encryptedSeed')
            push('/intro')
            break
        }
      }
      catch(e) {
        console.error('error (ignored)', e)
      }
  }

  onMount(() => {
    freighter = new Freighter(
      iota.instance,
      Buffer.from(params.channelId, "hex")
    );
    polling = new FreighterPolling(
      Freighter,
      iota.instance,
      freighter.getAddressSeed()
    );
    polling.on("messages", newMsgs => {
      newMsgs.reverse().forEach(processMessage)
    });
    polling.startPolling();
    loadHistory().then();
  });
</script>

<div>
  <h1>Patient view</h1>
  {#if currentPatient !== null}
  <PatientView patient={currentPatient}></PatientView>
  {/if}
</div>
