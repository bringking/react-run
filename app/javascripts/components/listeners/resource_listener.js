import React,{Component} from "react"
import JsPanel from "../js_panel";
import CssPanel from "../css_panel";
/**
 * The ResourceListener component handles co-locating components, but mixing the the sources state onto the
 * target as props
 * @param ComposedComponent
 * @constructor
 */
const JsResourceListener = ComposedComponent =>
    class extends Component {
        constructor() {
            super();

            this.state = {
                jsResources: window.jsResources,
                cssResources: window.cssResources,
                showingCss: false,
                showingJs: false
            }
        }

        /**
         * Event handler for CSS resource being added. Checks for duplicates and
         * then reconciles the CSS in the iFrame
         * @param resource
         */
        onAddCssResource = resource => {
            let cssResources = this.state.cssResources;
            if ( cssResources.indexOf(resource) === -1 ) {
                cssResources.push(resource);
                this.setState({cssResources});
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
            let cssResources = this.state.cssResources;
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
            cssResources[idx] = newVal;
            this.setState({cssResources});
        };

        /**
         * Event handler for JS resources being added. Checks for duplicates and
         * then reconciles the JS in the iFrame
         * @param resource
         */
        onAddJsResource = resource => {
            let jsResources = this.state.jsResources;
            if ( jsResources.indexOf(resource) === -1 ) {
                jsResources.push(resource);
                this.setState({jsResources});
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
            jsResources[idx] = newVal;
            this.setState({jsResources});
        };

        /**
         * Event handler for re-ordering JS resources
         * @param resource
         * @param direction
         */
        onReorderJsResource = ( resource, direction ) => {
            let jsResources = this.state.jsResources;
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
         * Hide all the overlay panels
         */
        hideAllPanels = ()=> {
            this.setState({showingRevisions: false});
        };

        render() {
            let {cssResources, jsResources} = this.state;
            return <div>
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
                <ComposedComponent {...this.props} {...this.state} toggleCss={this.toggleCss} toggleJs={this.toggleJs}/>
            </div>;
        }
    };

export default JsResourceListener;