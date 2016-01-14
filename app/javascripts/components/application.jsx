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
            jsResources: window.jsResources,
            cssResources: window.cssResources,
            showingRevisions: false,
            revisions: window.revisions || [],
            value: window.existingCode || initialScript
        };

        //socket events
        this.socket.on("code transformed", this.onCodeChange);
        this.socket.on("code saved", this.onCodeSaved);
        //webpack events
        this.socket.on("webpack transform", this.onWebpackCodeChanged);
        //module events
        this.socket.on("npm installing", this.onNpmInstall);
        this.socket.on("npm error", this.onNpmError);
        this.socket.on("npm complete", this.onNpmComplete);

        //bind keyboard handlers
        document.addEventListener("keydown", this.onKeyDown);

        //debounce the auto compile
        this.updateCode = debounce(this.updateCode, 500);

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
            frame.contentWindow.getPreviousState = this.getPreviousFrameState;

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
    onNpmInstall = ( data ) => {
        this.setState({compiling: true, npmMessage: `Installing ${data.modules.join(' ')} modules`})
    };

    /**
     * This is the callback for when NPM errors
     * @param data
     */
    onNpmError = ( data ) => {
        this.setState({
            compiling: false,
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
                this.setState({npmMessage: null, compiling: false});
            }, 2000);
        })

    };

    /**
     * Get the previous frame state or the last known state from the server which is bootstrapped into
     * window.savedState
     * @returns {*}
     */
    getPreviousFrameState = () => {
        return this.prevState || window.savedState; //fallback to server state;
    };

    /**
     * Get the React state from the users component tree
     * @returns {*}
     */
    serializeFrameState = () => {
        let frame = this.refs.resultsFrame;
        if ( frame.contentWindow.getState ) {
            return frame.contentWindow.getState();
        }
        return null;
    };

    /**
     * Clear any frame errors
     */
    clearFrameError = () => {
        this.setState({frameError: null});
    };

    /**
     * Event handler for an exception caught in the frame
     * @param msg
     */
    onFrameError = msg => {
        this.setState({frameError: msg.message});
    };

    /**
     * Render babel code to the iframe
     * @param code
     */
    renderCode = code => {
        let frame = this.refs.resultsFrame;
        if ( frame ) {
            renderReactToFrame(frame, code);
        }
    };

    /**
     * Render webpack code to the iframe
     * @param code
     * @param common
     */
    renderWebpackCode = ( code, common ) => {
        let frame = this.refs.resultsFrame;
        if ( frame ) {
            renderReactToFrame(frame, code, common);
        }
    };

    /**
     * Callback for webpack compiled code being passed from the server
     * @param data
     */
    onWebpackCodeChanged = data => {
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
    };

    /**
     * This is the callback function for when babel
     * compiled code comes back from the socket
     * @param code
     */
    onCodeChange = code => {
        if ( code ) {
            this.setState({compiling: false}, ()=> {
                this.renderCode(babelFrameScript(code));
            });

        }
    };

    /**
     * Update the code running in the frame by emitting a code change event
     */
    updateCode = () => {
        if ( !this.state.compiling ) {

            //store the previous state
            this.prevState = this.serializeFrameState();

            //emit the change
            this.socket.emit("code change", {
                code: this.state.value,
                bin: this.state.bin,
                jsResources: this.state.jsResources,
                cssResources: this.state.cssResources,
                revision: this.state.revision
            });
        }

    };

    /**
     * Event handler for when text in the editor has changed
     * @param newValue
     */
    onTextChanged = ( newValue ) => {
        this.setState({value: newValue}, ()=> {
            this.updateCode();
        });
    };

    /**
     * Event handler for code being successfully saved on the server
     * @param data
     */
    onCodeSaved = ( data ) => {
        console.log(data);
        let {bin,revision,createdAt,jsResources,cssResources} = data;
        if ( bin && revision ) {
            this.props.history.push({
                pathname: `/${bin}/${revision}`
            });

            //store in revisions
            let revisions = this.state.revisions;
            revisions.push({hash: revision, createdAt});
            this.setState({jsResources, cssResources, revisions, revision, justSaved: true}, ()=> {
                setTimeout(()=> {
                    this.setState({justSaved: false});
                }, 600)
            });
        }

    };

    /**
     * Key handler for performing keyboard shortcuts.
     * @param event
     * @returns {boolean}
     */
    onKeyDown = event => {
        if ( event.metaKey && event.keyCode === 83 ) {
            event.preventDefault();
            this.saveCode();
            return false;
        }

        return true;
    };

    /**
     * Save the current state of the code, passing the text, the bin, the revision and the serialized state of the
     * mounted component
     */
    saveCode = () => {
        let {bin,revision} = this.props.params;
        this.socket.emit("code save", {
            jsResources: this.state.jsResources,
            cssResources: this.state.cssResources,
            code: this.state.value,
            bin,
            revision,
            state: this.serializeFrameState()
        });
    };

    /**
     * Hide the revisions popover
     */
    hideRevisions = () => {
        this.setState({showingRevisions: false});
    };

    /**
     * Show the revisions popover
     */
    showRevisions = () => {
        this.setState({showingRevisions: true, showingJs: false, showingCss: false});
    };

    toggleCss = () => {
        let showing = this.state.showingCss;
        this.setState({showingCss: !showing, showingJs: false, showingRevisions: false});
    };

    toggleJs = () => {
        let showing = this.state.showingJs;
        this.setState({showingJs: !showing, showingCss: false, showingRevisions: false});
    };

    hideAllPanels = ()=> {
        this.setState({showingJs: false, showingCss: false, showingRevisions: false});
    };

    onAddCssResource = resource => {
        let cssResources = this.state.cssResources;
        if ( cssResources.indexOf(resource) === -1 ) {
            cssResources.push(resource);
            this.setState({cssResources});
        }
    };

    onAddJsResource = resource => {
        let jsResources = this.state.jsResources;
        if ( jsResources.indexOf(resource) === -1 ) {
            jsResources.push(resource);
            this.setState({jsResources});
        }
    };

    onDeleteCssResource = resource => {
        let cssResources = this.state.cssResources.filter(r => r !== resource);
        this.setState({cssResources});
    };

    onDeleteJsResource = resource => {
        let jsResources = this.state.jsResources.filter(r => r !== resource);
        this.setState({jsResources});
    };

    onReorderCssResource = ( resource, direction ) => {
        let cssResources = this.state.cssResources;
        let idx = cssResources.indexOf(resource);
        let newIdx = direction === "up"
            ? Math.max(idx - 1, 0)
            : Math.min(idx + 1, cssResources.length);

        cssResources.splice(idx, 1);
        cssResources.splice(newIdx, 0, resource);

        //move item up or down
        this.setState({cssResources});

    };
    onReorderJsResource = ( resource, direction ) => {
        let jsResources = this.state.jsResources;
        let idx = jsResources.indexOf(resource);
        let newIdx = direction === "up"
            ? Math.max(idx - 1, 0)
            : Math.min(idx + 1, jsResources.length);

        jsResources.splice(idx, 1);
        jsResources.splice(newIdx, 0, resource);

        //move item up or down
        this.setState({jsResources});

    };

    onCssItemUpdated = ( oldVal, newVal ) => {
        let cssResources = this.state.cssResources;
        let idx = cssResources.indexOf(oldVal);
        cssResources[idx] = newVal;
        this.setState({cssResources});
    };
    onJsItemUpdated = ( oldVal, newVal ) => {
        let jsResources = this.state.jsResources;
        let idx = jsResources.indexOf(oldVal);
        jsResources[idx] = newVal;
        this.setState({jsResources});
    };

    render() {
        const {showingRevisions, showingCss, showingJs,cssResources,jsResources} = this.state;
        return (
            <div className="app-container">

                <CssPanel onUpdateItem={this.onCssItemUpdated} onReorderItem={this.onReorderCssResource}
                          onDelete={this.onDeleteCssResource}
                          onAdd={this.onAddCssResource} resources={cssResources}
                          open={this.state.showingCss}
                          onClose={this.toggleCss}/>
                <JsPanel onUpdateItem={this.onJsItemUpdated} onReorderItem={this.onReorderJsResource}
                         onDelete={this.onDeleteJsResource}
                         onAdd={this.onAddJsResource} resources={jsResources}
                         open={this.state.showingJs}
                         onClose={this.toggleJs}/>
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
