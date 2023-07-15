//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
let scene, camera, controls, renderer
let css3DRenderer, csseDScene
initCamera()//初始化相机
initRenderer()//初始化渲染器
initUtils()
initMeshes()
render()

/*

*/



// 初始化物体
function initMeshes() {
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        wireframeLinewidth: 5,
        side: THREE.DoubleSide,
    })
    const position=new THREE.Vector3()
    const rotation=new THREE.Vector3()
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.PlaneGeometry(100, 100)
        const mesh = new THREE.Mesh(geometry, material)
        position.set(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
        )
        rotation.set(
            Math.random(),
            Math.random(),
            Math.random(),
        )
        mesh.position.copy(position)
        mesh.rotation.x=rotation.x
        mesh.rotation.y=rotation.y
        mesh.rotation.z=rotation.z
        scene.add(mesh)


        //css3DObject
        const div = document.createElement('div')
        div.style.width = '100px'
        div.style.height = '100px'
        div.style.backgroundColor = new THREE.Color(Math.random() * 0xffffff).getStyle()

        const css3DObject = new CSS3DObject(div)
        css3DObject.position.copy(position)
        css3DObject.rotation.copy(mesh.rotation)
        csseDScene.add(css3DObject)
    }





}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    // const cont2=new OrbitControls(camera,css3DRenderer.domElement)  //解决控制器失效
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    scene.add(new THREE.AxesHelper(100))
}
//初始化渲染器
function initRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)


    css3DRenderer = new CSS3DRenderer()
    css3DRenderer.setSize(window.innerWidth, window.innerHeight)
    //重叠两个渲染器范围
    css3DRenderer.domElement.style.position = 'absolute'
    css3DRenderer.domElement.style.top = 0
    css3DRenderer.domElement.style.pointerEvents = 'none'//鼠标事件实现 防止控制器失效
    document.body.appendChild(css3DRenderer.domElement)
}
// 渲染函数
function render(time) {
    renderer.render(scene, camera)
    css3DRenderer.render(csseDScene, camera)
    controls.update()
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    csseDScene = new THREE.Scene()
    scene.background = new THREE.Color(0xb0b0b0)
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000)
    camera.position.set(200, 200, 200)
}
window.addEventListener('resize', (e) => {
    //更新相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight
    //更新相机投影矩阵
    camera.updateProjectionMatrix()
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    css3DRenderer.setSize(window.innerWidth, window.innerHeight)
})

