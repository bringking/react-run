import React from "react";
import ReactDOM from "react-dom";
import brace from 'brace';
import AceEditor from 'react-ace';
import Errors from "./errors";
import 'brace/mode/jsx';
import 'brace/theme/solarized_dark';
import {initialScript, babelFrameScript} from "../constants";
import renderReactToFrame from "../utils/render_react_to_frame";
import ComponentTree from "react-component-tree";
import debounce from "debounce";
import Revisions from "./revisions";
import SocketListener from "./socket_listener";
import JsPanel from "./js_panel";
import CssPanel from "./css_panel";

class Application extends React.Component {

    constructor( props, context ) {
        super(props, context);

        //store a reference to the socket
        this.socket = io();

        //set the initial bin
        let {bin,revision} = props.params;

        this.state = {
            bin,
            revision,
            justSaved: false,
            compiling: false,
            npmMessage: null,
            frameError: null,
            showingCss: false,
            showingJs: false,
            showingRevisions: false,
            revisions: window.revisions || [],
            value: window.existingCode || initialScript
        };

        //bind our functions
        this.showRevisions = this.showRevisions.bind(this);
        this.hideRevisions = this.hideRevisions.bind(this);
        this.onFrameError = this.onFrameError.bind(this);
        this.clearFrameError = this.clearFrameError.bind(this);
        this.saveCode = this.saveCode.bind(this);
        this.onTextChanged = this.onTextChanged.bind(this);
        this.toggleCss = this.toggleCss.bind(this);
        this.toggleJs = this.toggleJs.bind(this);
        this.hideAllPanels = this.hideAllPanels.bind(this);

        //socket events
        this.socket.on("code transformed", this.onCodeChange.bind(this));
        this.socket.on("code saved", this.onCodeSaved.bind(this));
        //webpack events
        this.socket.on("webpack transform", this.onWebpackCodeChanged.bind(this));
        //module events
        this.socket.on("npm installing", this.onNpmInstall.bind(this));
        this.socket.on("npm error", this.onNpmError.bind(this));
        this.socket.on("npm complete", this.onNpmComplete.bind(this));

        //bind keyboard handlers
        document.addEventListener("keydown", this.onKeyDown.bind(this));

        //debounce the auto compile
        this.updateCode = debounce(this.updateCode.bind(this), 500);

        //rehydrate our state
        if ( window.savedState ) {
            this.prevState = window.savedState;
        }
    }

    componentDidMount() {

        //update the window with the default script
        this.updateCode(this.state.value);

        let frame = this.refs.resultsFrame;
        if ( frame ) {

            frame.contentWindow.React = window.React;
            frame.contentWindow.ReactDOM = window.ReactDOM;
            frame.contentWindow.ComponentTree = ComponentTree;
            frame.contentWindow.getPreviousState = this.getPreviousFrameState.bind(this);

            //write the content
            frame.contentDocument.write(`<html>
        <head><title>Code</title></head>
        <body>
            <div id="client_results"></div>
        </body>
 </html>`);
            frame.contentDocument.close();

            //listen for frame errors
            frame.contentWindow.console.error = this.onFrameError;
            frame.contentWindow.__clearMessages = this.clearFrameError;
        }

    }

    /**
     * This is the callback for when NPM install starts
     * @param data
     */
    onNpmInstall( data ) {
        this.setState({compiling: true, npmMessage: `Installing ${data.modules.join(' ')} modules`})
    }

    /**
     * This is the callback for when NPM errors
     * @param data
     */
    onNpmError( data ) {
        this.setState({
            compiling: false,
            npmMessage: `Error Installing ${data.modules.join(' ')} modules. Stacktrace: ${data.output}`
        })
    }

    /**
     * This is the callback for when NPM is finished processing
     * @param data
     */
    onNpmComplete( data ) {
        this.setState({npmMessage: `Done installing ${data.modules.join(' ')} modules.`}, ()=> {
            //clear the message
            setTimeout(()=> {
                this.setState({npmMessage: null, compiling: false});
            }, 2000);
        })

    }

    /**
     * Get the previous frame state or the last known state from the server which is bootstrapped into
     * window.savedState
     * @returns {*}
     */
    getPreviousFrameState() {
        return this.prevState || window.savedState; //fallback to server state;
    }

    /**
     * Get the React state from the users component tree
     * @returns {*}
     */
    serializeFrameState() {
        let frame = this.refs.resultsFrame;
        if ( frame.contentWindow.getState ) {
            return frame.contentWindow.getState();
        }
        return null;
    }

    /**
     * Clear any frame errors
     */
    clearFrameError() {
        this.setState({frameError: null});
    }

    /**
     * Event handler for an exception caught in the frame
     * @param msg
     */
    onFrameError( msg ) {
        this.setState({frameError: msg.message});
    }

    /**
     * Render babel code to the iframe
     * @param code
     */
    renderCode( code ) {
        let frame = this.refs.resultsFrame;
        if ( frame ) {
            renderReactToFrame(frame, code);
        }
    }

    /**
     * Render webpack code to the iframe
     * @param code
     * @param common
     */
    renderWebpackCode( code, common ) {
        let frame = this.refs.resultsFrame;
        if ( frame ) {
            renderReactToFrame(frame, code, common);
        }
    }

