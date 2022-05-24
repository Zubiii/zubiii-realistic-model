import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from "dat.gui"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { sRGBEncoding } from 'three'

// console.log(GLTFLoader)
// console.log(THREE)

// Initiate GLTFLoader
const gltfLoader = new GLTFLoader()

// For Environment Map
const cubeTextureLoader = new THREE.CubeTextureLoader()

// Size of Windows
const size = {
    width: innerWidth,
    hight: innerHeight
}

// Dat GUI
const gui = new dat.GUI()

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(75, size.width/size.hight)
camera.position.z = 10

// Get WEBGL
const canvas = document.querySelector(".webgl")

// Control
const control = new OrbitControls(camera, canvas)
control.enableDamping = true

// const mesh = new THREE.Mesh(
//     new THREE.SphereBufferGeometry(1,32, 32),
//     new THREE.MeshStandardMaterial()
// )
// scene.add(mesh)

// Environment Map
const environmentMap = cubeTextureLoader.load([
    "/environmentMaps/0/px.jpg",
    '/environmentMaps/0/nx.jpg',
    '/environmentMaps/0/py.jpg',
    '/environmentMaps/0/ny.jpg',
    '/environmentMaps/0/pz.jpg',
    '/environmentMaps/0/nz.jpg'
])
// environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap

/**
 * Load Flight Model
 */
 gltfLoader.load(
    //  "/model/damagedHelmet/DamagedHelmet.gltf",
     "/model/flightHelmet/FlightHelmet.gltf",
     (model) => {
        console.log(model);
        model.scene.scale.set(10, 10, 10)
        model.scene.position.set(0,-4,0)
        model.scene.rotation.y = Math.PI * 0.5
        scene.add(model.scene)

        gui.add(model.scene.rotation, 'y').name("Helmet Rotation").min(-Math.PI).max(Math.PI).step(0.001)
     }
 )


// Direction Light 
const directionalLight = new THREE.DirectionalLight( '#ffffff', 3)      // right light
// const directionalLight1 = new THREE.DirectionalLight( '#ffffff', 3)     // left light
directionalLight.position.set(0.25, 3, -2.25)
// directionalLight1.position.set(-0.25, 3, -2.25)
scene.add(
    directionalLight, 
    // directionalLight1
)

// Let's add tweaks to Dat GUI
gui.add(directionalLight, 'intensity').name("R_Light Intensity").min(0).max(10).step(0.001)
gui.add(directionalLight.position, 'x').name("R_light X").min(-5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').name("R_light Y").min(-5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').name("R_light Z").min(-5).max(5).step(0.001)

// gui.add(directionalLight1, 'intensity').name("L_Light Intensity").min(0).max(10).step(0.001)
// gui.add(directionalLight1.position, 'x').name("L_light X").min(-5).max(5).step(0.001)
// gui.add(directionalLight1.position, 'y').name("L_light Y").min(-5).max(5).step(0.001)
// gui.add(directionalLight1.position, 'z').name("L_light Z").min(-5).max(5).step(0.001)

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(size.width, size.hight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = sRGBEncoding
// renderer.toneMapping = THREE.LinearToneMapping
renderer.render(scene, camera)


// AnimationEffect
const Animation = () => {

    control.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(Animation)
}
Animation()