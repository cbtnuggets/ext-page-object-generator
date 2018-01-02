String.prototype.toCamelCase = function() {
    return this.replace(/^([A-Z])|\s(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
};
function attachClick(e) {
	chrome.tabs.executeScript(null, {file: "selector.js"});
  chrome.tabs.executeScript(null,
    {code:"var all = document.getElementsByTagName('*');\
    for (var i=0, max=all.length; i < max; i++) {\
    	all[i].addEventListener(\"click\", function (e) {\
    		e.stopPropagation();\
        e.preventDefault();\
    		chrome.runtime.sendMessage({target: e.target, selector: UTILS.cssPath(e.target), putObject: true}, function(response) {console.log('Captured: ' + response.selector);});\
    	})\
    }"});
  chrome.tabs.executeScript(null,
      {code:'console.log("go")'});
  window.close();
}
function flushClick() {
  chrome.runtime.sendMessage({flushObject: true}, function(response) {
    processTemplate('');
  });
}
function processTemplate(text) {
  var pageObjectText = document.getElementById('page-object-text');
  var interpolated = `'use strict';
// lib/route/object-name.page.js
/*
    global browser
*/
let Page = require('../page');
let objectName = Object.create(Page, {
    ${text}
});
module.exports = objectName;
`;
  chrome.runtime.sendMessage({interpolatedText: interpolated}, function (response) {
    pageObjectText.value = interpolated;
  });
}
function update() {
  var text = '';
  var workingText = [];
  chrome.runtime.sendMessage({getObject: true}, function(response) {
    console.dir(response);
    for (var i = 0; i < response.map.length; i++) {
      var objectKey = response.map[i].selector;
      objectKey = objectKey.replace(/[#_().>:-]/g,' ');
      objectKey = objectKey.toCamelCase().replace(/[ ]/g,'');
      var selector = response.map[i].selector;
      workingText.push(`/* console.log('objectKey: ${objectKey}'); $$('${selector}') */
    ${objectKey}: {get: function () { return browser.element('${selector}'); }}`);
    }
    text = workingText.join(',\n    ');
    processTemplate(text)
  });
}
document.addEventListener('DOMContentLoaded', function () {
  var attach = document.getElementById('attach');
  var flush = document.getElementById('flush');
  var pageObjectText = document.getElementById('page-object-text');
  update();
  attach.addEventListener('click', attachClick);
  flush.addEventListener('click', flushClick);
});


