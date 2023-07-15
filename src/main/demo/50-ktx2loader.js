//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//加载gltf模型
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

//GPU 纹理容器的加载程序
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'


import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module'

import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
let scene, camera, controls, renderer = null
let clock = new THREE.Clock()
let light

initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initModel()//创建物体

render()
/*

*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff, 0.6)
    light.position.set(10, 10, 10)
    light.castShadow = true
    scene.add(light)
}
// 初始化物体
function initModel() {

    // roomEnvironment
    const env=new RoomEnvironment()
    const pmremGenerator=new THREE.PMREMGenerator(renderer)
    scene.environment=pmremGenerator.fromScene(env).texture

    //npm i jest-cli
    //env.dispose()


    //网格
    const grid=new THREE.GridHelper(500,10,0xffffff,0xffffff)
    grid.material.opacity=0.5
    grid.material.depthWrite=false
    grid.material.transparent=true
    scene.add(grid)

    //加载模型
    const loader=new GLTFLoader().setPath('./models/gltf/')

    //纹理解压缩
    var ktx2Loader = new THREE.KTX2Loader();
    ktx2Loader.setTranscoderPath('./libs/basis/')
    ktx2Loader.detectSupport(renderer)

    loader.setKTX2Loader(ktx2Loader)
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load('coffeemat.glb',gltf=>{

    })
}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    controls.minDistance=400
    controls.maxDistance=1000
    controls.target.set(10,90,-16)
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper)
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.outputEncoding = THREE.sRGBEncoding
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    const delta = clock.getDelta()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background=new THREE.Color(0xbbbbbb)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
    camera.position.set(0, 100, 0)
    camera.updateProjectionMatrix()
}
window.addEventListener('resize', (e) => {
    //更新相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight
    //更新相机投影矩阵
    camera.updateProjectionMatrix()
    //更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    //更新渲染器像素比
    renderer.setPixelRatio(window.devicePixelRatio)
})


