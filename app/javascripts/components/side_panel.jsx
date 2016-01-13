import React from "react"
/**
 * The SidePanel class represents a side panel launched in the toolbar
 */
class SidePanel extends React.Component {
    constructor() {
        super();

        this.state = {
            open: false
        };

        this.saveChanges = this.saveChanges.bind(this);
        this.getContents = this.getContents.bind(this);
        this.getTitle = this.getTitle.bind(this);
        this.getDescription = this.getDescription.bind(this);
    }

    getDescription() {
        return "";
    }

    getTitle() {
        return "";
    }

    /**
     * Default getContents, returns no inner content
     * @returns {null}
     */
    getContents() {
        return null;
    }

    /**
     * Default implementation, no-op
     */
    saveChanges() {
        this.props.onClose();
    }

    render() {
        const {open,onClose} = this.props;
        return (<div className={`side-panel ${open?'open':''} large`}>
                <h3>{this.getTitle()} <i className="fa fa-close" onClick={onClose}></i></h3>
                <p>{this.getDescription()}</p>
                <div className="side-panel-inner">
                    {this.getContents()}
                </div>
            {/*<div className="side-panel-buttons">
                    <button className="side-panel-button" onClick={this.saveChanges}>Save changes</button>
                </div>*/}
            </div>
        );
    }
}

SidePanel.propTypes = {
    onClose: React.PropTypes.func.isRequired,
    open: React.PropTypes.bool.isRequired
};

export default SidePanel;