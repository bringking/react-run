import SidePanel from "./side_panel";
import React from "react";
import assign from "lodash.assign";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class JsPanel extends SidePanel {
    constructor( props ) {
        super(props);

        this.state = {
            open: false,
            toAdd: "",
            editing: {},
            edited: {}
        };

    }

    componentWillReceiveProps( nextProps ) {
        if ( nextProps.open ) {
            this.focusFormElement();
        }
    }

    focusFormElement() {
        this.refs.addInput.focus();
    }

    getDescription() {
        return "Add external JavaScript files that will be imported after React and ReactDOM, but before your code";
    }

    getTitle() {
        return "JavaScript Resources"
    }

    onChange = event => {
        this.setState({toAdd: event.target.value})
    };

    onSubmit = event => {
        event.preventDefault();
        this.props.onAdd(this.state.toAdd);
        this.setState({toAdd: ""});
    };

    onDeleteItem( item ) {
        let editing = this.state.editing;
        let edited = this.state.edited;

        if ( editing[item] ) {
            editing[item] = null;
        }
        if ( edited[item] ) {
            edited[item] = null;
        }
        this.setState({edited, editing}, ()=> {
            this.props.onDelete(item);
        });

    }

    onEditItem( item ) {
        let editing = this.state.editing;
        let edited = this.state.edited;

        if ( !editing[item] ) {
            editing[item] = item;
            edited[item] = item;
        }

        this.setState({editing, edited});
    }

    onSaveItem( item ) {
        let editing = this.state.editing;

        editing[item] = null;

        this.setState({editing});
    }


    getContents() {
        return <div className="side-panel-form">
            <ReactCSSTransitionGroup transitionName="side-panel-item-animation" transitionEnterTimeout={500}
                                     transitionLeaveTimeout={300}>
                {this.props.resources.map(r =><div className="side-panel-listing" key={r}>
                    {this.state.editing[r] ? <input className="side-panel-input" value={this.state.edited[r]}/> :
                        <div className="side-panel-listing-left">{r}</div>}
                    <div className="side-panel-listing-right">
                        <i className="fa fa-close" onClick={this.onDeleteItem.bind(this,r)}></i>
                        {this.state.editing[r] ?
                            <i className="fa fa-check" onClick={this.onSaveItem.bind(this,r)}></i> :
                            <i className="fa fa-edit" onClick={this.onEditItem.bind(this,r)}></i>}
                        <i className="fa fa-arrow-up" onClick={this.props.onReorderItem.bind(null,r,"up")}></i>
                        <i className="fa fa-arrow-down" onClick={this.props.onReorderItem.bind(null,r,"down")}></i>

                    </div>
                </div>)}
            </ReactCSSTransitionGroup>
            <form onSubmit={this.onSubmit}>
                <input ref="addInput" name="toAdd" className="side-panel-input" type="text"
                       placeholder="e.g. https://npmcdn.com/three.js"
                       value={this.state.toAdd} onChange={this.onChange}/>
            </form>
        </div>;
    }
}
JsPanel.propTypes = assign({
    onReorderItem: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onAdd: React.PropTypes.func.isRequired,
    resources: React.PropTypes.array.isRequired
}, SidePanel.propTypes);

export default JsPanel;