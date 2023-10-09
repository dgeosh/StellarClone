import * as THREE from 'three';

// factors here

let motionFactor = 5;
let diameterFactor = 0.1;

let updateGeometry = true;

const evaluate = document.querySelector("#evaluate");

$("#sequenceContainer").hide();

$("#evaluate").click(async () => {
    const url = "";
    //////////////////////////////SET URL FOR BACKEND
    // gravity
    const gravitySlider = document.querySelector("#gravity").value - 1;
    motionFactor = (-4/14)*gravitySlider + 5;

    // diameter
    const diameterSlider = document.querySelector("#diameter").value - 1;
    diameterFactor = (0.5/14)*diameterSlider + 0.1;
    updateGeometry = true;

    // radation
    const radationSlider = document.querySelector("#radiation").value;

    // temperature
    const temperatureSlider = document.querySelector("#temperature").value;

    const data = {
        grav: gravitySlider,
        diam: diameterSlider,
        rad: radiationSlider,
        temp: temperatureSlider
    };

    var res = await fetch(url, {
        method: "POST",
        mode: "cors", 
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    process(await res.json());
})

async function process(params){
    //do stuff
}

$("#changeMode").click(() => {
    $("canvas").toggle();
    $("#sequenceContainer").toggle();
})

// graphics Here
const scene = new THREE.Scene();
scene.background = new THREE.Color( 1, 1, 1 );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.PointLight( 'white', 1 );
light.position.set( 100, 150, 300 );
scene.add( light );

let n = 20, boneSize = 10, size = n * boneSize, bones = [];

for(let i = 0; i <= n; i++) {
    bones[i] = new THREE.Bone();
    if( i ) bones[i-1].add( bones[i] );
    bones[i].position.x = i ? boneSize : -size/2;
}

let clock = new THREE.Clock( true );

let skeleton = new THREE.Skeleton( bones );

let geometry = new THREE.SphereGeometry(size/2,60,120,0,Math.PI).rotateZ(Math.PI/4).scale(1,0.1,diameterFactor),
skinIndices = [],
skinWeights = [];

let pos = geometry.getAttribute( 'position' );

for(let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) + size / 2,
        bone = Math.floor(Math.min(x/boneSize,n)),
        k = (x/boneSize) % 1;

    let cos = Math.cos(Math.PI*2/3*(k-0.5));

    if (k < 0.5) {
        skinIndices.push( bone, Math.max(bone-1,0), 0, 0 );
    }
    else {
        skinIndices.push( bone, Math.min(bone+1,n), 0, 0 );
        skinWeights.push( cos, 1-cos, 0, 0 );
    }
}

geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

let material = new THREE.MeshPhongMaterial({color: 0x00ff00, flatShading:true, shininess:150}),
				tapeworm = new THREE.SkinnedMesh( geometry, material );
				tapeworm.add( skeleton.bones[0] );
				tapeworm.bind( skeleton );
				tapeworm.position.x = size/10;

scene.add( tapeworm );

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

camera.position.z = 100;

window.addEventListener( 'resize', onWindowResize, false );
			onWindowResize();
			
			function onWindowResize( event )
			{
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight, true );
			}

function animate() {
    requestAnimationFrame( animate );

    let time = clock.getElapsedTime();
    
    tapeworm.rotation.z = -0.1*Math.cos( 1.9*time );
    tapeworm.position.y = -10.2*Math.cos( 1.9*time );

    for( var i = 1; i<=n; i++ )
    {
        skeleton.bones[i].rotation.x = degrees_to_radians( i*0.2*Math.cos(0.2*time+i*i) );
        skeleton.bones[i].rotation.z = degrees_to_radians( i*motionFactor*Math.sin(1.9*time-i) ); // modify the 5 in this line to get more constrained wriggling
    }

    skeleton.bones[0].rotation.z = degrees_to_radians( 20*Math.cos(1.9/2*time) );
    skeleton.bones[1].rotation.z = -skeleton.bones[0].rotation.z/2;
    skeleton.bones[2].rotation.z = -skeleton.bones[0].rotation.z/2;

    if (updateGeometry) {
        tapeworm.geometry.dispose();
        let geometry = new THREE.SphereGeometry(size/2,60,120,0,Math.PI).rotateZ(Math.PI/4).scale(1,0.1,diameterFactor);
        let pos = geometry.getAttribute( 'position' );
    
        for(let i = 0; i < pos.count; i++) {
            let x = pos.getX(i) + size / 2,
                bone = Math.floor(Math.min(x/boneSize,n)),
                k = (x/boneSize) % 1;
    
            let cos = Math.cos(Math.PI*2/3*(k-0.5));
    
            if (k < 0.5) {
                skinIndices.push( bone, Math.max(bone-1,0), 0, 0 );
            }
            else {
                skinIndices.push( bone, Math.min(bone+1,n), 0, 0 );
                skinWeights.push( cos, 1-cos, 0, 0 );
            }
        }
    
        geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
        geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );
        tapeworm.geometry = geometry;
    }
    updateGeometry = false;

    renderer.render( scene, camera );
}
animate();