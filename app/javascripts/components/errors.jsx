import React from "react"

export default class Errors extends React.Component {

    constructor( props ) {
        super(props);
        this.state = {
            initialState: true,
            errorMessage: null
        };

    }

    componentDidMount() {
        this.props.socket.on("code error", this.onCodeError.bind(this));
        this.props.socket.on("code transformed", this.onCodeNormal.bind(this));

    }

    onCodeNormal() {
        this.setState({errorMessage: null});
    }

    onCodeError( e ) {

        if ( e !== this.state.errorMessage ) {
            this.setState({errorMessage: e, initialState: false});
        }

    }

    render() {
        return (
            <div
                className={`error-message ${this.state.initialState?'initial':'animated'} ${!this.state.errorMessage ?"fadeOut":"fadeIn"}`}>{this.state.errorMessage}</div>
        );
    }
}
