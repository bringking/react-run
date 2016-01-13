import React from "react"

export default class Errors extends React.Component {

    constructor( props ) {
        super(props);
        this.state = {
            initialState: true,
            errors: []
        };

    }

    componentDidMount() {
        this.props.socket.on("code error", this.onCodeError.bind(this));
        this.props.socket.on("code transformed", this.onCodeNormal.bind(this));
        this.props.socket.on("webpack transform", this.onCodeNormal.bind(this));

    }

    componentWillReceiveProps( nextProps ) {
        if ( nextProps.frameError ) {
            let errors = this.state.errors;

            if ( errors.indexOf(nextProps.frameError) === -1 ) {
                errors.push(nextProps.frameError);
                this.setState({frameError: true, errors, initialState: false});
            } else {
                this.setState({frameError: false, initialState: false});

            }

        }
    }

    onCodeNormal() {
        if ( !this.state.frameError ) {
            this.setState({errors: []});
        }
    }

    onCodeError( e ) {
        let errors = this.state.errors;
        if ( errors.indexOf(e) === -1 ) {
            errors.push(e);
            this.setState({errors, initialState: false});
        }

    }

    render() {

        let errors = this.state.errors.map(e=><p key={e}>{e}</p>);

        return (
            <div
                className={`error-message ${this.state.initialState ?'initial':'animated'} ${!this.state.errors.length ?"fadeOut":"fadeIn"}`}>{errors}</div>
        );
    }
}
