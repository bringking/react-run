export const initialScript = `
/**
 * Welcome to React Bin! The in-browser React testing environment.
 * This component is required for React Bin to work,
 * and it your main Application entry point. You can feel free
 * to modify it and add other components. Enjoy!
 *
 * Globals Usage: Currently React Bin exposes only two global variables for your use,
 * "React" and "ReactDOM". There are plans to add more soon!
 */
class Main extends React.Component {
    constructor(){
        super();
    }
    render() {
        return (<div>Welcome to React Bin!</div>)
    }
}`;