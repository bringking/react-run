import React from "react"
import SocketListener from "./socket_listener"

/**
 * The NpmListener will handle listening to NPM events from Socket IO
 * @param ComposedComponent
 * @constructor
 */
const NpmListener = ComposedComponent =>
    class extends SocketListener {
        constructor() {
            //call SocketListener with our events and callbacks
            super();

            this.listeners = {
                "npm installing": this.onNpmInstall,
                "npm error": this.onNpmError,
                "npm complete": this.onNpmComplete
            };

            this.state = {
                npmInstalling: false,
                npmError: false,
                npmComplete: false,
                npmMessage: ""
            }
        }

        /**
         * This is the callback for when NPM install starts
         * @param data
         */
        onNpmInstall = ( data ) => {
            this.setState({
                npmComplete: false,
                npmInstalling: true,
                npmMessage: `Installing ${data.modules.join(' ')} modules`
            })
        };

        /**
         * This is the callback for when NPM errors
         * @param data
         */
        onNpmError = ( data ) => {
            this.setState({
                npmInstalling: false,
                npmComplete: true,
                npmError: true,
                npmMessage: `Error Installing ${data.modules.join(' ')} modules. Stacktrace: ${data.output}`
            })
        };

        /**
         * This is the callback for when NPM is finished processing
         * @param data
         */
        onNpmComplete = data => {
            this.setState({npmMessage: `Done installing ${data.modules.join(' ')} modules.`}, ()=> {
                //clear the message
                setTimeout(()=> {
                    this.setState({npmMessage: null, npmInstalling: false, npmComplete: true, npmError: true});
                }, 2000);
            })

        };

        render() {
            //compose our component to include the NPM message events
            return <ComposedComponent
                {...this.state}
                {...this.props}/>;
        }
    };

export default NpmListener;