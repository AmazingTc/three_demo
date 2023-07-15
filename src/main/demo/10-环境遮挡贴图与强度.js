//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
// 导入UI界面控制库
import * as dat from 'dat.gui'
import { DoubleSide } from 'three'

// 创建一个场景
const scene = new THREE.Scene()
// 创建一个透视相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 相机位置
camera.position.set(5, 5, 5)//x,y,z轴坐标
//添加相机到场景
scene.add(camera)



//导入纹理加载器
const textureLoader=new THREE.TextureLoader()
// 加载纹理
const doorColorTexture=textureLoader.load('./textures/door/color.jpg')
// 灰度贴图
const doorAplhaTexture=textureLoader.load('./textures/door/alpha.jpg')
//环境遮挡贴图
const doorAotexture=textureLoader.load('./textures/door/ambientOcclusion.jpg')



//创建一个立方缓冲几何体
const cubeGeometry=new THREE.BoxGeometry(1,1,1)
//创建基础网格材质
const basicMaterial=new THREE.MeshBasicMaterial({
    color:'#ffff00',
    //贴上纹理
    map:doorColorTexture,
    transparent:true,//允许透明
    alphaMap:doorAplhaTexture,//灰度纹理贴图，控制表面不透明度（黑色透明，白色不透明）
    side:DoubleSide,//渲染双面（防止背面看不到）
    aoMap:doorAotexture,//环境遮挡贴图(需要添加第二组uv)
    aoMapIntensity:1.2,//环境遮挡强度，默认为1
})
//创建几何体
const cube=new THREE.Mesh(cubeGeometry,basicMaterial)
//添加到场景
scene.add(cube)
// 给cube添加第二组uv
cubeGeometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(cubeGeometry.attributes.uv.array,2)
)



// 添加一个平面
const planeGeometry=new THREE.PlaneGeometry(1,1)
const plane=new THREE.Mesh(planeGeometry,basicMaterial)
plane.position.set(3,0,0)
scene.add(plane)
//给平面设置第二组uv
planeGeometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(planeGeometry.attributes.uv.array,2)
)





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


