//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//导出collada模型工具
import { ColladaExporter } from 'three/examples/jsm/exporters/ColladaExporter'
//茶壶几何体
import {TeapotGeometry} from 'three/examples/jsm/geometries/TeapotGeometry'

// 导入UI界面控制库
import * as dat from 'dat.gui'


let teapot//茶壶
let teapotGeometry//茶壶几何体

let link
let exporter

let textureCube

let gui=new dat.GUI()
let effectControl={
    //茶壶材质
    hue:0.121,//颜色
    saturation:0.73,//饱和度
    lightness:0.66,//颜色亮度
    //光
    lightHue:0.04,
    lightSaturation:0.01,
    lightness1:1.0,
    lightPositionX:10,
    lightPositionY:10,
    lightPositionZ:10,

    //茶壶
    size:5,
    segments:15,
    lid:true,
    body:true,
    bottom:true,
    fitlid:true,
    material:'',
    export:exportCollada
}
let scene, camera, controls, renderer = null
let clock = new THREE.Clock()
let light
let phongMaterial,lamberMaterial,flatMaterial,textureMaterial,wrieMaterial,normalMaterial,reflectiveMaterial
let material
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initModel()//创建物体
initExporter()
render()
/*

*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0x333333))//环境光
    light = new THREE.DirectionalLight(0xffffff, 0.6)
    light.position.set(10, 10, 10)
    light.castShadow = true
    scene.add(light)
}
// 初始化物体
function initModel() {
    //添加调试
    setGui()
    //材质
    initMaterial()
    teapotGeometry=new TeapotGeometry(
        effectControl.size,//大小
        effectControl.segments,//网格
        effectControl.bottom,
        effectControl.lid,
        effectControl.body,
        effectControl.fitlid
    )
    teapot=new THREE.Mesh(teapotGeometry,material)
    scene.add(teapot)
    console.log(teapot);
   

}
//初始化材质
function initMaterial(){
    const materialColor=new THREE.Color().setHSL(1,1,1)
    //具有镜面高光的光泽表面的材质
    phongMaterial=new THREE.MeshPhongMaterial({
        color:materialColor,
        side:THREE.DoubleSide
    })
    material=phongMaterial

    //非光泽表面的材质，没有镜面高光
    lamberMaterial=new THREE.MeshLambertMaterial({
        color:materialColor,
        side:THREE.DoubleSide
    })

    flatMaterial=new THREE.MeshPhongMaterial({
        color:materialColor,
        specular:0x000000,//材质的高光颜色
        flatShading:true,//定义材质是否使用平面着色进行渲染
        side:THREE.DoubleSide
    })

    //纹理贴图材质
    const textureLoader=new THREE.TextureLoader()
    const textureMap=textureLoader.load('./textures/uv_grid_opengl.jpg')
    textureMap.wrapS=textureMap.wrapT=THREE.RepeatWrapping
    textureMap.anisotropy=16
    textureMap.encoding=THREE.sRGBEncoding
    textureMaterial=new THREE.MeshPhongMaterial({
        color:materialColor,
        map:textureMap,
        side:THREE.DoubleSide
    })

    //网格
    wrieMaterial=new THREE.MeshBasicMaterial({
        color:0xffffff,
        wireframe:true,
    })

    const diffuseMap=textureLoader.load('./textures/floors/FloorsCheckerboard_S_Diffuse.jpg' )
    const normalMap=textureLoader.load('./textures/floors/FloorsCheckerboard_S_Normal.jpg' )
    normalMaterial=new THREE.MeshPhongMaterial({
        color:materialColor,
        map:diffuseMap,
        normalMap:normalMap,
        side:THREE.DoubleSide
    })

    const path='./textures/pisa/'
    const urls=[
        path+'px.png',
        path+'nx.png',
        path+'py.png',
        path+'ny.png',
        path+'pz.png',
        path+'nz.png',
    ]
    textureCube=new THREE.CubeTextureLoader().load(urls)
    reflectiveMaterial=new THREE.MeshPhongMaterial({
        color:materialColor,
        envMap:textureCube,
        side:THREE.DoubleSide
    })

    

}

function setGui(){
    const colorFolder=gui.addFolder('壶颜色')
    colorFolder.add(effectControl,'hue',0.0,1.0,0.001).name('色调')
    colorFolder.add(effectControl,'saturation',0.0,1.0,0.001).name('饱和度')
    colorFolder.add(effectControl,'lightness',0.0,1.0,0.001).name('亮度')
    const materialFolder=gui.addFolder('材质')
    materialFolder.add(effectControl,'material',['phong','lamber','flat','texture','normal','reflective','wire']).name('材质')
    const ligthFolder=gui.addFolder('光')
    ligthFolder.add(effectControl,'lightHue',0.0,1.0,0.001).name('光色调')
    ligthFolder.add(effectControl,'lightSaturation',0.0,1.0,0.001).name('光饱和度')
    ligthFolder.add(effectControl,'lightness1',0.0,1.0,0.001).name('光亮度')
    ligthFolder.add(effectControl,'lightPositionX',0.0,20.0,0.001).name('x轴距离')
    ligthFolder.add(effectControl,'lightPositionY',0.0,20.0,0.001).name('y轴距离')
    ligthFolder.add(effectControl,'lightPositionZ',0.0,20.0,0.001).name('z轴距离')
    const teapotFolder=gui.addFolder('茶壶')
    teapotFolder.add(effectControl,'lid').name('隐藏盖')
    teapotFolder.add(effectControl,'body').name('隐藏身')
    teapotFolder.add(effectControl,'bottom').name('隐藏底')
    teapotFolder.add(effectControl,'fitlid').name('隐藏盖')
    teapotFolder.add(effectControl,'size',5,20,0.05).name('大小')
    teapotFolder.add(effectControl,'segments',1,20,0.05).name('segments')
    const exportFolder=gui.addFolder('导出')
    exportFolder.add(effectControl,'export').name('导出Collada')

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


    scene.background=new THREE.Color(0xcccccc)
    //根据gui配置更新
    if(effectControl.material==='phong'){
        teapot.material=phongMaterial
    }else if(effectControl.material==='lamber'){
        teapot.material=lamberMaterial
    }else if(effectControl.material==='flat'){
        teapot.material=flatMaterial
    }else if(effectControl.material==='texture'){
        teapot.material=textureMaterial
    }else if(effectControl.material==='normal'){
        teapot.material=normalMaterial
    }else if(effectControl.material==='reflective'){
        teapot.material=reflectiveMaterial
        scene.background=textureCube
    }else if(effectControl.material==='wire'){
        teapot.material=wrieMaterial
    }
    material.color.setHSL(effectControl.hue,effectControl.saturation,effectControl.lightness)
    light.color.setHSL(effectControl.lightHue,effectControl.lightSaturation,effectControl.lightness1)
    light.position.set(effectControl.lightPositionX,effectControl.lightPositionY,effectControl.lightPositionZ)
    //重新创建geometry
    teapotGeometry=new TeapotGeometry(
        effectControl.size,//大小
        effectControl.segments,//网格
        effectControl.bottom,
        effectControl.lid,
        effectControl.body,
        effectControl.fitlid
    )
    teapot.geometry=teapotGeometry




    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(20, 20, 20)
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
//初始化导出
function initExporter(){
    link=document.createElement('a')
    link.style.display='none'
    document.body.appendChild(link)
    exporter=new ColladaExporter()
}


// 导出
function exportCollada(){
    const result=exporter.parse(
        teapot,
        undefined,
        {
            upAxis:'Y_UP',
            unitName:'millimeter',
            unitMeter:0.001
        }
    )
    let mediaType='Phone'
    if(effectControl.material==='wireframe'){
        mediaType='Constant'
    }else if(effectControl.material==='lamber'){
        mediaType='Lambert'
    }
    saveString(result.data,'teapot_'+effectControl.material+'_'+mediaType+'.dae')
    result.textures.forEach(tex=>{
        saveArrayBuffer(tex.data,`${tex.name}.${tex.ext}`)
    })
}
function saveString(text,filename){
    save(new Blob([text]),filename)
}
function saveArrayBuffer(buffer,filename){
    save(new Blob([buffer],{type:'application/octet-stream'}),filename)
}
function save(blob,filename){
    link.href=URL.createObjectURL(blob)
    link.download=filename
    link.click()
}

