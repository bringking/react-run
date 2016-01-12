import React from "react";
import ReactDOM from "react-dom";

let _lastScript = null;
let _lastCode = "";

export default function renderReactToFrame( frame, code, common ) {

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
    frameScript.id = "script_" + Date.now();

    //inject user code
    function injectCode() {
        //store the last script
        _lastScript = frameScript.id;

        //update the script
        frameScript.innerHTML = code;

        //append the user code
        frame.contentDocument.body.appendChild(frameScript);
    }

    //inject common, if not already present
    if ( common ) {
        let oldCommon = frame.contentDocument.getElementById("commons");
        if ( oldCommon ) {
            frame.contentDocument.body.removeChild(oldCommon);
        }
        let commons = frame.contentDocument.createElement("script");
        commons.id = "commons";
        frame.contentDocument.body.appendChild(commons);
        commons.onload = function() {
            injectCode();
        };
        commons.src = common;
    } else {
        injectCode();
    }
}