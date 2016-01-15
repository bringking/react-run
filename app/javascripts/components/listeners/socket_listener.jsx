import React from "react"
/**
 * The Socket Listener will handle listening to events from Socket IO
 * @param ComposedComponent
 * @constructor
 */
class SocketListener extends React.Component {
    constructor() {
        super();
        //these will be our socket listeners
        this.listeners = {};
        this.socket = io();
    }

    componentWillMount() {
        //subscribe module events
        Object.keys(this.listeners).forEach(k =>this.socket.on(k, this.listeners[k]));
    }

    componentWillUnmount() {
        //unsubscribe to our module events
        Object.keys(this.listeners).forEach(k =>this.socket.removeListener(k, this.listeners[k]));
    }
}

export default SocketListener;