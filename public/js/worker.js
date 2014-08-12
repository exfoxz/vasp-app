/**
 * Created by sam on 29/07/2014.
 */
(function(){
    importScripts('parser.js');
    self.addEventListener('message', function (ev) {
        self.postMessage('You said:');
        self.postMessage(ev.data);
    }, false);
})();