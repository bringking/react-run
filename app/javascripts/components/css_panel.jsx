import SidePanel from "./side_panel"
export default class CssPanel extends SidePanel {
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
