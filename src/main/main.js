import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, renderer,container
let controls
init()
initMeshes()
/**
    多相机的使用：
    1.创建Mesh
    3.增加相机
    4.设置视口
    5.设置裁剪区域
    6.添加正交相机

 
 */


function init() {

    scene = new THREE.Scene()
    scene.background=new THREE.Color(0x888888)
    scene.add(new THREE.AxesHelper(300))

    container = document.getElementById('container')
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)
    renderer.setAnimationLoop(animate)

    // 相机1
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000)
    camera.position.set(1000,1000,1000)

    // 摄像机视锥体的长宽比
    camera.aspect =window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();


    //轨道控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    window.addEventListener('resize', onWindowResize)
}

function initMeshes() {

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate(times) {
    controls.update()
    renderer.render(scene, camera);
}
