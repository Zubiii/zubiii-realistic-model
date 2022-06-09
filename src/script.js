import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from "dat.gui"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { Raycaster, sRGBEncoding } from 'three'
import { gsap } from 'gsap'

// console.log(GLTFLoader)
// console.log(THREE)

// if scene ready then show points
let sceneReady = false

//fetch loading element
const allLoading = document.querySelector('.loading-bar')

// Loading Manager
const loadingManager = new THREE.LoadingManager(
    // Loaded
    ()=>{
        
        window.setTimeout(()=>{
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
            allLoading.classList.add('ended')
            allLoading.style.transform = ''
        }, 500)

        window.setTimeout(()=>{
            sceneReady = true
        }, 2000)
        // console.log("Loaded!");
    }, 
    // Progress
    (url,loadedItems, totalItems)=>{
        const percentage = loadedItems / totalItems
        // console.log("Progress:", percentage);
        allLoading.style.transform = `scale(${percentage})`
    })

// Initiate GLTFLoader
const gltfLoader = new GLTFLoader(loadingManager)

// For Environment Map
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

// Size of Windows
const size = {
    width: innerWidth,
    hight: innerHeight
}

// Dat GUI
const gui = new dat.GUI()
gui.closed = true           // default gui will be closed

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeomatery = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main(){
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main(){
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeomatery, overlayMaterial)
scene.add(overlay)



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
     "/model/damagedHelmet/DamagedHelmet.gltf",
    //  "/model/flightHelmet/FlightHelmet.gltf",
     (model) => {
        // console.log(model);
        model.scene.scale.set(4, 4, 4)
        model.scene.position.set(0,0,0)
        // model.scene.rotation.y = Math.PI * 0.5
        scene.add(model.scene)

        gui.add(model.scene.rotation, 'y').name("Helmet Rotation").min(-Math.PI).max(Math.PI).step(0.001)
     }
 )

/**
 * Raycaster for points hidden
 */
const raycaster = new Raycaster()

/**
 * fetch Move right
 */
const rightMove = document.querySelector('.right-angle')

 /**
  * Points of Intrest
  */
 const points = [
    {
        position: new THREE.Vector3(1.7, 0.3, 2),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(-1.7, -1.3, 2),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(0, -1.3, -2),
        element: document.querySelector('.point-2')
    }
 ]


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
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = sRGBEncoding
renderer.toneMapping = THREE.LinearToneMapping
renderer.render(scene, camera)


// AnimationEffect
const Animation = () => {
    // console.log("Zubiii");
    control.update()

    // if scene ready then add the points
    if(sceneReady){
        // Control the points 
        for(const point of points){
            // console.log("Point:", point);
            const screenPosition = point.position.clone()
            screenPosition.project(camera)
            // console.log("screenPosition: ", screenPosition)

            // set raycaster as at camera position 
            raycaster.setFromCamera(screenPosition, camera)
            const intersect = raycaster.intersectObjects(scene.children, true)

            // if nothing intersects then show the points
            if(intersect.length === 0){
                point.element.classList.add('visible')
            }else{
                const intersectionDistance = intersect[0].distance
                const pointDistance = point.position.distanceTo(camera.position)
                // console.log("intersectionDistance: ", intersectionDistance, "pointDistance: ", pointDistance)

                if(intersectionDistance>pointDistance){                     // LOGIC:: if the intersection distance is more then visible else hide
                    point.element.classList.add('visible')
                }else{
                    point.element.classList.remove('visible')
                }
            }

            const translateX = screenPosition.x * size.width * 0.5
            const translateY = - screenPosition.y * size.hight * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
            // console.log("translateX:", translateX);
        }

        // Let's visible right angle
        rightMove.classList.add('visible')
    }

    renderer.render(scene, camera)
    window.requestAnimationFrame(Animation)
}
Animation()