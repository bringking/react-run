/**
 * The client JS file that brings in React and bootstraps the app into the page from the server state.
 */
import React from "react"
import { Router, Route, Link, Redirect, ImitateBrowserBehavior } from 'react-router'
import { history } from 'react-router/lib/HashHistory'

//components
import App from "./components/application"

//put React into the global scope for chrome dev tool support
window.React = React;

//grab the app node
const mountNode = document.getElementById('app');

//render our app component into that node
React.render(<Router history={history} scrollBehavior={ImitateBrowserBehavior}>
    <Route path="/" component={App}>
    </Route>
</Router>, mountNode);

