//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
let scene, camera, controls, light, renderer, meshes = null

let amount = 10
let count = Math.pow(amount, 3) //1000

let white = new THREE.Color().setHex(0xffffff)
let color = new THREE.Color()


//光线投射
let raycaster = new THREE.Raycaster()
//鼠标位置
let mouse = new THREE.Vector2(100,100)


// 创建一个场景
scene = new THREE.Scene()
// 创建一个透视相机
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 相机位置
camera.position.set(10, 10, 10)//x,y,z轴坐标
camera.updateProjectionMatrix()
//初始化10*10*10数量的小球
initMeshes()
scene.add(camera)
init()
initLight()



document.addEventListener('mousemove', (e) => {
    // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1    //-1~1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1  //-1~1
})


//初始化灯光
function initLight() {
    // 创建半球光（颜色过渡）
    light = new THREE.HemisphereLight(0xffffff, 0x888888)
    light.position.set(0, 1, 0)
    scene.add(light)
}
// 初始化场景相机渲染器
function init() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer()
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
    //允许阴影贴图
    renderer.shadowMap.enabled = true;


    // 创建轨道控制器
    controls = new OrbitControls(camera, renderer.domElement)
    // 设置控制器阻尼，让控制器更真实
    controls.enableDamping = true

    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(3);
    //添加都场景
    scene.add(axesHelper)

    // 渲染函数
    function render() {
        controls.update()//设置阻尼之后必须使用更新
        // 通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(mouse, camera)
        // 计算物体和射线的焦点
        const intersection = raycaster.intersectObject(meshes)
        if (intersection.length > 0) {
            //取出射线射中第一个物体的id
            const instanceID = intersection[0].instanceId
            // 获取当前物体的颜色
            meshes.getColorAt(instanceID, color)
            //如果是白色则改变颜色
            if (color.equals(white)) {
                // 设置随机颜色
                meshes.setColorAt(instanceID, color.setHex(Math.random() * 0xffffff))
                meshes.instanceColor.needsUpdate = true
            }
        }
        renderer.render(scene, camera)
        //请求动画帧,渲染下一帧就会调用render函数
        requestAnimationFrame(render)
    }
    // 尺寸自适应渲染
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
    render()
}
// 初始化物体
function initMeshes() {
    const geometry = new THREE.IcosahedronGeometry(0.5, 5)//正二十面体
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
    //渲染大量具有相同几何体与材质
    meshes = new THREE.InstancedMesh(geometry, material, count)
    let index = 0
    const offset = (amount - 1) / 2 //偏移量4.5
    const matrix = new THREE.Matrix4()//转换矩阵
    for (let i = 0; i < amount; i++) {
        for (let j = 0; j < amount; j++) {
            for (let k = 0; k < amount; k++) {
                //设置位置（x,y,z）
                matrix.setPosition(offset - i, offset - j, offset - k) //-4.5  +4.5
                //将位置给每个小球
                meshes.setMatrixAt(index, matrix)
                meshes.setColorAt(index, white)
                index++
            }
        }
    }
    scene.add(meshes)
}


