import React from "react"

export default class Errors extends React.Component {

    constructor( props ) {
        super(props);
        this.state = {
            errorMessage: null
        };
        this.socket = io();

    }

    componentDidMount() {
        this.socket.on("code transformed", this.onCodeError.bind(this));
    }

    onCodeError( e ) {
        console.log(e);
        this.setState({errorMessage: e});
    }

    render() {
        return (
            <div className="error-message">{this.state.errorMessage}</div>
        );
    }
}
