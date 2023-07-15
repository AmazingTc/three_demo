//引入threejs
import * as THREE from 'three'
// 导入轨迹球控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, camera, controls, renderer = null
let light
/*

*/
initCamera()
initLights()
initRenderer()
initUtils()
initMeshes()
render()



//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0x222222))//环境光
    light = new THREE.PointLight(0xffffff)//点光源（灯泡）
    light.position.set(100, 100, 100)
    scene.add(light)
}


function initMeshes() {
    //加载器
    const texture = new THREE.TextureLoader().load('./textures/crate.gif')
    //材质
    const material = new THREE.MeshBasicMaterial({
        map: texture
    })
    const geometry=new THREE.BoxGeometry(200,200,200)
    const mesh=new THREE.Mesh(geometry,material)
    scene.add(mesh)

}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    const axesHelper = new THREE.AxesHelper(100);
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
    // scene.background = new THREE.Color(0x2222222)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.z = 400
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

