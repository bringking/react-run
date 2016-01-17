/**
 * The initialScript is the script that shows in the initial window
 */
export const initialScript = `/**
 * Welcome to the React.run beta! The in-browser React testing environment.
 * This "Main" component is required for React.run to work,
 * and it is your main Application entry point. You can feel free
 * to modify it and add other components. Enjoy!
 *
 * URL: Your React.run URL contains two segments
 * and matches the following pattern, www.react.run/:run.id/:revision.id
 * and are unique to each component and revision that you create.
 * The revision.id is updated every time you save.
 *
 * State: React.run can persist your app state changes
 * when you code by checking "Track state". As an added bonus,
 * React.run will save your components state to the
 * server and rehydrate it as well!!
 *
 * Toolbar: The toolbar above your code allows you to save your work, run your code
 * and add external JS/CSS.
 *
 * Keyboard: You can save your work by typing "cmd+s" or "window + s" on windows. You can
 * run your code by typing "cmd+enter" or "window + enter" on windows.
 *
 * Globals Usage: Currently React.run exposes only two global
 * variables for your use, "React" and "ReactDOM".
 * There are plans to add more soon!
 *
 * This is a beta so expect more features soon!
 * Built with love by http://rinconstrategies.io
 */
class Main extends React.Component {
    constructor(){
        super();
    }
    styles(){
        return {
            height:"100%",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontFamily:"Helvetica, Arial, sans-serif",
            fontSize:"24px"
        }
    }
    render() {
        return (<div style={this.styles()}>Welcome to React.run!</div>)
    }
}`;

/**
 * The babelFrameScript is our script that gets injected into the running frame
 * @param code
 */
export const babelFrameScript = ( code ) =>`try{` + code + `

                //app mount node
                var mountNode = document.getElementById('client_results');

                var MainComponent;
                if (window.initialState) {
                    //render component with user initial state
                    MainComponent = ComponentTree.render({
                      component: Main,
                      snapshot: window.initialState || {},
                      container: mountNode
                    });
                } else {
                    MainComponent = ReactDOM.render(React.createElement(Main),mountNode);
                }

                //clear the window initialState, since we don't need it anymore
                window.initialState = null;

                //add the ability to get state
                window.getState = function(){
                     var currentState = ComponentTree.serialize(MainComponent);
                     return currentState;
                };
                //clear any frame errors on load
                if (window.__clearMessages) {
                     __clearMessages();
                }

            }catch(e){console.error(e)}`;