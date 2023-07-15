//引入threejs
import * as THREE from 'three'
import { PlaneGeometry } from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

/* 
 SpotLight:聚光灯
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


// 聚光灯
const spotLight = new THREE.SpotLight(0xffffff, 1);
// 聚光灯的位置
spotLight.position.set(5, 6, 5)

//调节光的亮度
spotLight.intensity=2
//设置光照投射阴影
spotLight.castShadow = true;
spotLight.shadow.radius=10//阴影半径
spotLight.shadow.mapSize.set(2048,2048)//阴影贴图分辨率
//设置平行光投射相机的属性
spotLight.shadow.camera.near=0.5
spotLight.shadow.camera.far=500
spotLight.shadow.camera.fov=30//相机角度

spotLight.angle=Math.PI/6//光线散射角度 30
//如果非零，那么光强度将会从最大值当前灯光位置处按照距离线性衰减到0。 缺省值为 0.0。
spotLight.distance=0
// /聚光锥的半影衰减百分比。在0和1之间的值。
spotLight.penumbra=0




//聚光灯的方向是从它的位置到目标位置.默认的目标位置为原点 (0,0,0)。
//将目标位置改为球体
spotLight.target=sphere
scene.add(spotLight)


const gui=new dat.GUI()
gui.add(spotLight.shadow.camera,"near")
.min(0).max(10).step(0.1).onChange(()=>{
    //更新摄像机投影矩阵。在任何参数被改变以后必须被调用。
    spotLight.shadow.camera.updateProjectionMatrix()
}).name('相机近端')
gui.add(sphere.position,"y")
.min(-5).max(5).step(0.1).name('球y坐标')

gui.add(spotLight,"distance")
.min(0).max(10).step(0.1).name('聚光灯距离')

gui.add(spotLight,"angle")
.min(0).max(Math.PI).step(0.1).name('聚光灯角度')

gui.add(spotLight,"penumbra")
.min(0).max(1).step(0.1).name('半影衰减百分比')












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


