/**
 * Created by sam on 31/08/2014.
 */

// Angular services and factories
angular.module('app.services', [])

    .factory('parserworker', function () {
        return function () {
            console.log('CREATING NEW PARSER WORKER');
    //        var worker = new Worker('js/parserWorker.js');
            worker.onmessage = function (e) {
            };

            return worker;
        }
    })
    // TODO: MODIFY SOCKET SERVICE
    .factory('Socket', function () {
        var ctrl = {};
        // //Initialize socket
        // //ctrl.urlSocket = 'http://bark.cse.lehigh.edu:3700';
        // ctrl.urlSocket = 'http://localhost:3700';
        // ctrl.socket = io.connect(ctrl.urlSocket);

        // ctrl.mouseCounter = 0;
        // //Get initial message from socket server
        // //Receiving data from socket server
        // ctrl.socket.on('message', function(data) {
        //     //welcome message
        //     console.log(data);
        //     if(data.message) {
        //         //Initialize the canvas for later use
        //         ctrl.canvas = document.getElementById("scene").children[0];
        //         ctrl.ctx = ctrl.canvas.getContext('2d');
        //         console.log(ctrl.ctx);
        //         //id
        //         console.log(ctrl.socket.socket.sessionid);
        //     }
        //     //processing data
        //     else if(data.mouseData) {
        //         //console.log(document.getElementById("layer2"));
        //         console.log(data);
        //         //if id === received id, the data is from self
        //         if(data.mouseData.id === ctrl.socket.socket.sessionid)
        //           console.log('This is from you!');
        //         //else, the data is from...
        //         else {
        //           //TODO: DRAW A POINTER BASED ON MOUSE DATA
        //           console.log(ctrl.ctx.canvas.clientWidth * data.mouseData.percentX);
        //           console.log(ctrl.ctx.canvas.clientHeight * data.mouseData.percentY);
        //           ctrl.ctx.fillRect(ctrl.ctx.canvas.clientWidth * data.mouseData.percentX,
        //             ctrl.ctx.canvas.clientHeight * data.mouseData.percentY
        //             ,10,10);
        //           //console.log('This is ' + ctrl.canvas.width);
        //           console.log('This is from: ' + data.mouseData.id);
        //         }
        //     }
        // });

        // ctrl.socket.on('newUser', function(data) {
        //   console.log(data);
        //   /*
        //   //if data of new user is different from self's id
        //   if(data.id != ctrl.socket.socket.sessionid)
        //     $scope.$apply(function(){
        //       ctrl.users.push({name: data.randomName, color: 'black'});
        //     });
        //   */
        //   $scope.$apply(function(){
        //     ctrl.users = data.users;
        //   });
        // });

        // ctrl.socket.on('queried', function(data) {
        //   console.log('sdasd');
        //   console.log('QUERIED: ' + data);
        // });

        // ctrl.socket.on('queriedControlData', function(data) {
        //   if(data.id == ctrl.socket.socket.sessionid) {
        //     console.log(controls);
        //     ctrl.socket.emit('sendControlData', {controls: controls});
        //   }
        // });
        //subscribes a room

        ctrl.subscribe = function (room) {
            ctrl.socket.emit('subscribe', {room: room});
        }

        //send controls data to other sockets
        ctrl.getControlData = function (id) {
            ctrl.scoket.emit('getControl', {id: id});
        }

        //return object with percentage of x and y with respect to the canvas
        ctrl.mousemove = function (e) {
            //console.log(e);
            ctrl.mouseCounter++;
            if (ctrl.mouseCounter == 50) {
                var mouseData = {id: ctrl.socket.socket.sessionid,
                    percentX: e.offsetX / e.target.clientWidth,
                    percentY: e.offsetY / e.target.clientHeight};
                ctrl.socket.emit('send', {mouseData: mouseData});
                ctrl.mouseCounter = 0;
            }
            else {
                //console.log('counter: ' + ctrl.mouseCounter);
            }

        };

        ctrl.queryUser = function (index) {
            ctrl.socket.emit('queryUser', {id: ctrl.users[index].id,
                name: ctrl.users[index].name});
            console.log('queryUser ' + ctrl.users[index].name);
        }

        ctrl.users = [];

        ctrl.test = function () {
            console.log('testing...');
        }

        return ctrl;
    })
    // Get unique color in steps
    .factory('Rainbow', function () {
        var rainbow = function (numOfSteps, step) {
            var r, g, b;
            var h = step / numOfSteps;
            var i = ~~(h * 6);
            var f = h * 6 - i;
            var q = 1 - f;
            switch (i % 6) {
                case 0:
                    r = 1, g = f, b = 0;
                    break;
                case 1:
                    r = q, g = 1, b = 0;
                    break;
                case 2:
                    r = 0, g = 1, b = f;
                    break;
                case 3:
                    r = 0, g = q, b = 1;
                    break;
                case 4:
                    r = f, g = 0, b = 1;
                    break;
                case 5:
                    r = 1, g = 0, b = q;
                    break;
            }
            var c = "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
            return (c);
        }
        return rainbow;
    })
