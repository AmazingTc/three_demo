//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
let scene, camera, controls
let css3DRender
initCamera()//初始化相机
initRenderer()//初始化渲染器
initUtils()
initMeshes()
render()

/*

*/



// 初始化物体
function initMeshes() {
    const group = new THREE.Group()
    scene.add(group)
    group.add(createCSS3DObject(
        'https://haokan.baidu.com/v?vid=13623743139809608651&tab=recommend&sfrom=recommend',
        0, 0, 240, 0
    ))
    group.add(createCSS3DObject(
        'https://haokan.baidu.com/v?vid=13623743139809608651&tab=recommend&sfrom=recommend',
        240, 0, 0, Math.PI/2
    ))
    group.add(createCSS3DObject(
        'https://haokan.baidu.com/v?vid=13623743139809608651&tab=recommend&sfrom=recommend',
        0, 0, -240, Math.PI
    ))
    group.add(createCSS3DObject(
        'https://haokan.baidu.com/v?vid=13623743139809608651&tab=recommend&sfrom=recommend',
        -240, 0, 0, -Math.PI/2
    ))
}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, css3DRender.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
}
//初始化渲染器
function initRenderer() {

    css3DRender = new CSS3DRenderer()
    css3DRender.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(css3DRender.domElement)
}
function createCSS3DObject(url, x, y, z, ry) {
    //创建<dib>
    const div = document.createElement('div')
    div.style.width = '480px'
    div.style.height = '360px'
    div.style.backgroundColor = "#000"
    // 创建iframe
    const iframe = document.createElement('iframe')
    iframe.style.width = '480px';
    iframe.style.height = '360px'
    iframe.style.border = '0px'
    iframe.src = url
    div.appendChild(iframe)

    //创建
    const css3DObj = new CSS3DObject(div)
    css3DObj.position.set(x, y, z)
    css3DObj.rotation.y = ry
    return css3DObj
}
// 渲染函数
function render(time) {
    css3DRender.render(scene, camera)
    controls.update()
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000)
    camera.position.set(500, 350, 750)
}
window.addEventListener('resize', (e) => {
    //更新相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight
    //更新相机投影矩阵
    camera.updateProjectionMatrix()
    //更新渲染器
    css3DRender.setSize(window.innerWidth, window.innerHeight)
})

