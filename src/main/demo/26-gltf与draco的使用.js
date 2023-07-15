//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//模型加载器
import { GLTFLoader } from 'three//examples/jsm/loaders/GLTFLoader'
//解压模型器
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
let scene, camera, controls, renderer = null
let mixer
let clock=new THREE.Clock()
initCamera()
initLights()
initRenderer()
initEnvironment()

initUtils()
initMeshes()

loadModel()

render()



//初始化灯光
function initLights() {
    scene.add(new THREE.HemisphereLight(0xffffff,0x444444))//环境光
   
}
//创建物体
function initMeshes() {
    
   
}
//加载模型
function loadModel(){
    const loader=new GLTFLoader()
    const draco=new DRACOLoader()
    draco.setDecoderPath('./draco/')
    loader.setDRACOLoader(draco)
    loader.load('/models/LittlestTokyo.glb',(gltf)=>{
       const model=gltf.scene
       model.traverse(child=>{
        if(child.isMesh){
            
        }
       })
       model.scale.set(0.01,0.01,0.01)
       scene.add(model)
       //模型动画
       mixer=new THREE.AnimationMixer(model)
       mixer.clipAction(gltf.animations[0]).play()
    })
}
//初始化场景环境
function initEnvironment(){
    const pmreGenerator=new THREE.PMREMGenerator(renderer)
    scene.environment=pmreGenerator.fromScene(new RoomEnvironment(),0.001).texture
}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)

}
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //改变渲染器输入编码
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
    let delta=clock.getDelta()
    renderer.render(scene, camera)
    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
    mixer.update(delta)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xdddddd)//场景背景颜色
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(10, 10, 10)
    camera.updateProjectionMatrix()
}
window.addEventListener('resize', () => {
    //更新相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight
    //更新相机投影矩阵
    camera.updateProjectionMatrix()
    //更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    //更新渲染器像素比
    renderer.setPixelRatio(window.devicePixelRatio)
})

