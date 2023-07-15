//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
// 导入UI界面控制库
import * as dat from 'dat.gui'

// 创建一个场景
const scene = new THREE.Scene()
// 创建一个透视相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 相机位置
camera.position.set(1, 1, 1)//x,y,z轴坐标
//添加相机到场景
scene.add(camera)



//导入纹理加载器
const textureLoader=new THREE.TextureLoader()
// 加载纹理
const textureObj=textureLoader.load('./textures/test.jpg')
//设置偏移量
textureObj.offset.x=0.5
//设置旋转中心点，默认为左下角,二维坐标
textureObj.center.set(0.5,0.5)
// 纹理重复(水平重复两次，垂直重复三次)
textureObj.repeat.set(2,3)
//设置重复模式
textureObj.wrapS=THREE.RepeatWrapping//正常重复
textureObj.wrapS=THREE.MirroredRepeatWrapping//镜像重复
// 设置旋转(45度)
textureObj.rotation=Math.PI/4




//创建一个立方缓冲几何体
const cubeGeometry=new THREE.BoxGeometry(1,1,1)
//创建基础网格材质
const basicMaterial=new THREE.MeshBasicMaterial({
    color:'#ffffff',
    //贴上纹理
    map:textureObj
})
//创建几何体
const cube=new THREE.Mesh(cubeGeometry,basicMaterial)
//添加到场景
scene.add(cube)




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


