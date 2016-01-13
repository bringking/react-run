import SidePanel from "./side_panel";
import React from "react";
import assign from "lodash.assign";

class CssPanel extends SidePanel {
    getDescription() {
        return "Add external CSS files that will be added to the head of the document";
    }

    getTitle() {
        return "CSS Resources"
    }

    getContents() {
        return <div></div>;
    }
}

CssPanel.propTypes = assign({
    resources: React.PropTypes.array.isRequired
}, SidePanel.propTypes);

export default CssPanel;