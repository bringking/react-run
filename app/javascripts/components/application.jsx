//deps
import React from "react";
import ReactDOM from "react-dom";
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/jsx';
import 'brace/theme/solarized_dark';
import defaultsDeep from "lodash.defaultsdeep";
import ComponentTree from "react-component-tree";

//utilities
import {initialScript, babelFrameScript} from "../constants";
import renderReactToFrame from "../utils/render_react_to_frame";
import debounce from "debounce";

//child components
import Errors from "./errors";
import JsPanel from "./js_panel";
import CssPanel from "./css_panel";
import Revisions from "./revisions";
import StateBar from "./state_bar";

//our socket IO listener components
import NpmListener from "./listeners/npm_listener";

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
            saveState: window.savedState,
            stateTransitions: [],
            justSaved: false,
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

        //bind keyboard handlers
        document.addEventListener("keydown", this.onKeyDown);

        //debounce the auto compile
        this.updateCode = debounce(this.updateCode, 500);

    }

    componentDidMount() {

        //update the window with the default script
        this.updateCode(this.state.value);

        let frame = this.refs.resultsFrame;
        if ( frame ) {

            frame.contentWindow.React = window.React;
            frame.contentWindow.ReactDOM = window.ReactDOM;
            frame.contentWindow.defaultsDeep = defaultsDeep;
            frame.contentWindow.ComponentTree = ComponentTree;
            frame.contentWindow.initialState = window.savedState;
            frame.contentWindow.getPreviousState = this.getPreviousFrameState;

            //write the content
            frame.contentDocument.domain = document.domain;
            frame.contentDocument.write(this.getFrameContent());
            frame.contentDocument.close();

            //listen for frame errors
            frame.contentWindow.console.error = this.onFrameError;
            frame.contentWindow.__clearMessages = this.clearFrameError;
        }

    }

    enableStateReplacement = ( state ) => {
        let frame = this.refs.resultsFrame;
        frame.contentWindow.initialState = state;
    };

    getFrameContent = () => {
        return `<html>
        <head>
        <title>Code</title>
         ${this.state.cssResources.map(r =>'<link class="injected-style" rel="stylesheet" href="' + r + '">')}
         </head>
        <body>
            <div id="shadow_results" style="display:none;"></div>
            <div id="client_results"></div>
            <div id="injected-scripts">
              ${this.state.jsResources.map(r =>'<script type="text/javascript" src="' + r + '"></script>')}
            </div>
        </body>
 </html>`
    };

    /**
     * Reconcile the frames head <link> tags with the new resources from the CSS resources state
     */
    reconcileCss() {
        let frame = this.refs.resultsFrame;
        let styles = frame.contentDocument.getElementsByClassName("injected-style");
        let head = frame.contentDocument.getElementsByTagName("head")[0];

        //cleanup
        Array.prototype.forEach.call(styles, ( style ) => {
            head.removeChild(style);
        });

        if ( this.state.cssResources.length ) {
            this.state.cssResources.forEach(r => {
                let link = frame.contentDocument.createElement('link');
                link.rel = 'stylesheet';
                link.className = 'injected-style';
                link.href = r;
                head.appendChild(link);
            });
        }

    }

    /**
     * Reconcile the frames 'injected-scripts' with the new scripts from the jsResources
     */
    reconcileScripts() {
        let frame = this.refs.resultsFrame;
        let scripts = frame.contentDocument.getElementById("injected-scripts");
        //clear the previous scripts
        scripts.innerHTML = "";
        //re-add
        if ( this.state.jsResources.length ) {
            scripts.innerHTML = `${this.state.jsResources.map(r =>'<script type="text/javascript" src="' + r + '"></script>')}`
        }

    }

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

        //persist state across refreshes
        if ( this.state.saveState ) {
            this.enableStateReplacement(this.serializeFrameState());
        }

        //emit the change
        this.socket.emit("code change", {
            code: this.state.value,
            bin: this.state.bin,
            jsResources: this.state.jsResources,
            cssResources: this.state.cssResources,
            revision: this.state.revision
        });

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
            state: this.state.saveState ? this.serializeFrameState() : null
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
            this.setState({cssResources}, ()=> {
                this.reconcileCss();
            });
        }
    };

    onAddJsResource = resource => {
        let jsResources = this.state.jsResources;
        if ( jsResources.indexOf(resource) === -1 ) {
            jsResources.push(resource);
            this.setState({jsResources}, ()=> {
                this.reconcileScripts();
            });
        }
    };

    onDeleteCssResource = resource => {
        let cssResources = this.state.cssResources.filter(r => r !== resource);
        this.setState({cssResources}, ()=> {
            this.reconcileCss();
        });
    };

    onDeleteJsResource = resource => {
        let jsResources = this.state.jsResources.filter(r => r !== resource);
        this.setState({jsResources}, ()=> {
            this.reconcileScripts();
        });
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
        this.setState({cssResources}, ()=> {
            this.reconcileCss();
        });

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
        this.setState({jsResources}, ()=> {
            this.reconcileScripts();
        });

    };

    onCssItemUpdated = ( oldVal, newVal ) => {
        let cssResources = this.state.cssResources;
        let idx = cssResources.indexOf(oldVal);
        cssResources[idx] = newVal;
        this.setState({cssResources}, ()=> {
            this.reconcileCss();
        });
    };
    onJsItemUpdated = ( oldVal, newVal ) => {
        let jsResources = this.state.jsResources;
        let idx = jsResources.indexOf(oldVal);
        jsResources[idx] = newVal;
        this.setState({jsResources}, ()=> {
            this.reconcileScripts();
        });
    };

    setPreserveState = ()=> {
        let saveState = this.state.saveState;
        this.setState({saveState: !saveState}, ()=> {
            this.updateCode();
        });
    };

    onSelectState = ( idx ) => {
        console.log("Selected state " + idx);
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
                                <li onClick={this.setPreserveState}>Track State {this.state.saveState ?
                                    <i className="fa fa-check-square"></i> : <i className="fa fa-square"></i> }</li>
                                <li onClick={this.saveCode}>Save <i className="fa fa-save"></i></li>
                                <li onClick={this.toggleCss}>CSS Resources <i className="fa fa-css3"></i>
                                </li>
                                <li onClick={this.toggleJs}>JS Resources <i className="fa fa-code"></i>
                                </li>
                                <li onClick={this.showRevisions}>Revisions <i className="fa fa-file-text"></i></li>
                            </ul>
                        </div>
                        <Errors
                            socket={this.socket}
                            frameError={this.state.frameError}/>
                        <AceEditor
                            mode="jsx"
                            theme="solarized_dark"
                            onFocus={this.hideAllPanels}
                            onChange={this.onTextChanged}
                            value={this.state.value}
                            name="editor_window"
                            showPrintMargin={false}
                            editorProps={{$blockScrolling: true}}
                        />
                    </div>
                    <div id="results">
                        <iframe frameBorder="0" ref="resultsFrame" src="about:blank" id="resultsFrame"></iframe>
                    </div>
                </div>

                {this.props.npmMessage ? <div className={`npm-message`}>
                    {this.props.npmMessage} <i className="fa fa-circle-o-notch fa-spin"></i>
                </div> : null}

                <div
                    className={`saved animated ${this.state.justSaved ?'fadeIn':'fadeOut'}`}>
                    Saved!
                </div>
            </div>);
    }
}

export default NpmListener(Application);
