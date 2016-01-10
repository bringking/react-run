import React from "react";
import ReactDOM from "react-dom";

let _lastScript = null;
let _lastCode = "";

export default function renderReactToFrame( frame, code ) {

    //only change if code is different
    if ( code === _lastCode ) {
        return;
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
    frameScript.innerHTML = code;

    frame.contentDocument.body.appendChild(frameScript);
}