    /**
     * Callback for webpack compiled code being passed from the server
     * @param data
     */
    onWebpackCodeChanged( data ) {
        if ( data.common && data.main ) {
            this.setState({compiling: false}, ()=> {

                //splice in exports
                data.main = data.main.replace("var Main = function (", "window.Main = function (");

                let codeToRender = `try{` + data.main + `

                (function(){
                var mountNode = document.getElementById('client_results');
                ReactDOM.render(React.createElement(Main),mountNode);})();

                if(window.__clearMessages) {
                     __clearMessages();
                }

            }catch(e){console.error(e)}`;
                this.renderWebpackCode(codeToRender, data.common);
            });
        }
    }

    /**
     * This is the callback function for when babel
     * compiled code comes back from the socket
     * @param code
     */
    onCodeChange( code ) {
        if ( code ) {
            this.setState({compiling: false}, ()=> {
                this.renderCode(babelFrameScript(code));
            });

        }
    }

    /**
     * Update the code running in the frame by emitting a code change event
     */
    updateCode() {
        if ( !this.state.compiling ) {

            //store the previous state
            this.prevState = this.serializeFrameState();

            //emit the change
            this.socket.emit("code change", {
                code: this.state.value,
                bin: this.state.bin,
                revision: this.state.revision
            });
        }

    }

    /**
     * Event handler for when text in the editor has changed
     * @param newValue
     */
    onTextChanged( newValue ) {
        this.setState({value: newValue}, ()=> {
            this.updateCode();
        });
    }

    /**
     * Event handler for code being successfully saved on the server
     * @param data
     */
    onCodeSaved( data ) {
        let {bin,revision,createdAt} = data;
        if ( bin && revision ) {
            this.props.history.push({
                pathname: `/${bin}/${revision}`
            });

            //store in revisions
            let revisions = this.state.revisions;
            revisions.push({hash: revision, createdAt});
            this.setState({revisions, revision, justSaved: true}, ()=> {
                setTimeout(()=> {
                    this.setState({justSaved: false});
                }, 600)
            });
        }

    }

    /**
     * Key handler for performing keyboard shortcuts.
     * @param event
     * @returns {boolean}
     */
    onKeyDown( event ) {
        if ( event.metaKey && event.keyCode === 83 ) {
            event.preventDefault();
            this.saveCode();
            return false;
        }

        return true;
    }

    /**
     * Save the current state of the code, passing the text, the bin, the revision and the serialized state of the
     * mounted component
     */
    saveCode() {
        let {bin,revision} = this.props.params;
        this.socket.emit("code save", {code: this.state.value, bin, revision, state: this.serializeFrameState()});
    }

    /**
     * Hide the revisions popover
     */
    hideRevisions() {
        this.setState({showingRevisions: false});
    }

    /**
     * Show the revisions popover
     */
    showRevisions() {
        this.setState({showingRevisions: true});
    }

    toggleCss() {
        let showing = this.state.showingCss;
        this.setState({showingCss: !showing});
    }

    toggleJs() {
        let showing = this.state.showingJs;
        this.setState({showingJs: !showing});
    }

    hideAllPanels() {
        this.setState({showingJs: false, showingCss: false, showingRevisions: false});
    }

    render() {
        const {showingRevisions, showingCss, showingJs} = this.state;
        return (
            <div className="app-container">

                <CssPanel open={this.state.showingCss} onClose={this.toggleCss}/>
                <JsPanel open={this.state.showingJs} onClose={this.toggleJs}/>
                <Revisions revision={this.state.revision} bin={this.state.bin} revisions={this.state.revisions}
                           showingRevisions={showingRevisions} hideRevisions={this.hideRevisions}/>

                <div className="app-inner">
                    <div id="editor" className={`${showingRevisions || showingCss || showingJs  ?'fade':''}`}>
                        <div className="toolbar">
                            <div className="toolbar-pad"></div>
                            <ul className="toolbar-controls">
                                <li onClick={this.saveCode}>Save <i className="fa fa-save"></i></li>
                                <li onClick={this.toggleCss}>CSS Resources <i className="fa fa-css3"></i>
                                </li>
                                <li onClick={this.toggleJs}>JS Resources <i className="fa fa-code"></i>
                                </li>
                                <li onClick={this.showRevisions}>Revisions <i className="fa fa-file-text"></i></li>
                            </ul>
                        </div>
                        <AceEditor
                            mode="jsx"
                            theme="solarized_dark"
                            onFocus={this.hideAllPanels}
                            onChange={this.onTextChanged}
                            width="100%"
                            value={this.state.value}
                            height="100vh"
                            name="editor_window"
                            editorProps={{$blockScrolling: true}}
                        />
                    </div>
                    <div id="results">
                        <iframe frameBorder="0" ref="resultsFrame" src="about:blank" id="resultsFrame"></iframe>
                    </div>
                </div>
                {this.state.npmMessage ? <div className={`npm-message`}>
                    {this.state.npmMessage} <i className="fa fa-circle-o-notch fa-spin"></i>
                </div> : null}
                <Errors socket={this.socket} frameError={this.state.frameError}/>
                <div
                    className={`saved animated ${this.state.justSaved ?'fadeIn':'fadeOut'}`}>
                    Saved!
                </div>
            </div>);
    }
}

export default SocketListener(Application);
