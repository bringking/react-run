import React from "react";
import loopProtect from 'loop_protect';

let _lastScript = null;
let _lastCode = "";

// setup loop protection
loopProtect.alias = 'protect';

export default function renderReactToFrame(frame, code, onLoopDetected = () => true, common) {

  //only change if code is different
  if (code === _lastCode) {
    return;
  }

  //remove the old script
  if (_lastScript) {
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
    const protectedCode = code.includes('//react-run no-loop-protect') ? code : loopProtect(code);
    frameScript.innerHTML = protectedCode;

    // attach handler
    loopProtect.hit = onLoopDetected;
    frame.contentWindow.protect = loopProtect;

    //append the user code
    frame.contentDocument.body.appendChild(frameScript);
  }

  //inject common, if not already present
  if (common) {
    let oldCommon = frame.contentDocument.getElementById("commons");
    if (oldCommon) {
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