/**
 * The NpmMessage shows an overlay whenever the server is installing NPM modules
 * @param props
 * @constructor
 */
const NpmMessage = ( props ) => {
    if ( !props.npmMessage ) {
        return <div/>;
    }
    return <div className={`npm-message`}>
        props.npmMessage} <i className="fa fa-circle-o-notch fa-spin"></i>
    </div>
};

export default NpmMessage;