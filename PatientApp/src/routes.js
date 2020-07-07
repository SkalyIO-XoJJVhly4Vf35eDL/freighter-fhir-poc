import NotFound from './routes/NotFound.svelte'
import Intro from './routes/Intro.svelte'
import Dashboard from './routes/Dashboard.svelte'

export default {
    '/': Dashboard,
    '/intro': Intro,
    // Catch-all
    '*': NotFound,
}