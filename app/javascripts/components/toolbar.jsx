import {PropTypes} from "react"

const Toolbar = ( props )=> <div className="toolbar">
    <ul className="toolbar-controls">
        <li onClick={props.onToggleAutoRun}>Auto Run? {props.autoRun ?
            <i className="fa fa-check-square"></i> : <i className="fa fa-square"></i> }</li>

        <li onClick={props.onClickPreserveState}>Track State {props.saveState ?
            <i className="fa fa-check-square"></i> : <i className="fa fa-square"></i> }</li>

        <li onClick={props.onClickRunCode}>Run <i className="fa fa-play"></i></li>
        <li onClick={props.onClickSaveCode}>Save <i className="fa fa-save"></i></li>
        <li onClick={props.onClickToggleCss}>CSS Resources <i className="fa fa-css3"></i>
        </li>
        <li onClick={props.onClickToggleJs}>JS Resources <i className="fa fa-code"></i>
        </li>
        <li onClick={props.onClickShowRevisions}>Revisions <i className="fa fa-file-text"></i></li>
        <li onClick={props.onClickToggleTheme}>Theme <i className="fa fa-adjust"></i></li>
    </ul>
</div>;

Toolbar.propTypes = {
    saveState: PropTypes.any,
    onToggleAutoRun: PropTypes.func,
    onClickPreserveState: PropTypes.func,
    onClickRunCode: PropTypes.func,
    onClickSaveCode: PropTypes.func,
    onClickToggleTheme: PropTypes.func,
    onClickToggleCss: PropTypes.func,
    onClickToggleJs: PropTypes.func,
    onClickShowRevisions: PropTypes.func
};

export default Toolbar;