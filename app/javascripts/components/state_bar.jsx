import React from "react";
import ReactSlider from 'react-slider';

/**
 * The StateBar will allow a slider to select an item from a list of state revision to allow
 * for time travel debugging
 */
export default class StateBar extends React.Component {
    constructor( props ) {
        super(props);

        this.state = {
            value: 0
        }
    }

    /**
     * Event handler for the slider value changing
     * @param value
     */
    onChange = ( value ) => {
        this.props.onSelectState(value);
    };

    render() {
        const {value} = this.state;
        const {stateTransitions} = this.props;
        return (<div className="state-bar">


            <ReactSlider onChange={this.onChange} max={stateTransitions.length - 1}
                         defaultValue={0}
                         orientation="vertical" withBars={true}/>

        </div>);
    }
}
