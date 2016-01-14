import React from "react";
import ReactSlider from 'react-slider';

export default class StateBar extends React.Component {
    constructor( props ) {
        super(props);

        this.state = {
            value: 0
        }
    }

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
