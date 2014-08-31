/**
 * Created by sam on 31/08/2014.
 */
// Angular Directives
angular.module('app.directives', [])
    .directive('fileread', function () {
        return {
            scope: {
                fileread: '='
            },
            link: function (scope, el, attrs) {
                el.bind('change', function (changeEvent) {
                    var file = changeEvent.target.files[0];
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            //run passed-in func after reader is loaded
                            scope.fileread(file, loadEvent.target.result);
                        });
                    }
                    reader.readAsText(file);
                })
            }
        }
    })
    //create a draggable directive
    .directive('draggable', function () {
        return function (scope, element) {
            //give the JS object
            var el = element[0];

            el.draggable = true;

            el.addEventListener(
                'dragstart',
                function (e) {
                    console.log('dragging', scope.item.id)
                    e.dataTransfer.effectAllowed = 'move';

                    e.dataTransfer.setData('id', scope.item.id);
                    this.classList.add('drag');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragend',
                function (e) {
                    this.classList.remove('drag');
                    return false;
                },
                false
            );
        }
    })

    //droppable directive
    .directive('droppable', function () {
        return {
            link: function (scope, element, attrs) {
                var el = element[0];

                el.addEventListener(
                    'dragover',
                    function (e) {
                        e.dataTransfer.dropEffect = 'move';

                        //allow to drop
                        if (e.preventDefault) e.preventDefault();
                        this.classList.add('over');
                        return false;
                    }, false);

                el.addEventListener(
                    'dragenter',
                    function (e) {
                        this.classList.add('over');
                        return false;
                    }, false);

                el.addEventListener(
                    'dragleave',
                    function (e) {
                        this.classList.remove('over');
                        return false;
                    }, false);

    //      el.addEventListener(
    //        'drop',
    //        function(e) {
    //          if(e.stopPropagation) e.stopPropagation();
    //
    //          this.classList.remove('over');
    //
    //          var source = e.dataTransfer.getData('id');
    //          console.log('target:', scope.item.id, 'source:', source);
    //          //apply drop handler in the controller
    //          return false;
    //        }, false);
            }
        }
    })

    .directive('ondrop', function () {
        return {
            scope: {
                ondrop: '=',
                item: '@'
            },
            link: function (scope, element, attrs) {
                var el = element[0];
                el.addEventListener(
                    'drop',
                    function (e) {
                        if (e.stopPropagation) e.stopPropagation();
                        this.classList.remove('over');
                        var source = e.dataTransfer.getData('id');
                        console.log('target:', scope.item, 'source:', source);
                        return scope.ondrop('U', source, scope.item); //scope.item is target
                    },
                    false);
            }
        }
    });