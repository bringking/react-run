import ListPanel from "./list_panel";

class JsPanel extends ListPanel {

    getPlaceHolder() {
        return "e.g. https://npmcdn.com/three.js";
    }

    getDescription() {
        return "Add external JavaScript files that will be imported after React and ReactDOM, but before your code";
    }

    getTitle() {
        return "JavaScript Resources"
    }


}

export default JsPanel;