//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { randFloat } from 'three/src/math/MathUtils'
let scene, camera, controls,light,renderer

let raycaster=new THREE.Raycaster()//射线
const mouse=new THREE.Vector3()//鼠标坐标
let intersects=[] //物体和射线的焦点
let group

initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()
initMeshes()

render()
/*

*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(100, 100, 50)
    light.castShadow=true
    
    scene.add(light)
}
// 初始化物体
function initMeshes() {
    group=new THREE.Group()
    let mesh=new THREE.Mesh(
        new THREE.BoxGeometry(20,20,20),
        new THREE.MeshPhongMaterial({
            color:0xe44565,
            wireframe:false//将几何体渲染为线框,默认为false
        })
    )
    group.add(mesh)
    scene.add(group)
   
}


// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性

    //坐标轴辅助
    scene.add(new THREE.AxesHelper(50))
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled=true
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
    controls.update()
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xdddddd)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 0, 100)
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

window.addEventListener('click',(e)=>{
    //-1~1
    mouse.x=e.clientX/window.innerWidth*2-1
    mouse.y=-e.clientY/window.innerHeight*2+1
    
    raycaster.setFromCamera(mouse,camera)
    //raycaster.ray:射线信息 方向等
    //射线穿过的物体
    intersects=raycaster.intersectObject(group,true)
    if(intersects.length>0){
        
        const intersectData=intersects[0]
        /*
        intersectDate.object   穿过的第一个物体
        intersectDate.distance   从camera到接触点的距离
        intersectDate.point   接触点的坐标

        当使用线框渲染时，每个三角形相当于一个face
        intersectDate.faceIndex  face标识
        intersectDate.face.a   face三个点的标识
        intersectDate.face.b    
        intersectDate.face.c    
        intersectDate.face.normal face的法向量
        intersectDate.face.materialIndex 材质标识
        intersectDate.uv  接触点在 UV映射时的横纵坐标。(vector2)
        */
    }
})

