import React,{Component} from "react"
import JsPanel from "./js_panel";
import CssPanel from "./css_panel";
import ThemePanel from "./theme_panel"
import ReactRunner from "./react_runner";
import Revisions from "./revisions";
//listeners
import NpmListener from "./listeners/npm_listener"
//themes for brace
import themes from 'themes';

/**
 * The Application component is the root level component that composes our main application parts
 * target as props
 * @param ComposedComponent
 * @constructor
 */
class Application extends Component {
    constructor( props ) {
        super(props);

        //set the initial bin
        let {bin,revision} = props.params;

        this.state = {
            theme: window.currentTheme || "solarized_dark",
            available_themes: themes,
            bin,
            revision,
            revisions: window.revisions || [],
            showingRevisions: false,
            jsResources: window.jsResources,
            cssResources: window.cssResources,
            showingTheme: false,
            showingCss: false,
            showingJs: false
        }
    }

    /**
     * Hide the revisions popover
     */
    hideRevisions = () => {
        this.setState({showingRevisions: false});
    };
    /**
     * Show the revisions popover
     */
    showRevisions = () => {
        this.setState({showingRevisions: true});
    };
    /**
     * Toggle the revision panel
     */
    toggleRevisions = () => {
        this.setState({showingRevisions: !this.state.showingRevisions});
    };

    /**
     * Event handler for CSS resource being added. Checks for duplicates and
     * then reconciles the CSS in the iFrame
     * @param resource
     */
    onAddCssResource = resource => {
        let cssResources = this.state.cssResources;
        if ( cssResources.indexOf(resource) === -1 ) {
            this.setState({cssResources: cssResources.concat([resource])});
        }
    };

    /**
     * Event handler for deleting CSS resources
     * @param resource
     */
    onDeleteCssResource = resource => {
        let cssResources = this.state.cssResources.filter(r => r !== resource);
        this.setState({cssResources});
    };

    /**
     * Event handler for re-ordering CSS resources
     * @param resource
     * @param direction
     */
    onReorderCssResource = ( resource, direction ) => {
        let cssResources = [].concat(this.state.cssResources);
        let idx = cssResources.indexOf(resource);
        let newIdx = direction === "up"
            ? Math.max(idx - 1, 0)
            : Math.min(idx + 1, cssResources.length);

        cssResources.splice(idx, 1);
        cssResources.splice(newIdx, 0, resource);

        //move item up or down
        this.setState({cssResources});

    };

    /**
     * Event handler for updating a CSS resource
     * @param oldVal
     * @param newVal
     */
    onCssItemUpdated = ( oldVal, newVal ) => {
        let cssResources = this.state.cssResources;
        let idx = cssResources.indexOf(oldVal);

        this.setState({
            cssResources: cssResources.map(( v, _idx ) => {
                if ( _idx === idx ) {
                    return newVal
                }
                return v;
            })
        });
    };

    /**
     * Event handler for JS resources being added. Checks for duplicates and
     * then reconciles the JS in the iFrame
     * @param resource
     */
    onAddJsResource = resource => {
        let jsResources = this.state.jsResources;
        if ( jsResources.indexOf(resource) === -1 ) {
            this.setState({jsResources: jsResources.concat([resource])});
        }
    };

    /**
     * Event handler for updating a JS resource
     * @param oldVal
     * @param newVal
     */
    onJsItemUpdated = ( oldVal, newVal ) => {
        let jsResources = this.state.jsResources;
        let idx = jsResources.indexOf(oldVal);
        this.setState({
            jsResources: jsResources.map(( v, _idx ) => {
                if ( idx === _idx ) {
                    return newVal;
                }
                return v;
            })
        });
    };

    /**
     * Event handler for re-ordering JS resources
     * @param resource
     * @param direction
     */
    onReorderJsResource = ( resource, direction ) => {
        let jsResources = [].concat(this.state.jsResources);
        let idx = jsResources.indexOf(resource);
        let newIdx = direction === "up"
            ? Math.max(idx - 1, 0)
            : Math.min(idx + 1, jsResources.length);

        jsResources.splice(idx, 1);
        jsResources.splice(newIdx, 0, resource);

        //move item up or down
        this.setState({jsResources});
    };

    /**
     * Event handler for deleting JS resources
     * @param resource
     */
    onDeleteJsResource = resource => {
        let jsResources = this.state.jsResources.filter(r => r !== resource);
        this.setState({jsResources});
    };

    /**
     * Toggle the CSS panel
     */
    toggleCss = () => {
        let showing = this.state.showingCss;
        this.setState({showingCss: !showing, showingJs: false});
    };

    /**
     * Toggle the JS panel
     */
    toggleJs = () => {
        let showing = this.state.showingJs;
        this.setState({showingJs: !showing, showingCss: false});
    };

    /**
     * Toggle the Theme panel
     */
    toggleTheme = () => {
        let showing = this.state.showingTheme;
        this.setState({showingTheme: !showing, showingCss: false, showingJs: false, showingRevisions: false});
    };

    /**
     * Hide all the overlay panels
     */
    hideAllPanels = ()=> {
        this.setState({showingTheme: false, showingRevisions: false, showingJs: false, showingCss: false});
    };

    /**
     * Add a revision to the revision set
     * @param rev
     */
    addRevision = ( rev ) => {
        let revisions = this.state.revisions;
        this.setState({revision: rev.hash, revisions: revisions.concat([rev])});
    };

    /**
     * Set the selected theme
     * @param theme
     */
    onSelectTheme = ( theme ) => {
        this.setState({theme});
    };

    render() {
        let {showingTheme, cssResources, jsResources, showingRevisions,showingCss,showingJs} = this.state;
        return <div className={`app-container ${this.state.theme}`}>
            <Revisions revision={this.state.revision} bin={this.state.bin} revisions={this.state.revisions}
                       showingRevisions={showingRevisions} hideRevisions={this.hideRevisions}/>
            <CssPanel onUpdateItem={this.onCssItemUpdated} onReorderItem={this.onReorderCssResource}
                      onDelete={this.onDeleteCssResource}
                      onAdd={this.onAddCssResource} resources={cssResources}
                      open={this.state.showingCss}
                      onClose={this.toggleCss}/>
            <JsPanel onUpdateItem={this.onJsItemUpdated} onReorderItem={this.onReorderJsResource}
                     onDelete={this.onDeleteJsResource}
                     onAdd={this.onAddJsResource} resources={jsResources}
                     open={this.state.showingJs}
                     onClose={this.toggleJs}/>
            <ThemePanel onClose={this.toggleTheme}
                        open={this.state.showingTheme}
                        selectedItem={this.state.theme}
                        items={this.state.available_themes}
                        onSelectItem={this.onSelectTheme}/>
            <ReactRunner {...this.props} {...this.state}
                editorClassName={`${showingTheme || showingRevisions || showingCss || showingJs  ?'fade':''}`}
                onEditorFocus={this.hideAllPanels} toggleCss={this.toggleCss}
                toggleJs={this.toggleJs}
                toggleTheme={this.toggleTheme}
                theme={this.state.theme}
                toggleRevisions={this.toggleRevisions} addRevision={this.addRevision}/>
        </div>;
    }
}

export default NpmListener(Application);