import React from "react";
import ReactDOM from "react-dom";
import brace from 'brace';
import AceEditor from 'react-ace';
import SplitLayout from "react-split-layout";
import Errors from "./errors";
import 'brace/mode/jsx';
import 'brace/theme/solarized_dark';
import {initialScript} from "../constants";
import renderReactToFrame from "../utils/render_react_to_frame"
import debounce from "debounce";

class Application extends React.Component {

    constructor( props ) {
        super(props);
        this.socket = io();
        this.state = {
            value: initialScript
        };
        this.textChanged = this.textChanged.bind(this);
        this.socket.on("code transformed", this.onCodeChange.bind(this));

        //bind keyboard handlers
        document.addEventListener("keydown", this.onKeyDown.bind(this));

        //debounce the auto compile
        this.updateCode = debounce(this.updateCode.bind(this), 250);
    }

    componentDidMount() {
        //update the window with the default script
        this.textChanged(this.state.value);
    }

    renderCode( code ) {

        renderReactToFrame('results', code, this.socket.id);
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

    onKeyDown( event ) {
        if ( event.metaKey && event.keyCode === 83 ) {
            event.preventDefault();
            this.socket.emit("code change", this.state.value);
            return false;
        }
        return true;
    }

    render() {
        return (
            <SplitLayout split="vertical">
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
                <div id="results">
                    <iframe src="about:blank" id="resultsFrame"></iframe>
                </div>
            </SplitLayout>);
    }
}
export default Application;
