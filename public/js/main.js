var worker = new Worker('js/worker.js');
worker.addEventListener('message', function(e){
    console.log(e.data);
}, false)