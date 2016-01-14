import SidePanel from "./side_panel";
import React from "react";
import assign from "lodash.assign";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class ListPanel extends SidePanel {
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

    onChange = event => {
        this.setState({toAdd: event.target.value})
    };

    onSubmit = event => {
        event.preventDefault();
        if ( this.state.toAdd.length ) {
            this.props.onAdd(this.state.toAdd.trim());
            this.setState({toAdd: ""});
        }
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

    onEditItem( item,idx ) {
        let editing = this.state.editing;
        let edited = this.state.edited;

        if ( !editing[item] ) {
            editing[item] = item;
            edited[item] = {oldVal: item, newVal: item};
        }



        this.setState({editing, edited},()=>{
            this.refs[`input_${idx}`].focus();
        });
    }

    onSaveItem( item ) {
        let editing = this.state.editing;
        let edited = this.state.edited;
        editing[item] = null;

        //persist
        this.props.onUpdateItem(edited[item].oldVal, edited[item].newVal);
        edited[item].oldVal = edited[item].newVal;

        this.setState({editing, edited});
    }

    onItemChange( item, event ) {
        let edited = this.state.edited;
        edited[item].newVal = event.target.value;
        this.setState({edited});

    }

    getContents() {
        return <div className="side-panel-form">
            <ReactCSSTransitionGroup transitionName="side-panel-item-animation" transitionEnterTimeout={500}
                                     transitionLeaveTimeout={300}>
                {this.props.resources.map((r,idx) =><div className="side-panel-listing" key={r}>
                    {this.state.editing[r] ? <input ref={`input_${idx}`} className="side-panel-input" value={this.state.edited[r].newVal}
                                                    onChange={this.onItemChange.bind(this,r)}/> :
                        <p className="side-panel-listing-left">{r}</p>}
                    <div className="side-panel-listing-right">
                        <i className="fa fa-close" onClick={this.onDeleteItem.bind(this,r)}></i>
                        {this.state.editing[r] ?
                            <i title="Save Item" className="fa fa-check"
                               onClick={this.onSaveItem.bind(this,r)}></i> :
                            <i title="Edit Item" className="fa fa-edit" onClick={this.onEditItem.bind(this,r,idx)}></i>}
                        <i title="Move Up" className="fa fa-arrow-up"
                           onClick={this.props.onReorderItem.bind(null,r,"up")}></i>
                        <i title="Move Down" className="fa fa-arrow-down"
                           onClick={this.props.onReorderItem.bind(null,r,"down")}></i>

                    </div>
                </div>)}
            </ReactCSSTransitionGroup>
            <form onSubmit={this.onSubmit}>
                <div className="side-panel-input-container">
                    <input ref="addInput" name="toAdd" className="side-panel-input large" type="text"
                           placeholder={this.getPlaceHolder()}
                           value={this.state.toAdd} onChange={this.onChange}/>
                    <button className="side-panel-button" type="submit" role="submit">
                        Add
                    </button>
                </div>
            </form>
        </div>;
    }
}

ListPanel
    .propTypes = assign({
    onUpdateItem: React.PropTypes.func.isRequired,
    onReorderItem: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onAdd: React.PropTypes.func.isRequired,
    resources: React.PropTypes.array.isRequired
}, SidePanel.propTypes);

export
default
ListPanel;