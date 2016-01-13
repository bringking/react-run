import React from "react"
/**
 * The Socket Listener will handle listening to events from Socket IO
 * @param ComposedComponent
 * @constructor
 */
const SocketListener = ComposedComponent =>
    class extends React.Component {
        constructor() {
            super();
        }

        render() {
            return <ComposedComponent {...this.props}/>;
        }
    };

export default SocketListener;