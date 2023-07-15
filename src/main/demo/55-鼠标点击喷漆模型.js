//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//模型加载器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'
//喷漆
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry'
const gui = new dat.GUI()//图形界面控制
let guiConfig={
    minScale:10,
    maxScale:20,
    rotate:true,
    clear:removeDecals
}
let scene, camera, controls, light, renderer
let textureLoader = new THREE.TextureLoader()//纹理加载器
let raycaster = new THREE.Raycaster()//射线
let mouse = {} //鼠标位置
let intersects  //焦点
let model //模型
let mouseHelper
let line //跟随鼠标的线段
//喷漆
let decals=[]
let decalMaterial
const pointPosition =new THREE.Vector3()
const orientation=new THREE.Euler()//欧拉角
const size=new THREE.Vector3(10,10,10) 
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()
initMeshes()


/*

*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0x443333))//环境光
    light = new THREE.DirectionalLight(0xffddcc, 1)
    light.position.set(1, 0.75, 0.5)
    light.castShadow = true
    scene.add(light)
    const light1 = new THREE.DirectionalLight(0xccccff, 1)
    light1.position.set(-1, 0.75, -0.5)
    scene.add(light1)

}
// 初始化物体
function initMeshes() {


    //加载模型
    new GLTFLoader().load('./models/gltf/LeePerrySmith/LeePerrySmith.glb', gltf => {
        model = gltf.scene.children[0]
        model.traverse(child => {

        })
        model.scale.setScalar(10)//放大十倍
        const material = new THREE.MeshPhongMaterial({
            //颜色贴图
            map: textureLoader.load('./models/gltf/LeePerrySmith/Map-COL.jpg'),
            //镜面反射贴图
            specularMap: textureLoader.load('./models/gltf/LeePerrySmith/Map-SPEC.jpg'),
            //法线贴图
            normalMap: textureLoader.load('./models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg'),
        })
        model.material = material
        scene.add(model)
        initIndicator()
        initDecal()
        render()
    })



}


// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性

    //坐标轴辅助
    // scene.add(new THREE.AxesHelper(50))
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    // renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    renderer.render(scene, camera)
    controls.update()
    requestAnimationFrame(render)
}
//清除喷漆
function removeDecals(){
    decals.forEach(item=>{
           scene.remove(item) 
    })
    decals.length=0
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 0, 120)
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
//喷漆初始化
function initDecal(){
    const decalDiffuse=textureLoader.load('./textures/decal/decal-diffuse.png')
    const decalNormal=textureLoader.load('./textures/decal/decal-normal.jpg')
    //喷漆材质
    decalMaterial=new THREE.MeshPhongMaterial({
        map:decalDiffuse,
        transparent:true,
        specular:0x444444,//材质的高光颜色
        normalMap:decalNormal,//法线贴图
        normalScale:new THREE.Vector2(1,1),//法线贴图对材质的影响程度 
        depthWrite:false,//渲染此材质是否对深度缓冲区有任何影响
        polygonOffset:true,//是否使用多边形偏移
        polygonOffsetFactor:-4, //设置多边形偏移系数
        wireframe:false,//将几何体渲染为线框 默认为false
    })

    
    gui.add(guiConfig,'minScale',1,10,0.1).name('最小缩放值')
    gui.add(guiConfig,'maxScale',20,50,0.1).name('最大缩放值')
    gui.add(guiConfig,'rotate').name('是否旋转')
    gui.add(guiConfig,'clear').name('清除喷漆')
}
//创建图形
function initIndicator() {
    //两个点创建一条线 line
    const geometry = new THREE.BufferGeometry()
    geometry.setFromPoints(
        [
            new THREE.Vector3(-50, 0, 0),
            new THREE.Vector3(-50, 0.1, 0),
        ]
    )
    line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff0000 }))
    scene.add(line)


    //mouseHelper
    mouseHelper = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 10),
        new THREE.MeshNormalMaterial()
    )
    scene.add(mouseHelper)
    //鼠标移动监听
    window.addEventListener('pointermove', (e) => {
        if (e.isPrimary) {
            handleIntersection(e.clientX, e.clientY)
        }
    })
    //鼠标按下
    window.addEventListener('pointerdown', (e) => {
       
    })
    //鼠标弹起
    window.addEventListener('pointerup', (e) => {
        // handleIntersection(e.clientX, e.clientY)
        shoot()//喷漆
    })
}
//喷漆创建
function shoot(){
    if(guiConfig.rotate){
        orientation.z=Math.random()*2*Math.PI //随机旋转
    }
    const m=decalMaterial.clone()
    const scale=guiConfig.minScale+Math.random()*(guiConfig.maxScale-guiConfig.minScale)
    size.setScalar(scale)
    m.color.setHex(Math.random()*0xffffff)
    const decalMesh=new THREE.Mesh(
        new DecalGeometry(model,pointPosition,orientation,size),
        m
    )
    decals.push(decalMesh)
    scene.add(decalMesh)
}
//处理鼠标移动
function handleIntersection(x, y) {
    //将鼠标位置归一化为设备坐标
    mouse.x = (x / window.innerWidth) * 2 - 1
    mouse.y = -(y / window.innerHeight) * 2 + 1
    //通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(mouse, camera)
    //计算物体和射线的焦点
    intersects = []
    raycaster.intersectObject(model, false, intersects)
    if (intersects.length > 0) {
        const interactedObj = intersects[0]//第一个接触物
        //接触点
        const point = interactedObj.point //第一个焦点的坐标（Vector3）
        pointPosition.copy(point)
        //接触面法向量
        const normal = interactedObj.face.normal.clone()
        normal.transformDirection(model.matrixWorld)
        normal.multiplyScalar(10)
        normal.add(point)

        //line位置
        const position = line.geometry.attributes.position
        position.setXYZ(0, point.x, point.y, point.z)
        position.setXYZ(1, normal.x, normal.y, normal.z)
        position.needsUpdate = true

        //mouseHelper位置
        mouseHelper.position.copy(point)
        mouseHelper.lookAt(normal)
        orientation.copy(mouseHelper.rotation)
    }
}

