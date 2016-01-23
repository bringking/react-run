import SelectPanel from "./panels/select_panel";

/**
 * The ThemePanel represents the list of themes for the user to choose from
 */
class ThemePanel extends SelectPanel {

    getTitle() {
        return "Editor Themes"
    }

}

export default ThemePanel;