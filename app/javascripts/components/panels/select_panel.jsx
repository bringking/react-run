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

    componentDidMount() {
        //bind keyboard handlers
        document.addEventListener("keydown", this.onKeyDown);
        //focus this element
        this.refs.sidePanel.focus();
    }

    componentWillUnmount() {
        //bind keyboard handlers
        document.removeEventListener("keydown", this.onKeyDown);
    }

    /**
     * Select the next item in the list
     */
    selectNext = ()=> {
        let currentIdx = this.props.items.indexOf(this.props.selectedItem);
        let nextIdx = Math.min(currentIdx + 1, this.props.items.length);
        this.props.onSelectItem(this.props.items[nextIdx]);
    };
    /**
     * Select the previous item in the list
     */
    selectPrevious = () => {
        let currentIdx = this.props.items.indexOf(this.props.selectedItem);
        let nextIdx = Math.max(currentIdx - 1, 0);
        this.props.onSelectItem(this.props.items[nextIdx]);
    };
    /**
     * Event handler for keyboard events
     * @param event
     * @returns {boolean}
     */
    onKeyDown = ( event ) => {

        if ( event.keyCode === 38 ) {
            event.preventDefault();
            this.selectPrevious();
            return false;
        }
        if ( event.keyCode === 40 ) {
            event.preventDefault();
            this.selectNext();
            return false;
        }
    };

    getContents() {
        return <div className="side-panel-form" ref="sidePanel">
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