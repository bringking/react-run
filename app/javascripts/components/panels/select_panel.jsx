import SidePanel from "./side_panel";
import React from "react";
import assign from "lodash.assign";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

/**
 * The SelectPanel represents a side panel component for selecting from a list of items
 */
class SelectPanel extends SidePanel {
    constructor() {
        super();

        this.state = {
            open: false,
            size: ''
        };
    }

    getContents() {
        return <div className="side-panel-form">
            <ReactCSSTransitionGroup component="ul" transitionName="side-panel-item-animation"
                                     transitionEnterTimeout={500}
                                     transitionLeaveTimeout={300}>
                {this.props.items.map(( i, idx ) => {
                    return <li className={`select-panel-item ${this.props.selectedItem === i ?'active':''}`} key={idx}
                               onClick={this.props.onSelectItem.bind(null,i)}>{i}</li>
                })}
            </ReactCSSTransitionGroup>
        </div>;
    }
}

SelectPanel
    .propTypes = assign({
    onSelectItem: React.PropTypes.func.isRequired,
    selectedItem: React.PropTypes.string.isRequired,
    items: React.PropTypes.array.isRequired
}, SidePanel.propTypes);

export
default
SelectPanel;