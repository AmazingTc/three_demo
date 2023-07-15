//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DoubleSide, LoadingManager } from 'three'

// 创建一个场景
const scene = new THREE.Scene()
// 创建一个透视相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 相机位置
camera.position.set(5, 5, 5)//x,y,z轴坐标
//添加相机到场景
scene.add(camera)

// 物体纹理加载器
const cubeTextureLoader=new THREE.CubeTextureLoader()
const envMapTexture=cubeTextureLoader.load([
    'textures/environmentMaps/1/px.jpg',//正方向x
    'textures/environmentMaps/1/nx.jpg',//负方向x
    'textures/environmentMaps/1/py.jpg',
    'textures/environmentMaps/1/ny.jpg',
    'textures/environmentMaps/1/pz.jpg',
    'textures/environmentMaps/1/nz.jpg',
])
//创建一个球缓冲几何体
const sphereGeometry=new THREE.SphereGeometry(1,20,20)
//添加标准网格材质
const material=new THREE.MeshStandardMaterial({
    metalness:0.7,//金属都
    roughness:0.1,//粗糙度
    envMap:envMapTexture,//环境贴图
})
const sphere=new THREE.Mesh(sphereGeometry,material)
scene.add(sphere)


// 添加环境光（颜色，强度）
const light = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(light)
// 平行光
const directionlLight = new THREE.DirectionalLight(0xffffff, 0.5);
// 平行光的位置
directionlLight.position.set(10, 10, 10)
scene.add(directionlLight)







// 初始化渲染器
const renderer = new THREE.WebGLRenderer()
//设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
//将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement)


// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
// 设置控制器阻尼，让控制器更真实
controls.enableDamping = true

//添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
//添加都场景
scene.add(axesHelper)

// 渲染函数
function render() {
    controls.update()//设置阻尼之后必须使用更新
    // 使用渲染器，通过相机将场景渲染进来
    renderer.render(scene, camera)
    //请求动画帧,渲染下一帧就会调用render函数
    requestAnimationFrame(render)
}
render()
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


