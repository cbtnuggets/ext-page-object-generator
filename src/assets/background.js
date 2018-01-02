var objectMap = [];
var stashText = '';
var statusList = {
  IDLE: 'IDLE',
  ATTACHED: 'ATTACHED'
}
String.prototype.toCamelCase = function() {
    return this.replace(/^([A-Z])|\s(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
};
chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    var currentStatus = window.localStorage.getItem('PAGE_OBJECT_STATUS')
    if (currentStatus === statusList.ATTACHED) {
      var arrayFill = []
      var id = tab.id
      console.log('id '+ id)
      var existingEntries = window.localStorage.getItem('PAGE_OBJECT_ACTIVE_TABS') || JSON.stringify(arrayFill)
      existingEntries = JSON.parse(existingEntries)
      for (var i = existingEntries.length - 1; i >= 0; i--) {
        if (existingEntries[i] == id) {
          existingEntries.splice(i, 1)
          window.localStorage.setItem('PAGE_OBJECT_STATUS', statusList.IDLE)
          break
        }
      }
      existingEntries = JSON.stringify(existingEntries)
      window.localStorage.setItem('PAGE_OBJECT_ACTIVE_TABS', existingEntries)
    }
});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if (request.selector && request.putObject === true) {
      // console.dir(request);
      var objectKey = request.selector
      objectKey = objectKey.replace(/[#_().>:-]/g,' ')
      objectKey = objectKey.toCamelCase().replace(/[ ]/g,'')
      request['name'] = objectKey
      var existingEntries = window.localStorage.getItem('PAGE_OBJECT_ELEMENTS') || JSON.stringify(objectMap)
      existingEntries = JSON.parse(existingEntries)
      existingEntries.push(request)
      // console.dir(existingEntries);
      existingEntries = JSON.stringify(existingEntries)
      window.localStorage.setItem('PAGE_OBJECT_ELEMENTS', existingEntries)
    	sendResponse({status:'success', selector: request.selector, sentBy: sender})
  	} else if (request.getObject === true) {
      // console.log('getObject');
      var existingEntries = window.localStorage.getItem('PAGE_OBJECT_ELEMENTS') || JSON.stringify(objectMap)
      existingEntries = JSON.parse(existingEntries)
      // console.dir(existingEntries);
  		sendResponse({status:'success', map:existingEntries, sentBy: sender})
    } else if (request.flushObject === true) {
      objectMap = []
      objectMap = JSON.stringify(objectMap)
      // console.dir(objectMap)
      window.localStorage.setItem('PAGE_OBJECT_ELEMENTS', objectMap)
      sendResponse({status:'success', map:objectMap, sentBy: sender})
    }
  });