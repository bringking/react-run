import React from "react"

export default class Errors extends React.Component {

    constructor( props ) {
        super(props);
        this.state = {
            initialState: true,
            errorMessage: null,
            frameError: null
        };

    }

    componentDidMount() {
        this.props.socket.on("code error", this.onCodeError.bind(this));
        this.props.socket.on("code transformed", this.onCodeNormal.bind(this));
    }

    componentWillReceiveProps( nextProps ) {
        if ( nextProps.frameError ) {
            this.setState({frameError: nextProps.frameError, initialState: false});
        } else {
            this.setState({frameError: null});
        }
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
                className={`error-message ${this.state.initialState?'initial':'animated'} ${!this.state.errorMessage && !this.state.frameError ?"fadeOut":"fadeIn"}`}>{this.state.errorMessage || this.state.frameError}</div>
        );
    }
}
