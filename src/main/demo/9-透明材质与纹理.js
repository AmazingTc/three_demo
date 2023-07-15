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
const textureObj=textureLoader.load('./textures/test.jpg')
// 纹理显示设置,贴图如何采样
// textureObj.minFilter=THREE.LinearFilter//双线性插值(默认)
// textureObj.minFilter=THREE.NearestFilter//使用最接近的纹素的值
// textureObj.magFilter=THREE.LinearMipMapLinearFilter



//创建一个立方缓冲几何体
const cubeGeometry=new THREE.BoxGeometry(1,1,1)
//创建基础网格材质
const basicMaterial=new THREE.MeshBasicMaterial({
    color:'#ffffff',
    //贴上纹理
    map:textureObj,
    // transparent:true,//允许透明
    // alphaMap:textureObj,//灰度纹理贴图，控制表面不透明度（黑色透明，白色不透明）
    opacity:0.8,//透明度
    side:DoubleSide,//渲染双面（防止背面看不到）
})
//创建几何体
const cube=new THREE.Mesh(cubeGeometry,basicMaterial)
//添加到场景
scene.add(cube)

// 添加一个平面
const plane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),basicMaterial)
plane.position.set(3,0,0)
scene.add(plane)

// 初始化渲染器
const renderer = new THREE.WebGLRenderer()
//设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
//将webgl渲染的canvas内容添加到body
console.log(renderer);
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


