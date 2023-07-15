//引入threejs
import * as THREE from 'three'
//第一人称控制器
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls'
let scene, camera, controls1, renderer = null
let light
let geometryPlane,material,plane
let clock=new THREE.Clock()
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
    light = new THREE.DirectionalLight(0xffffff)//点光源（灯泡）
    light.position.set(500, 500, 500)
    scene.add(light)
}

function initMeshes() {
    //创建平面
    geometryPlane=new THREE.PlaneGeometry(2000,2000)
    geometryPlane.rotateX(-Math.PI/2)
    const position=geometryPlane.attributes.position
    position.usage=THREE.DynamicDrawUsage
    for(let i=0;i<position.count;i++){
        const y=35*Math.sin(i/2)
        position.setY(i,y)
    }
    const texture=new THREE.TextureLoader().load('./textures/water.jpg')
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping
    texture.repeat.set(5,5,5)
    material=new THREE.MeshBasicMaterial({
        map:texture,
        color:0x22ccff
    })
    plane=new THREE.Mesh(geometryPlane,material)
    scene.add(plane)

}

// 初始化工具
function initUtils() {
    //第一人称控制器
    controls1=new FirstPersonControls(camera,renderer.domElement)
    controls1.movementSpeed=1000
}

function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    //保存时钟运行的总时长
    const time=clock.getElapsedTime()*10
    const delta=clock.getDelta()
    const position=geometryPlane.attributes.position
    for(let i=0;i<position.count;i++){
        const y=5*Math.sin(i/5+(time+i)/7)
        position.setY(i,y)
    }
    position.needsUpdate=true
    renderer.render(scene, camera)
    controls1.update(delta)
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background=new THREE.Color(0xaaccff)
    scene.fog=new THREE.FogExp2(0xaaccff,0.002)//雾
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000)
    camera.position.set(0,50,300)
    camera.lookAt(0,0,0)
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
    controls1.handleResize()
})

