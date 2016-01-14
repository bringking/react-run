import ListPanel from "./list_panel";

class CssPanel extends ListPanel {

    getPlaceHolder() {
        return "e.g. https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css";
    }

    getDescription() {
        return "Add external CSS resources that will be added to the head of your application";
    }

    getTitle() {
        return "CSS Resources"
    }

}

export default CssPanel;