import { loadJSStories } from 'storybook-loader'

const req = require.context('./')

loadJSStories(req)
