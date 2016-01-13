import SidePanel from "./side_panel";
import React from "react";
import assign from "lodash.assign";

class JsPanel extends SidePanel {
    getDescription() {
        return "Add external JavaScript files that will be imported after React and ReactDOM, but before your code";
    }

    getTitle() {
        return "JavaScript Resources"
    }

    getContents() {
        return <div className="side-panel-form">
            {this.props.resources.map(r =><input className="side-panel-input" key={r} type="text" placeholder="Url to resource" value={r}/>)}
        </div>;
    }
}
JsPanel.propTypes = assign({
    resources: React.PropTypes.array.isRequired
}, SidePanel.propTypes);

export default JsPanel;