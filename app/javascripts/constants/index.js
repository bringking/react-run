export const initialScript = `/**
 * Welcome to React.run! The in-browser React testing environment.
 * This component is required for React.run to work,
 * and it your main Application entry point. You can feel free
 * to modify it and add other components. Enjoy!
 *
 * URL: Your React.run URL contains two segments
 * and matches the following pattern, www.react.run/:run.id/:revision.id
 * and are unique to each component and revision that you create.
 * The revision.id is updated every time you save.
 *
 * Toolbar: The toolbar above your code allows you to save your work and
 * view revisions of previous components you have created. Tip: You can
 * save your work by typing "cmd+s" or "window + s" on windows
 *
 * Globals Usage: Currently React.run exposes only two global variables for your use,
 * "React" and "ReactDOM". There are plans to add more soon!
 *
 * Built with love by http://rinconstrategies.io
 */
class Main extends React.Component {
    constructor(){
        super();
    }
    render() {
        return (<div>Welcome to React.run!</div>)
    }
}`;