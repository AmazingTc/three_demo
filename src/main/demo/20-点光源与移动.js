//引入threejs
import * as THREE from 'three'
import { MeshBasicMaterial, PlaneGeometry } from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

/* 
 PointLight:电光源，从一个点向各个方向发射的光源。一个常见的例子是模拟一个灯泡发出的光。
*/


// 创建一个场景
const scene = new THREE.Scene()
// 创建一个透视相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 相机位置
camera.position.set(0.5, 10, 10)//x,y,z轴坐标
//添加相机到场景
scene.add(camera)


//创建一个球缓冲几何体(半径,水平分段数，垂直分段数)
const sphereGeometry=new THREE.SphereGeometry(1,20,20)
//添加标准网格材质
const material=new THREE.MeshStandardMaterial({
    metalness:0.7,//金属度
    roughness:0.2//粗糙度
})
const sphere=new THREE.Mesh(sphereGeometry,material)
//设置球体投射阴影
sphere.castShadow=true
scene.add(sphere)


// 创建一个平面
const planeGemoetry=new PlaneGeometry(50,50)//width,height
const plane=new THREE.Mesh(planeGemoetry,material)
plane.position.set(0,-1,0)
plane.rotation.x=-Math.PI/2 //绕x周旋转-90度
plane.receiveShadow=true//接收阴影
scene.add(plane)



// 添加环境光（颜色，强度）
const light = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(light)


//创建一个小球当做光源
const smallBall=new THREE.Mesh(
    new THREE.SphereGeometry(0.2,20,20),
    new MeshBasicMaterial({color:0xff0000})
)
smallBall.position.set(2,2,2)


// 点光源
const PointLight = new THREE.PointLight(0xff0000, 1);

//调节光的亮度
PointLight.intensity=2
//设置光照投射阴影
PointLight.castShadow = true;
PointLight.shadow.radius=10//阴影半径
PointLight.shadow.mapSize.set(2048,2048)//阴影贴图分辨率

//小球成为光源
smallBall.add(PointLight)
//添加小球光源
scene.add(smallBall)




const gui=new dat.GUI()
gui.add(PointLight.shadow.camera,"near")
.min(0).max(10).step(0.1).onChange(()=>{
    //更新摄像机投影矩阵。在任何参数被改变以后必须被调用。
    PointLight.shadow.camera.updateProjectionMatrix()
}).name('相机近端')
gui.add(sphere.position,"y")
.min(-5).max(5).step(0.1).name('球y坐标')

gui.add(PointLight,"distance")
.min(0).max(20).step(0.1).name('点光源距离')


gui.add(smallBall.position,"x")
.min(0).max(20).step(0.1).name('小球x')








// 初始化渲染器
const renderer = new THREE.WebGLRenderer()
//设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
//将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement)
//允许阴影贴图
renderer.shadowMap.enabled = true;


// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
// 设置控制器阻尼，让控制器更真实
controls.enableDamping = true




//添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
//添加都场景
scene.add(axesHelper)



const clock=new THREE.Clock()

// 渲染函数
function render() {
    let time=clock.getElapsedTime()
    //小球光源绕y轴运动
    smallBall.position.x=Math.sin(time)*5
    smallBall.position.z=Math.cos(time)*5

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


