import React from "react";
import ReactDOM from "react-dom";
import brace from 'brace';
import AceEditor from 'react-ace';
import Errors from "./errors";
import 'brace/mode/jsx';
import 'brace/theme/solarized_dark';
import {initialScript} from "../constants";
import renderReactToFrame from "../utils/render_react_to_frame";

import debounce from "debounce";
import Revisions from "./revisions";

class Application extends React.Component {

    constructor( props, context ) {
        super(props, context);
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
            showingRevisions: false,
            revisions: window.revisions || [],
            value: window.existingCode || initialScript
        };
        this.showRevisions = this.showRevisions.bind(this);
        this.hideRevisions = this.hideRevisions.bind(this);
        this.onFrameError = this.onFrameError.bind(this);
        this.clearFrameError = this.clearFrameError.bind(this);
        this.saveCode = this.saveCode.bind(this);
        this.textChanged = this.textChanged.bind(this);

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

    componentDidMount() {

        //update the window with the default script
        this.updateCode(this.state.value);

        let frame = this.refs.resultsFrame;
        if ( frame ) {



            //TODO this is a hack
            frame.contentWindow.React = window.React;
            frame.contentWindow.ReactDOM = window.ReactDOM;

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

    clearFrameError() {
        this.setState({frameError: null});
    }

    onFrameError( msg ) {
        this.setState({frameError: msg.message});
    }

    renderCode( code ) {
        let frame = this.refs.resultsFrame;
        if ( frame ) {
            renderReactToFrame(frame, code);
        }
    }

    renderWebpackCode( code, common ) {
        let frame = this.refs.resultsFrame;
        if ( frame ) {
            renderReactToFrame(frame, code, common);
        }
    }

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
                let codeToRender = `try{` + code + `
                (function(){
                var mountNode = document.getElementById('client_results');
                ReactDOM.render(React.createElement(Main),mountNode);})();

                if(window.__clearMessages) {
                     __clearMessages();
                }

            }catch(e){console.error(e)}`;
                this.renderCode(codeToRender);
            });

        }
    }

    updateCode() {
        if ( !this.state.compiling ) {
            this.socket.emit("code change", {
                code: this.state.value,
                bin: this.state.bin,
                revision: this.state.revision
            });
        }

    }

    textChanged( newValue ) {
        this.setState({value: newValue}, ()=> {
            this.updateCode();
        });
    }

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

    onKeyDown( event ) {
        if ( event.metaKey && event.keyCode === 83 ) {
            event.preventDefault();
            this.saveCode();
            return false;
        }

        return true;
    }

    saveCode() {
        let {bin,revision} = this.props.params;
        this.socket.emit("code save", {code: this.state.value, bin, revision});
    }

    hideRevisions() {
        this.setState({showingRevisions: false});
    }

    showRevisions() {
        this.setState({showingRevisions: true});
    }

    render() {
        return (
            <div className="app-container">

                <Revisions revision={this.state.revision} bin={this.state.bin} revisions={this.state.revisions}
                           showingRevisions={this.state.showingRevisions} hideRevisions={this.hideRevisions}/>

                <div className="app-inner">
                    <div id="editor">
                        <div className="toolbar">
                            <div className="toolbar-pad"></div>
                            <ul className="toolbar-controls">
                                {/*<li>{this.state.compiling?'Compiling...':'Not Compiling'} <i className={`fa fa-refresh ${this.state.compiling?'fa-spin':''}`}></i></li>*/}
                                <li onClick={this.updateCode}>Run <i className="fa fa-play"></i></li>
                                <li onClick={this.saveCode}>Save <i className="fa fa-save"></i></li>
                                <li onClick={this.showRevisions}>Revisions <i className="fa fa-file-text"></i></li>
                            </ul>
                        </div>
                        <AceEditor
                            mode="jsx"
                            theme="solarized_dark"
                            onChange={this.textChanged}
                            width="100%"
                            value={this.state.value}
                            height="100vh"
                            name="UNIQUE_ID_OF_DIV"
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

export default Application;
