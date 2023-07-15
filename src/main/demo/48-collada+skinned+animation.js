//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//加载 .dae格式模型
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'
//tween动画库
import TWEEN from '@tweenjs/tween.js'

let scene, camera, controls, renderer = null
let clock = new THREE.Clock()
let light
let grid

let mixer

initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initModel()//创建物体

/*

*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(50, 50, 50)
    light.castShadow = true
    scene.add(light)
}
// 初始化物体
function initModel() {

    //创建网格
    grid = new THREE.GridHelper(20, 20)
    scene.add(grid)

    new ColladaLoader().load(
        './models/collada/stormtrooper/stormtrooper.dae',
        collada => {
            const model=collada.scene
            scene.add(model)
            model.traverse(child=>{
                if(child.isSkinnedMesh){
                    //几何体视锥剔除
                    child.frustumCulled=false
                }
            })

            //动作
            mixer=new THREE.AnimationMixer(model)
            const animations=model.animations
            const action=mixer.clipAction(animations[0])
            action.play()
            render()
        })



}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.outputEncoding = THREE.sRGBEncoding
    // renderer.autoClear = true//定义renderer是否清除颜色缓存
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render(time) {
    const delta = clock.getDelta()
    mixer.update(delta)
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 10, -15)
    camera.lookAt(0, 4, 0)
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


