/**
 * The client JS file that brings in React and bootstraps the app into the page from the server state.
 */
import React from "react"
import ReactDOM from "react-dom"
import { createHistory } from 'history'
import { Router, Route } from 'react-router'

//components
import App from "./components/application"

//put React into the global scope for chrome dev tool support
window.React = React;
window.ReactDOM = ReactDOM;

//grab the app node
const mountNode = document.getElementById('app');

//render our app component into that node
ReactDOM.render(<Router history={createHistory()}>
    <Route path="/:bin/:revision" component={App}>
    </Route>
</Router>, mountNode);


console.log(App)
