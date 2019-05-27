import ReactDOM from 'react-dom'
import { createStore, createApp } from './app'
import './styles/index.scss'

const { createBrowserHistory } = require('history')

const { store, history } = createStore(createBrowserHistory(), {})
const app = createApp(store, history)

ReactDOM.render(app, window.document.getElementById('app'))
