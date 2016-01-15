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

        this.getContents = this.getContents.bind(this);
        this.getTitle = this.getTitle.bind(this);
        this.getDescription = this.getDescription.bind(this);
    }

    /**
     * Default implementation of the description block
     * @returns {string}
     */
    getDescription() {
        return "";
    }

    /**
     * Default implementation of the title block
     * @returns {string}
     */
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

    render() {
        const {open,onClose} = this.props;
        return (<div className={`side-panel ${open?'open':''} large`}>
                <h3>{this.getTitle()} <i className="fa fa-close" onClick={onClose}></i></h3>
                <p>{this.getDescription()}</p>
                <div className="side-panel-inner">
                    {this.getContents()}
                </div>
            </div>
        );
    }
}

SidePanel.propTypes = {
    onClose: React.PropTypes.func.isRequired,
    open: React.PropTypes.bool.isRequired
};

export default SidePanel;