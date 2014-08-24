/**
 * Created by sam on 29/07/2014.
 */
// =====================================================
// WORKER FOR ASYNC PDB SPHERE RENDERER ================
// =====================================================
(function(){
    // import THREE library
     importScripts('three.js', 'geometry.js');


    var methods = {
        'shout': function (message) {
            return message + ' shouted!';
        }
    }

    /** function to add object to a scene of THREEJS - pdb */
    methods.addPdbObject = function(atoms, centroid, color) {
        var config = {
            radius: {
                'C' : 1.7,
                'N' : 1.5,
                'S' : 1.8,
                'O' : 1.5,
                'H' : 1.2,
                'OTH' : 1.9 //unrecognized atom types
            },  //TODO: dynamic radius
            colors: {
                'N' : 'blue',
                'S' : 'yellow',
                'O' : 'red',
                'H' : 'white',
            },
            defaultColor : color,
            segments: 10, //drop to 10 - 12
            rings: 6 //drop to 6
        };

        var sphereGeometry;
        //material to make the final sphere
        var sphereMaterial = new THREE.MeshLambertMaterial({color: color});

        //TODO: is loop through each atom to get radius beforehand efficient?
        atoms.forEach(function(atom) {
            if (!config.radius[atom.element]) {
                atom.radius = config.radius['OTH'];
            }
            else {
                atom.radius = config.radius[atom.element];
                //if the known element is not carbon
                if (atom.element !== 'C') {
                }
            }
        });
        console.log('RETURN GEOMETRY');
        return new THREE.BulkSphereGeometry(atoms, config.segments, config.rings);
//        console.log(sphereGeometry);
//        //create a mesh
//        var mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
//        mesh.position.set(-centroid[0], -centroid[1], -centroid[2]);
//
//        // =====================================================
//        // PUT THIS IN ANGULAR CONTROLLER ======================
//        // =====================================================
//        //add sphereGeometry to scene
////        scene.add(mesh);
//        console.log('RETURN MESH');
//        // Return mesh
//        return mesh;
    };

    self.addEventListener('message', function (ev) {
        console.log('WORKER - request message received from main')
        console.log(ev);
        var data = ev.data;
        var params = data.params;

        // if such operation exists, do something
        if(methods[data.op]) {
            this.result = methods[data.op](params.atoms, params.centroid, params.color);
        }
        else
            this.result = 'NO SUCH OP'; // No such operation

//        this.jResult = JSONfn.stringify(this.result);
        console.log(this.result);
        // Send back result
        console.log('SENDING BACK RESULT FROM WORKER');
        for(var prop in this.result){
//            self.postMessage({'prop': prop, 'data': this.result[prop]});
            self.postMessage({'prop' : prop, data: this.result[prop]});
        }
    }, false);
})();