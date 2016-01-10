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
        this.textChanged(this.state.value);
    }

    renderCode( code ) {
        renderReactToFrame('results', code);
    }

    onCodeChange( code ) {
        if ( code ) {
            this.renderCode(code);
        }
    }

    updateCode() {
        this.socket.emit("code change", this.state.value);
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
            <div>
                <Errors/>
                <AceEditor
                    mode="jsx"
                    theme="solarized_dark"
                    onChange={this.textChanged}
                    width="100%"
                    value={this.state.value}
                    height="100vh"
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{$blockScrolling: true}}
                /></div>);
    }
}
export default Application;
