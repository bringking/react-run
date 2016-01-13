import SidePanel from "./side_panel"

export default class JsPanel extends SidePanel {
    getDescription() {
        return "Add external JavaScript files that will be imported after React and ReactDOM, but before your code";
    }

    getTitle() {
        return "JavaScript Resources"
    }

    getContents() {
        return <div></div>;
    }
}
