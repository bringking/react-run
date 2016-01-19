//deps
import React from "react";
import ReactDOM from "react-dom";
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/jsx';
import 'brace/theme/solarized_dark';
import defaultsDeep from "lodash.defaultsdeep";
import ComponentTree from "react-component-tree";
import isEqual from "lodash.isequal";
import difference from "lodash.difference";

//utilities
import {initialScript, babelFrameScript} from "../constants";
import frameContent from "../constants/frame_content";

import renderReactToFrame from "../utils/render_react_to_frame";
import debounce from "debounce";

//child components
import Errors from "./errors";
import StateBar from "./state_bar";
import SaveModal from "./save_modal";
import NpmMessage from "./npm_message";
import Toolbar from "./toolbar";

/**
 * The ReactRunner component takes a user input into a code window and renders the output to
 * an adjacent ```<iframe/>```. The component also takes an array of JS and CSS resources to render into
 * the frame in the head and body respectively.
 */
class ReactRunner extends React.Component {

    constructor( props, context ) {
        super(props, context);

        //store a reference to the socket
        this.socket = io();

        this.state = {
            saveState: window.savedState,
            stateTransitions: [],
            selectedState: 0,
            justSaved: false,
            frameError: null,
            autoRun: false,
            value: window.existingCode || initialScript
        };

        //socket events
        //TODO Would like to refactor these into higher order components, similar to the NpmListener
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

        let frame = this.refs.resultsFrame;
        if ( frame ) {

            frame.contentWindow.defaultsDeep = defaultsDeep;
            frame.contentWindow.ComponentTree = ComponentTree;
            frame.contentWindow.initialState = this.state.saveState;
            //write the content
            const frameDocument = frame.contentWindow.document;
            frameDocument.open();
            frameDocument.write(this.getFrameContent());
            frameDocument.close();

            //This is our "bridge" to the frame, setup callbacks to
            //this code in the frame
            frame.contentWindow.getPreviousState = this.getPreviousFrameState;
            frame.contentWindow.__onStateChange = this.onStateChange;
            frame.contentWindow.__clearMessages = this.clearFrameError;
        }

        //add intial state
        if ( this.state.saveState ) {
            let stateTransitions = this.state.stateTransitions;
            stateTransitions.push(this.state.saveState);
            this.setState({stateTransitions}, ()=> {
                //update the window with the default script
                this.updateCode(this.state.value);
            })
        } else {
            //update the window with the default script
            this.updateCode(this.state.value);
        }

    }

    componentDidUpdate( prevProps, prevState ) {

        if ( !isEqual(this.props.cssResources, prevProps.cssResources) ) {
            this.reconcileCss();
        }
        if ( !isEqual(this.props.jsResources, prevProps.jsResources) ) {
            this.reconcileScripts();
        }

    }

    enableStateReplacement = ( state ) => {
        let frame = this.refs.resultsFrame;
        frame.contentWindow.initialState = state;
    };

    /**
     * Get the contents to write to the frame content. Takes into account the users added
     * css and js resources
     */
    getFrameContent = () => {
        return frameContent(this.props.cssResources, this.props.jsResources);
    };

    /**
     * Reconcile the frames head <link> tags with the new resources from the CSS resources state
     */
    reconcileCss() {
        let frame = this.refs.resultsFrame;
        let head = frame.contentWindow.document.getElementsByTagName("head")[0];

        //cleanup
        //TODO- this doesn't scale if we want to have other meta data in the head
        head.innerHTML = "";

        //re-add
        if ( this.props.cssResources.length ) {
            head.innerHTML = `${this.props.cssResources.map(r =>'<link class="injected-style" rel="stylesheet" href="' + r + '"/>').join('\n')}`;
        }

    }

    /**
     * Reconcile the frames 'injected-scripts' with the new scripts from the jsResources
     */
    reconcileScripts() {
        let frame = this.refs.resultsFrame;
        let scripts = frame.contentWindow.document.getElementById("injected-scripts");
        //clear the previous scripts
        scripts.innerHTML = "";
        //re-add
        if ( this.props.jsResources.length ) {
            scripts.innerHTML = `${this.props.jsResources.map(r =>'<script type="text/javascript" src="' + r + '"></script>').join('\n')}`;
        }

    }

    onStateChange = ( newState ) => {
        //are we supposed to be tracking state?
        if ( this.state.saveState ) {
            let stateTransitions = this.state.stateTransitions;
            let lastState = stateTransitions[stateTransitions.length - 1];
            if ( !isEqual(newState, lastState) ) {
                stateTransitions.push(newState);
                //store the state change
                this.setState({stateTransitions, selectedState: stateTransitions.length - 1});
            }

        }
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
            this.enableStateReplacement(this.state.saveState);
        }

