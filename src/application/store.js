import { combineReducers } from 'redux'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { reducer as userReducer } from './redux/user/index.js'
import { reducer as languageReducer } from './containers/languageProvider/index.js'

const reducers = combineReducers({userReducer, languageReducer})

const store = createStore(reducers, compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
))

export default store