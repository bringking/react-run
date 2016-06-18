import React, { PropTypes } from "react"

/**
 * The Errors modules is responsible for listening to the socket for
 * code transformation errors and displaying them to the user
 */
class Errors extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      initialState: true,
      errorMessage: null,
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
    //this event will happen if the code successfully transformed with webpack,
    //thus any previous build error is resolved.
    this.props.socket.on("webpack transform", this.onCodeNormal);

  }

  componentWillReceiveProps(nextProps) {

    let nextState = {};
    if (nextProps.loopError || nextProps.frameError) {
      nextState.initialState = false;
    }

    this.setState({ frameError: nextProps.frameError, loopError: nextProps.loopError, ...nextState });

  }

  /**
   * Event handler for code returning to normal
   */
  onCodeNormal = ()=> {
    this.setState({ errorMessage: null });
  };

  /**
   * Event handler for receiving an error from the socket
   * @param e
   */
  onCodeError = (e) => {

    if (e !== this.state.errorMessage) {
      this.setState({ errorMessage: e, initialState: false });
    }

  };

  render() {
    //no errors
    if (!this.state.errorMessage && !this.state.frameError && !this.state.loopError) {
      return <div></div>
    }

    // show the loopError, only if there is no error or frameError
    if (this.state.loopError && (!this.state.errorMessage && !this.state.frameError)) {
      return <div
        className="error-message warning-message animated fadeIn"
        dangerouslySetInnerHTML={{__html:this.state.loopError}}></div>
    }
    //show the error
    if (this.state.frameError) {
      return (
        <div
          className="error-message animated fadeIn"><h1>Runtime Error:</h1><p>{this.state.frameError}</p></div>
      );
    }

    return (
      <div
        className="error-message animated fadeIn"><h1>Compile Error:</h1><p>{this.state.errorMessage}</p></div>
    );
  }
}

Errors.propTypes = {
  onErrorReceived: PropTypes.func,
  onErrorCleared: PropTypes.func
};

export default Errors;