        //emit the change
        this.socket.emit("code change", {
            code: this.state.value,
            bin: this.state.bin,
            jsResources: this.props.jsResources,
            cssResources: this.props.cssResources,
            revision: this.state.revision
        });

    };

    /**
     * Event handler for when text in the editor has changed
     * @param newValue
     */
    onTextChanged = ( newValue ) => {
        this.setState({value: newValue}, ()=> {
            if ( this.state.autoRun ) {
                this.updateCode();
            }
        });
    };

    /**
     * Event handler for code being successfully saved on the server
     * @param data
     */
    onCodeSaved = ( data ) => {
        let {bin,revision,createdAt} = data;
        if ( bin && revision ) {
            //update the URL
            this.props.history.push({
                pathname: `/${bin}/${revision}`
            });

            //store in revisions
            this.props.addRevision({hash: revision, createdAt});

            //show the save modal
            this.setState({justSaved: true}, ()=> {
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
        if ( event.metaKey && event.keyCode === 13 ) {
            event.preventDefault();
            this.updateCode();
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
            jsResources: this.props.jsResources,
            cssResources: this.props.cssResources,
            code: this.state.value,
            bin,
            revision,
            state: this.state.saveState ? this.serializeFrameState() : null
        });
    };

    /**
     * Toggle the "save"/"track" of the users state, then
     * update the code
     */
    setPreserveState = ()=> {
        let saveState = this.state.saveState;
        let stateTransitions = this.state.stateTransitions;

        if ( saveState ) {
            saveState = null;
            stateTransitions.length = 0;
        } else {
            saveState = this.serializeFrameState();
            stateTransitions = [saveState];
        }

        this.setState({saveState, stateTransitions}, ()=> {
            this.updateCode();
        });
    };

    /**
     * Toggle the auto-compilation of the code as you type
     */
    toggleAutoRun = ()=> {
        let autoRun = this.state.autoRun;
        this.setState({autoRun: !autoRun});
    };
    /**
     * Event handler for selecting a particular  state
     * @param idx
     */
    onSelectState = ( idx ) => {
        let frame = this.refs.resultsFrame;
        let requestedState = this.state.stateTransitions[idx];

        if ( frame.contentWindow.reRenderWithState && requestedState ) {
            this.setState({selectedState: idx}, ()=> {
                return frame.contentWindow.reRenderWithState(requestedState);
            });
        }
    };

    render() {
        return (
            <div className="app-container">
                <div className="app-inner">
                    <div id="editor" className={this.props.editorClassName}>
                        <Toolbar saveState={this.state.saveState}
                                 autoRun={this.state.autoRun}
                                 onToggleAutoRun={this.toggleAutoRun}
                                 onClickRunCode={this.updateCode}
                                 onClickPreserveState={this.setPreserveState}
                                 onClickSaveCode={this.saveCode}
                                 onClickToggleCss={this.props.toggleCss}
                                 onClickToggleJs={this.props.toggleJs}
                                 onClickShowRevisions={this.props.toggleRevisions}/>
                        <Errors
                            socket={this.socket}
                            frameError={this.state.frameError}/>
                        <AceEditor
                            mode="jsx"
                            theme="solarized_dark"
                            onFocus={this.props.onEditorFocus}
                            onChange={this.onTextChanged}
                            value={this.state.value}
                            name="editor_window"
                            showPrintMargin={false}
                            editorProps={{$blockScrolling: true}}
                        />
                        {this.state.saveState && this.state.stateTransitions.length ?
                            <StateBar onSelectState={this.onSelectState} selectedState={this.state.selectedState}
                                      stateTransitions={this.state.stateTransitions}/>
                            : null}
                    </div>
                    <div id="results">
                        <iframe
                            className={this.state.saveState && this.state.stateTransitions.length ? 'showing-state':''}
                            frameBorder="0" ref="resultsFrame" src="about:blank" id="resultsFrame"></iframe>
                        {this.state.saveState && this.state.stateTransitions.length ?
                            <div className="selected-state-window">
                                <h3>Active state</h3>
                                <pre
                                    dangerouslySetInnerHTML={{__html:JSON.stringify(this.state.stateTransitions[this.state.selectedState], null,4)}}></pre>
                            </div>
                            : null}
                    </div>
                </div>
                <NpmMessage npmMessage={this.props.npmMessage}/>
                <SaveModal show={this.state.justSaved}/>
            </div>);
    }
}

ReactRunner.propTypes = {
    editorClassName: React.PropTypes.string,
    cssResources: React.PropTypes.array.isRequired,
    jsResources: React.PropTypes.array.isRequired
};

export default ReactRunner;
