//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, camera, controls, light, renderer
const colck = new THREE.Clock()


let line //object3d  折线
let segments = 20000// 片段  line 的点  
let range = 800
let t = 0




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
    const light1 = new THREE.AmbientLight()
    scene.add(light1)//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(50, 50, 50)
    light.castShadow = true
    light.shadow.camera.near = 0.01
    light.shadow.camera.far = 500
    light.shadow.camera.right = 30
    light.shadow.camera.left = -30
    light.shadow.camera.top = 30
    light.shadow.camera.bottom = -30
    light.shadow.mapSize.set(1024, 1024)
    light.shadow.radius = 4
    light.shadow.bias = -0.00006
    scene.add(light)
}
// 初始化物体
function initMeshes() {
    const positions = []
    const colors = []
    for (let i = 0; i < segments; i++) {
        const x = (Math.random() - 0.5) * range  //-400~400
        const y = (Math.random() - 0.5) * range
        const z = (Math.random() - 0.5) * range
        positions.push(x, y, z)

        colors.push(
            (x / range) + 0.5,
            (y / range) + 0.5,
            (z / range) + 0.5,
        )
    }
    // geometry
    const geometry = new THREE.BufferGeometry()
    geometry.computeBoundingSphere()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))



    //morph
    const data = []
    for (let i = 0; i < segments; i++) {
        const x = (Math.random() - 0.5) * range  //-400~400
        const y = (Math.random() - 0.5) * range
        const z = (Math.random() - 0.5) * range
        data.push(x, y, z)
    }
    const morphTarget = new THREE.Float32BufferAttribute(data, 3) //目标位置
    morphTarget.name = 'target1'
    geometry.morphAttributes.position = [morphTarget]

    //mesh
    line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ vertexColors: true }))
    scene.add(line)


}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    //坐标轴辅助
    scene.add(new THREE.AxesHelper(400))
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)

    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render(time) {
    renderer.render(scene, camera)
    controls.update()
    line.morphTargetInfluences[0] = Math.abs(Math.sin(time / 1000)) //正弦实现来回重复
    camera.position.z -= 10
    if (camera.position.z < -3500) {
        camera.position.z += 10
    }
    if (camera.position.z > 2500) {
        camera.position.z -= 10
    }
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    // scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 4000)
    camera.position.z = 2500
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

