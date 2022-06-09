import './style.css'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as dat from 'dat.gui'
// let's add GLTF 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// lets add Draco loader
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
const clock = new THREE.Clock()


// if scene ready then show points
let sceneReady = false

//fetch loading element
const allLoading = document.querySelector('.loading-bar')

const canvas = document.querySelector(".webgl")

// Scree Sizes
const size = {
    width: innerWidth,
    height: innerHeight
}
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, size.width/size.height)

const parameters = {
    color: '#ffffff',
    wireframe: false,
    light: '#ffffff' 
}

/**
 * Model GLTF
 */
 const gltfLoader = new GLTFLoader()

// Floor
let mixer = null
const createScene = () => {

    gltfLoader.load(
        '/models/brainstem/brainstem.gltf',
            (gltf) => { 
            console.log(gltf);
            mixer = new THREE.AnimationMixer(gltf.scene)
            const action = mixer.clipAction(gltf.animations[0])
            action.play()
            gltf.scene.scale.set(0.4, 0.4, 0.4)
            gltf.scene.position.set(0,-0.4,0)
            scene.add(gltf.scene)
        },
        (error) => { console.log("error: ", error); }
    )
    console.log(gltfLoader);

}
createScene()

// Camera positions
camera.position.z = 1

// Add light  
const light = new THREE.AmbientLight(parameters.light)
light.intensity = 2
// const directionalLight = new THREE.DirectionalLight(parameters.light)
scene.add(light)

const controls = new OrbitControls(camera,canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(size.width, size.height)
renderer.render(scene, camera)

// left back
const leftMove = document.querySelector('.left-angle')
window.setTimeout(()=>{
    leftMove.classList.add('visible')
}, 1500)

let previousTime = 0
const AnimationEffect = () => {

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update Mixer
    if(mixer){
        mixer.update(deltaTime)
    }

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(AnimationEffect)

}
AnimationEffect()