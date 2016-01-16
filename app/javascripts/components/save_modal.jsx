/**
 * The SaveModal shows an overlay whenever the user saves their code
 * @param props
 * @constructor
 */
const SaveModal = ( props ) => <div
    className={`saved animated ${props.show ?'fadeIn':'fadeOut'}`}>
    Saved!
</div>;

export default SaveModal;