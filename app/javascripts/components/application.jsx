import React from "react";
import ReactDOM from "react-dom";
import brace from 'brace';
import AceEditor from 'react-ace';
import Errors from "./errors";
import 'brace/mode/jsx';
import 'brace/theme/solarized_dark';
import {initialScript} from "../constants";
import renderReactToFrame from "../utils/render_react_to_frame"
import debounce from "debounce";
import Revisions from "./revisions";

class Application extends React.Component {

    constructor( props, context ) {
        super(props, context);
        this.socket = io();

        //set the initial bin
        let [bin,revision] = props.params.splat.split("/");

        this.state = {
            bin,
            revision,
            showingRevisions: false,
            revisions: window.revisions || [],
            value: window.existingCode || initialScript
        };
        this.showRevisions = this.showRevisions.bind(this);
        this.hideRevisions = this.hideRevisions.bind(this);

        this.textChanged = this.textChanged.bind(this);

        this.socket.on("code transformed", this.onCodeChange.bind(this));
        this.socket.on("code saved", this.onCodeSaved.bind(this));

        //bind keyboard handlers
        document.addEventListener("keydown", this.onKeyDown.bind(this));

        //debounce the auto compile
        this.updateCode = debounce(this.updateCode.bind(this), 250);
    }

    componentDidMount() {
        //update the window with the default script
        this.textChanged(this.state.value);

        let frame = this.refs.resultsFrame;
        //TODO this is a hack
        frame.contentWindow.React = window.React;
        frame.contentWindow.ReactDOM = window.ReactDOM;
        //write the content
        frame.contentDocument.write(`<html>
        <head><title>Code</title></head>
        <body>
            <div id="results"></div>
        </body>
 </html>`);

    }

    renderCode( code ) {

        renderReactToFrame(this.refs.resultsFrame, code, this.socket.id);
    }

    onCodeChange( code ) {
        if ( code ) {
            this.renderCode(code);
        }
    }

    updateCode() {
        let code = this.state.value + `
                (function(){
                var mountNode = document.getElementById('results');
                ReactDOM.render(React.createElement(Main),mountNode);})();
            `;
        this.socket.emit("code change", code);
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
            this.setState({revisions, revision});

        }
    }

    onKeyDown( event ) {
        if ( event.metaKey && event.keyCode === 83 ) {
            let [bin,revision] = this.props.params.splat.split("/");
            event.preventDefault();
            this.socket.emit("code save", {code: this.state.value, bin, revision});
            return false;
        }
        return true;
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
                <Errors socket={this.socket}/>
            </div>);
    }
}

export default Application;
