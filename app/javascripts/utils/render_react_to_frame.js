import React from "react";
import ReactDOM from "react-dom";

let _lastScript = null;
let _lastCode = "";

export default function renderReactToFrame( target, code ) {

    //only change if code is different
    if ( code === _lastCode ) {
        return;
    }

    var frameNode = document.getElementById(target);
    let frame = document.getElementById("resultsFrame");
    if ( !frame ) {
        frame = document.createElement("iframe");
        frame.id = "resultsFrame";
        frame.width = '100%';
        frame.height = '100%';
        frame.frameborder = 0;
        frame.src = 'about:blank';

        //update the frame
        frameNode.appendChild(frame);

        //write the content
        frame.contentDocument.write(`<html>
        <head><title>Code</title></head>
        <body>
            <div id="results"></div>
        </body>
 </html>`);

        //TODO this is a hack
        frame.contentWindow.React = window.React;
        frame.contentWindow.ReactDOM = window.ReactDOM;
    }

    //remove the old script
    if ( _lastScript ) {
        let oldFrame = frame.contentDocument.getElementById(_lastScript);
        frame.contentDocument.body.removeChild(oldFrame);
    }

    //create our script tag
    let frameScript = frame.contentDocument.createElement("script");
    frameScript = frame.contentDocument.createElement("script");
    frameScript.id = "script_" + Date.now();
    _lastScript = frameScript.id;

    //update the script
    frameScript.innerHTML = code + `(function(){
                var mountNode = document.getElementById('results');
                ReactDOM.render(React.createElement(Main),mountNode);
            })()`;

    frame.contentDocument.body.appendChild(frameScript);
}