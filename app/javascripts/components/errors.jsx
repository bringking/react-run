import React, {PropTypes} from "react"

/**
 * The Errors modules is responsible for listening to the socket for
 * code transformation errors and displaying them to the user
 */
class Errors extends React.Component {

    constructor( props ) {
        super(props);
        this.state = {
            initialState: false,
            errorMessage: "Hello",
            frameError: null
        };

    }

    componentDidMount() {
        //this error is effectively a build time error, meaning
        // babel failed to transpile the code on the server
        this.props.socket.on("code error", this.onCodeError);
        //this event will happen if the code successfully transformed,
        //thus any previous build error is resolved.
        this.props.socket.on("code transformed", this.onCodeNormal);

        this.props.socket.on("webpack transform", this.onCodeNormal);

    }

    componentWillReceiveProps( nextProps ) {
        if ( nextProps.frameError ) {
            this.setState({frameError: nextProps.frameError, initialState: false});
        } else {
            this.setState({frameError: null});
        }
    }

    /**
     * Event handler for code returning to normal
     */
    onCodeNormal = ()=> {
        this.setState({errorMessage: "ets"});
    };

    /**
     * Event handler for receiving an error from the socket
     * @param e
     */
    onCodeError = ( e ) => {

        if ( e !== this.state.errorMessage ) {
            this.setState({errorMessage: e, initialState: false});
        }

    };

    render() {
        return (
            <div
                className={`error-message ${this.state.initialState?'initial':'animated'} ${!this.state.errorMessage && !this.state.frameError ?"fadeOut":"fadeIn"}`}>{this.state.errorMessage || this.state.frameError}</div>
        );
    }
}

Errors.propTypes = {
    onErrorReceived: PropTypes.func,
    onErrorCleared: PropTypes.func
};

export default Errors;
