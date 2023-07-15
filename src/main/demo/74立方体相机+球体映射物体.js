import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'//加载hdr
// 导入UI界面控制库
import * as dat from 'dat.gui'
let scene,camera,renderer
let cubeCamera,cubeRenderTarget //立方体相机
let sphere,cube,torus,material
let controls 
let textureBg//背景
let container //容器
init()
initMeshes()
initHDR()
/**
 
 球贴上环境贴图后，可以反射周围环境，要想让它反射周围物体，需要使用物体相机
 首先初始化物体渲染目标以及物体相机
   cubeRenderTarget=new THREE.WebGLCubeRenderTarget(256)
    cubeRenderTarget.texture.type=THREE.HalfFloatType
    cubeCamera=new THREE.CubeCamera(1,1000,cubeRenderTarget)

    然后将球的物体材质，envmap修改为渲染目标texture
     envMap:cubeRenderTarget.texture
     相当于将相机拍摄到的物体设置为球体的环境贴图

     在渲染中更新相机
    cubeCamera.update(renderer,scene)
 */


function init (){
    container=document.getElementById('container')
    renderer=new THREE.WebGLRenderer({antialias:true})
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth,window.innerHeight)  
    renderer.setAnimationLoop(animate)
    renderer.toneMapping=THREE.ACESFilmicToneMapping//色调映射,这个属性用于在普通计算机显示器或者移动设备屏幕等低动态范围介质上，模拟、逼近高动态范围（HDR）效果
    container.appendChild(renderer.domElement)
    camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1000)
    camera.position.z=75

    // 摄像机视锥体的长宽比
    camera.aspect=window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix();

    scene=new THREE.Scene()
    /**
     * 背景图，六张
     */
 
    // scene.background=new THREE.Color("rgb(100, 100,100)")
    scene.add(new THREE.AxesHelper(100))
    
    controls=new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true
    controls.dampingFactor=0.05
    controls.autoRotate=true
    window.addEventListener('resize',onWindowResize)

    //物体相机
    cubeRenderTarget=new THREE.WebGLCubeRenderTarget(256)
    cubeRenderTarget.texture.type=THREE.HalfFloatType
    cubeCamera=new THREE.CubeCamera(1,1000,cubeRenderTarget)
}

function initMeshes(){
    //受光照影响
    material=new THREE.MeshStandardMaterial({
        envMap:cubeRenderTarget.texture,
        roughness:0.05,//粗糙度
        metalness:1,//金属度
    })
    sphere=new THREE.Mesh(new THREE.IcosahedronGeometry(10,8),material)
    scene.add(sphere)


    cube=new THREE.Mesh(
        new THREE.BoxGeometry( 15,15,15),
        new THREE.MeshStandardMaterial({color:0xff0000,roughness:0.1,metalness:0})
    )
    cube.position.set(10,10,10)
    cube.scale.setScalar(0.3)
    scene.add(cube)


    torus=new THREE.Mesh(new THREE.TorusKnotGeometry( 10, 3, 100, 16 ),new THREE.MeshStandardMaterial())
    torus.position.set(-10,-10,-10)
    torus.scale.setScalar(0.3)
    scene.add(torus)    
}

function initHDR(){
    new RGBELoader().setPath('./textures/equirectangular/').load(
        'quarry_01_1k.hdr',//高动态范围图像
        texture=>{
            texture.mapping=THREE.EquirectangularReflectionMapping//经纬线映射贴图
            scene.background=texture  //背景
            scene.environment=texture   //环境，该纹理贴图将会被设为场景中所有物理材质的环境贴图
            initGui()
        }
    )
}
function initGui(){
    const gui=new dat.GUI()
    //添加一个控件，修改物体x轴位置
    gui.add(material,"roughness").min(0).max(1).step(0.01).name('粗糙度')
    gui.add(material,"metalness").min(0).max(1).step(0.01).name('金属度')
    gui.add(renderer,"toneMappingExposure").min(0).max(2).step(0.01).name('曝光度')
}

function onWindowResize(){
    camera.aspect=window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth,window.innerHeight)  
}

function animate(times){
    controls.update()
    const time =times/1000
    cube.position.set(
        Math.cos(time)*20,
        Math.sin(time)*20,
        Math.sin(time)*20
    )
    cube.rotation.x+=0.02
    cube.rotation.y+=0.02
    torus.position.set(
        Math.cos(-time)*20,
        Math.sin(-time)*20,
        Math.cos(time)*20,
    )
    torus.rotation.x+=0.02
    torus.rotation.y+=0.02

    cubeCamera.update(renderer,scene)
    renderer.render(scene,camera)
}
