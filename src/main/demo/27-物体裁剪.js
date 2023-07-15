//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//模型加载器
import { GLTFLoader } from 'three//examples/jsm/loaders/GLTFLoader'
//解压模型器
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
//动画混入器
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
let scene, camera, controls, renderer = null
let ground,object
let spotLight,dirlight
let material

/*
    裁剪物体：1.localClipping，裁剪material
                （1）创建一个裁剪的平面 THREE.Plane
                 (2) 给平面传入三维向量坐标，保留的方向为向量的方向
                 (3)给需要裁剪的物体的材质material的clippingPlanes赋值[plane,plane1]
                 (4)渲染器允许裁剪renderer.localClippingEnabled=true  
             2.globalClipping，直接使用renderer去裁剪物体,场景内物体均被裁剪
                 (1) 创建一个裁剪的平面 THREE.Plane
                 (2) renderer.clippingPlanes=[plane]
*/  
initCamera()
initLights()
initRenderer()
initEnvironment()
initUtils()
initMeshes()

enableShadow()
enableClipping()//裁剪物体
render()



//初始化灯光
function initLights() {
    scene.add(new THREE.HemisphereLight(0xffffff,0x444444))//环境光
    dirlight=new THREE.DirectionalLight(0xffffff)
    dirlight.position.set(10,6,10)
    scene.add(dirlight)
    
    spotLight=new THREE.SpotLight(0xffffff)
    spotLight.position.set(0,7,0)
    scene.add(spotLight)
}
//创建物体
function initMeshes() {
    const geometry=new THREE.TorusKnotGeometry(0.8, 0.16, 100, 16 )
    material=new THREE.MeshPhongMaterial({color:0x88ee10,shininess:100})
    object=new THREE.Mesh(geometry,material)
    scene.add(object)

    const floorGeometry=new THREE.PlaneGeometry(30,30)
    const floorMaterial=new THREE.MeshPhongMaterial({
        color:0x444444,
        shininess:150
    })
    ground=new THREE.Mesh(floorGeometry,floorMaterial)
    ground.rotation.x=-Math.PI/2
    ground.position.y=-2
    scene.add(ground)
   
}
function enableShadow(){
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap
    ground.receiveShadow=true
    object.castShadow=true
    spotLight.castShadow=true
    //阴影分辨率
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    dirlight.castShadow=true
    //阴影分辨率
    dirlight.shadow.mapSize.width = 2048;
    dirlight.shadow.mapSize.height = 2048;
}

function enableClipping(){
    //Plane不是物体
    const plane=new THREE.Plane(
        new THREE.Vector3(1,0,0),//向右的向量，右边保留，保留的方向为向量的方向
        0.2,//Plane距离原点距离
    )
    const plane1=new THREE.Plane(
        new THREE.Vector3(-1,0,0),//向左的向量，左边保留
        0.7,//Plane距离原点距离
    )    

    const plane2=new THREE.Plane(
        new THREE.Vector3(0,1,0),//向上的向量，上边保留
        0,//Plane距离原点距离
    )      

    //locaclipping（裁剪指定的物体）
    // material.clippingPlanes=[plane,plane1,plane2]//用户定义的剪裁平面
    material.side=THREE.DoubleSide//双面渲染
    material.clipShadows=true //裁剪阴影
    renderer.localClippingEnabled=true//定义渲染器是否考虑对象级剪切平面

    //globalClipping
    renderer.clippingPlanes=[plane]    
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
    // renderer.outputEncoding = THREE.sRGBEncoding
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}

// 渲染函数
function render() {
    renderer.render(scene, camera)
    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xcccccc)//场景背景颜色
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 2, 10)
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

