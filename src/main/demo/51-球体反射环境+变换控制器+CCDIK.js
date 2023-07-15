//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//加载gltf模型
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
//用 Draco库压缩的几何加载器
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// 导入UI界面控制库
import * as dat from 'dat.gui'
//变换控制器
import {TransformControls} from 'three/examples/jsm/controls/TransformControls'

import {CCDIKSolver,CCDIKHelper} from 'three/examples/jsm/animation/CCDIKSolver'
let scene, camera, controls, renderer = null
let clock = new THREE.Clock()
let light
let gui,guiConfig //ui控制
let meshes={} 
let cubeCamera//物体相机
let transformControls //变换控制器
let IKSolver
const vec0=new THREE.Vector3()

initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initMeshes()//创建物体

render()
/*

*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff, 0.6)
    light.position.set(10, 10, 10)
    scene.add(light)
}
// 初始化物体
function initMeshes() {
    //模型
    initModel()
}
function initModel(){
   
    const loader=new GLTFLoader()
    const dracoLoader=new DRACOLoader()
    dracoLoader.setDecoderPath('./draco/')
    loader.setDRACOLoader(dracoLoader)
    loader.load('./models/gltf/kira.glb',gltf=>{
        const model=gltf.scene
        model.traverse(child=>{
            if(child.name==='head')meshes.head=child //头
            if(child.name==='lowerarm_l')meshes.lowerarm_l=child
            if(child.name==='Upperarm_l')meshes.Upperarm_l=child
            if(child.name==='boule'){
                meshes.sphere=child //球
               

                // 球体反射周围环境实现
                /* 
                使用cubeCamera实时为场景中的物体拍摄照片，
                然后使用这些实时照片创建纹理。
                将这些纹理作为球体的环境贴图（envMap）就可以模拟实时的反射了
                */

                ///将要创建的纹理对象，定义目标纹理的一些参数
                const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128);
                 /*创建cubeCamera
                  cubeCamera会构造一个包含6个PerspectiveCameras（透视摄像机）的立方摄像机， 并将其拍摄的场景渲染到一个WebGLCubeRenderTarget上。
                  0.05：近剪切面的距离；50：远剪切面的距离；cubeRenderTarget:将要创建的纹理对象
                  */
                  cubeCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget)
                //   cubeCamera.position.copy(meshes.sphere.position)
                
                scene.add(cubeCamera)

                  meshes.sphere.material=new THREE.MeshBasicMaterial({
                    envMap:cubeCamera.renderTarget.texture,//环境映射贴图
                })
  
            }
            if(child.name==='hand_l')meshes.hand_l=child
            if(child.name==='target_hand_l')meshes.target_hand_l=child
            if(child.name==='Kira_Shirt_left')meshes.kira=child
            if(child.isMesh){
                child.frustumCulled=false
            }
        })
        scene.add(model)
        controls.target.copy(meshes.sphere.position)//设置轨道控制器的围绕中心
    
        //变换控制器创建
        transformControls=new TransformControls(camera,renderer.domElement)
        transformControls.size=0.75
        transformControls.showX=false
        transformControls.space='world'
        //attach：将object作为子级来添加到该对象中，同时保持该object的世界变换。
        transformControls.attach(meshes.target_hand_l)//左手
        meshes.hand_l.attach(meshes.sphere)//手托球
        // 防止视角跟着移动,鼠标按下时禁止轨道控制器
        transformControls.addEventListener('mouseDown',()=>{controls.enabled=false})
        transformControls.addEventListener('mouseUp',()=>{controls.enabled=true})
        scene.add(transformControls)
        meshes.kira.add(meshes.kira.skeleton.bones[0])

        //CCD
        const iks=[
            {
                target:22,//target_hand_l
                effector:6,
                links:[
                    {
                        index:5,//lowerarm_l
                        rotationMin:new THREE.Vector3(1.2,-1.8,-0.4),
                        rotationMax:new THREE.Vector3(1.7,-1.1,0.3),
                    },
                    {
                        index:4,//Upperarm_l
                        rotationMin:new THREE.Vector3(0.1,-0.7,-1.8),
                        rotationMax:new THREE.Vector3(1.1,0,-1.4),
                    }
                ]
            }
        ]
        IKSolver=new CCDIKSolver(meshes.kira,iks)
        const ccdHelper=new CCDIKHelper(meshes.kira,iks,0.01)
        scene.add(ccdHelper)
        initGui()//gui控制
    })
    
}
function initGui(){
    guiConfig={
        followSphere:false,
        turnHead:true,
        ik_solver:true
    }
    gui=new dat.GUI()
    gui.add(guiConfig,'followSphere').name('控制器跟随球')
    gui.add(guiConfig,'turnHead').name('转头')
    gui.add(guiConfig,'ik_solver').name('自动更新IK')
    gui.add(IKSolver,'update')//点击调用IKSolver的update方法

}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性

    const axesHelper = new THREE.AxesHelper(0.5);
    scene.add(axesHelper)
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true ,logarithmicDepthBuffer:true})
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
    renderer.render(scene, camera)

    //球体反射 渲染时更新物体相机
    if(meshes.sphere&&cubeCamera){
        meshes.sphere.visible=false
        //返回一个表示该物体在世界空间中位置的矢量。
        meshes.sphere.getWorldPosition(cubeCamera.position)
        cubeCamera.update(renderer,scene)
        meshes.sphere.visible=true
    }

    //控制器中心跟随球
    if(meshes.sphere && guiConfig.followSphere){
        meshes.sphere.getWorldPosition(vec0)
        controls.target.lerp(vec0,0.1)
    }
    
    //头跟随球转动
    if(meshes.head && meshes.sphere && guiConfig.turnHead){
        meshes.sphere.getWorldPosition(vec0)
        meshes.head.lookAt(vec0)
        meshes.head.rotateY(Math.PI)
    }

    if(IKSolver&&guiConfig.ik_solver){
        IKSolver.update()
    }

    controls.update()
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.fog=new THREE.FogExp2(0xffffff,0.17)
    scene.background=new THREE.Color(0xdddddd)
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 5000)
    camera.position.set(1, 1, 1)
    camera.lookAt(scene.position)
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


