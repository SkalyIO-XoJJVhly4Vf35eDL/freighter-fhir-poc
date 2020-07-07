import NotFound from './routes/NotFound.svelte'
import Intro from './routes/Intro.svelte'
import Dashboard from './routes/Dashboard.svelte'
import Patient from './routes/Patient.svelte'

export default {
    '/': Dashboard,
    '/intro': Intro,
    '/patient/:channelId': Patient,
    // Catch-all
    '*': NotFound,
}