import React from "react";
import ReactSlider from 'react-slider';

/**
 * The StateBar will allow a slider to select an item from a list of state revision to allow
 * for time travel debugging
 */
export default class StateBar extends React.Component {
    constructor( props ) {
        super(props);
    }

    /**
     * Event handler for the slider value changing
     * @param value
     */
    onChange = ( value ) => {
        this.props.onSelectState(value);
    };

    render() {
        const {stateTransitions,selectedState} = this.props;
        const max = stateTransitions.length - 1;

        return (<div className="state-bar">
            <ReactSlider onChange={this.onChange} min={0} defaultValue={0} max={max}
                         value={selectedState}
                         orientation="vertical" withBars={true}/>
        </div>);
    }
}
