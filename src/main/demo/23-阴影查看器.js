//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//导入阴影查看器
import {ShadowMapViewer} from 'three/examples/jsm/utils/ShadowMapViewer'
//导入gsap动画库
import gsap from 'gsap'
let scene, camera, controls, dirLight, spotLight, renderer = null
let ground, forusKnot, cube//物体
let clock=new THREE.Clock()
//两个光源的阴影查看器
let spotLightShadowViwer,dirLightShadowViwer

initCamera()
initLights()
initRenderer()
initUtils()
initMeshes()
enableShadow()
initCameraHelper()
render()




//初始化灯光
function initLights() {
    //环境光
    scene.add(new THREE.AmbientLight(0x404040))
    //聚光灯
    spotLight = new THREE.SpotLight(0xffffff)
    spotLight.name='Spot light'
    spotLight.angle=Math.PI/5
    spotLight.penumbra=0.3//聚光性
    spotLight.position.set(10,10,5)
    scene.add(spotLight)
    // 平行光
    dirLight=new THREE.DirectionalLight(0xffffff,1)
    dirLight.name="Dir light"
    dirLight.position.set(0,20,0)
    scene.add(dirLight)
}
function initMeshes(){
    //环形结
    let geometry=new THREE.TorusKnotGeometry(25,8,100,20)
    let  material=new THREE.MeshPhongMaterial({
        color:0xff0000,
        shininess:150,//高亮的程度
        specular:0x222222,//材质的高光颜色
    })
    forusKnot=new THREE.Mesh(geometry,material)//创建物体
    forusKnot.scale.multiplyScalar(1/18)//缩放
    forusKnot.position.y=3
    scene.add(forusKnot)

    //正方体
    geometry=new THREE.BoxGeometry(3,3,3)
    cube=new THREE.Mesh(geometry,material)
    cube.position.set(8,3,8)
    scene.add(cube)


    // 地面
    geometry=new THREE.BoxGeometry(30,0.15,30)
    material=new THREE.MeshPhongMaterial({
        color:0xa0a0adaf,
        shininess:150,
        specular:0x111111
    })
    ground=new THREE.Mesh(geometry,material)
    scene.add(ground)
}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.enableDamping = true
    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)


    //阴影查看器
    dirLightShadowViwer=new ShadowMapViewer(dirLight)
    spotLightShadowViwer=new ShadowMapViewer(spotLight)
    //显示阴影
    const size =window.innerWidth*0.25//显示大小
    //平行光
    dirLightShadowViwer.position.set(10,10)
    dirLightShadowViwer.size.width=size
    dirLightShadowViwer.size.height=size
    dirLightShadowViwer.update()

    //聚光灯
    spotLightShadowViwer.size.set(size,size)
    spotLightShadowViwer.position.set(size+10,10)
    spotLightShadowViwer.update()
}
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer()
    //改变渲染器输入编码
    renderer.outputEncoding = THREE.sRGBEncoding
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
function enableShadow(){
    renderer.shadowMap.enabled = true
    dirLight.castShadow = true
    spotLight.castShadow=true
    forusKnot.castShadow=true
    cube.castShadow=true
    ground.receiveShadow = true
}
// 渲染函数
function render() {
    //得到间隔时间
    const delta=clock.getDelta()
    renderer.render(scene, camera)
    // console.log(delta);
    // 环形结转动
    forusKnot.rotation.x+=0.25*delta
    forusKnot.rotation.y+=2*delta
    forusKnot.rotation.z+=delta

    // 正方体转动
    cube.rotation.x+=0.25*delta
    cube.rotation.y+=2*delta
    cube.rotation.z+=delta

    //移动聚光灯位置
    if(spotLight.position.y>30){
        spotLight.position.y=0
    }else{
        spotLight.position.y+=0.05
    }

    //阴影查看器渲染
    spotLightShadowViwer.render(renderer)
    dirLightShadowViwer.render(renderer)

    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 15, 35)
    camera.updateProjectionMatrix()
}
//模拟相机视锥体的辅助对象
function initCameraHelper(){
    //聚光灯
    spotLight.shadow.camera.near=8 // 近点
    spotLight.shadow.camera.far=30// 远点
    spotLight.shadow.mapSize.width=1024
    spotLight.shadow.mapSize.height=1024
    //添加辅助器
    scene.add(new THREE.CameraHelper(spotLight.shadow.camera))

    //平行光
    dirLight.shadow.camera.near=3
    dirLight.shadow.camera.far=20
    dirLight.shadow.camera.right=15
    dirLight.shadow.camera.left=-15
    dirLight.shadow.camera.top=15
    dirLight.shadow.camera.bottom=-15
    scene.add(new THREE.CameraHelper(dirLight.shadow.camera))
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
    
    dirLightShadowViwer.updataForWindowResize()
    spotLightShadowViwer.updataForWindowResize()
})


