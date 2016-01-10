import React from "react";
import ReactDOM from "react-dom";
import brace from 'brace';
import AceEditor from 'react-ace';
import Errors from "./errors";
import 'brace/mode/jsx';
import 'brace/theme/solarized_dark';

class Application extends React.Component {

    constructor( props ) {
        super(props);
        this.socket = io();
        this.state = {
            value: ""
        };
        this.textChanged = this.textChanged.bind(this);
        this.socket.on("code transformed", this.onCodeChange.bind(this));

        //bind keyboard handlers
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }

    onCodeChange( code ) {

        let result = code + `
var mountNode = document.getElementById('results');
ReactDOM.render(React.createElement(Main),mountNode);`;
        eval(result);
    }

    textChanged( newValue ) {
        this.setState({value: newValue}, ()=> {
            setTimeout(()=> {
                this.socket.emit("code change", this.state.value);
            }, 100)
        });
    }

    onKeyDown( event ) {
        //TODO implement this
        if ( event.metaKey && event.keyCode === 83 ) {
            event.preventDefault();
            this.socket.emit("code change", this.state.value);
            console.log("saving");
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
