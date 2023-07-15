//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//导入3D物理引擎
import { OimoPhysics } from 'three/examples/jsm/physics/OimoPhysics'
import * as dat from 'dat.gui'
import { Matrix4 } from 'three'

let scene, camera, controls, light, light1, renderer = null
let boxes, spheres, floor = null//地板和物体
let physics
let position = new THREE.Vector3()



initCamera()
initLight()
initMeshes()
initRenderer()
initUtils()
enableShadow()
enablePhysic()
render()

// 初始化物体
function initMeshes() {
    // 创建地板
    floor = new THREE.Mesh(
        new THREE.BoxGeometry(10, 1, 10),
        new THREE.ShadowMaterial({ color: 0x111111 }),//阴影材质,用于接收阴影(影子颜色)，当没有影子存在时，为透明
    )
    floor.position.set(0, -1, 0)
    scene.add(floor)

    // 创建小盒子
    boxes = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshLambertMaterial(),//材质，反光效果差（用于木头等）
        100,//数量
    )
    // 创建四维矩阵
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()
    // 位置和颜色设置
    for (let i = 0; i < boxes.count; i++) {
        matrix.setPosition(
            Math.random() - 0.5,
            Math.random() * 3,
            Math.random() - 0.5
        )
        boxes.setMatrixAt(i, matrix)
        boxes.setColorAt(i, color.setHex(Math.random() * 0xffffff))
    }
    scene.add(boxes)


    // 创建小球
    spheres = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.05, 32, 32),
        new THREE.MeshLambertMaterial(),//材质，反光效果差（用于木头等）
        100,//数量
    )
    // 位置和颜色设置
    for (let i = 0; i < spheres.count; i++) {
        matrix.setPosition(
            Math.random() - 0.5,
            Math.random() * 3,
            Math.random() - 0.5
        )
        spheres.setMatrixAt(i, matrix)
        spheres.setColorAt(i, color.setHex(Math.random() * 0xffffff))
    }
    scene.add(spheres)
}


async function enablePhysic() {
    //注意此处为异步方法
    physics = await OimoPhysics()
    // 实现物体自由落体
    physics.addMesh(floor)//没有第二个参数，则碰撞
    physics.addMesh(boxes, 1)//添加小盒子
    physics.addMesh(spheres, 1)//添加小球
    render()
}


//阴影配置
function enableShadow() {
    /*
    1.材质必须支持光照效果
    2.渲染器开启阴影计算 renderer.shadowMap.enableed=true
    3.设置光照投射阴影 Light.castShadow=true
    4.设置球体投射阴影 sphere.castShadow=true
    5.设置物体接受阴影 plane.receiveShadow=true
    */
    renderer.shadowMap.enabled = true
    light1.castShadow = true
    boxes.castShadow = true
    spheres.castShadow = true
    floor.receiveShadow = true
    // 提高画质性能
    boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage)//update every frame
    spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage)//update every frame
}

//初始化灯光
function initLight() {
    // 创建环境光（不投射阴影，且没有方向）
    light = new THREE.AmbientLight()
    //创建平行光（太阳光）
    light1 = new THREE.DirectionalLight()
    light1.position.set(5, 5, -5)//光的位置
    light.intensity = 0.3//光照强度
    scene.add(light1)
    scene.add(light)

}
// 初始化工具
function initUtils() {

    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.y=1
    controls.enableDamping = true
    controls.update()
    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(1);
    // scene.add(axesHelper)
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
// 渲染函数
function render() {
    //随机生成box的索引
    let index = Math.floor(Math.random() * boxes.count)
    position.set(0, Math.random() * 2, 0)
    // 更新物体位置
    if(physics){
        physics.setMeshPosition(boxes, position, index)
        physics.setMeshPosition(spheres, position, index)
    }
    controls.update()//设置阻尼之后必须使用更新
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x888888)
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(4, 4, 4)
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


