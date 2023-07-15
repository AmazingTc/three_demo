//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
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
// 加载纹理(普通贴图)
const doorColorTexture=textureLoader.load('./textures/door/color.jpg')
// 导入灰度贴图 (黑色透明，白色不透明)
const doorAplhaTexture=textureLoader.load('./textures/door/alpha.jpg')
//导入环境遮挡贴图（层次感）
const doorAotexture=textureLoader.load('./textures/door/ambientOcclusion.jpg')
//导入置换贴图（凹凸效果）
const doorHeightTexture=textureLoader.load('./textures/door/height.jpg')
// 导入粗糙贴图（反射光效果）
const roughnessTextrue=textureLoader.load('./textures/door/roughness.jpg')
const metalnessTexture=textureLoader.load('./textures/door/metalness.jpg')

// 导入法线贴图(颜色代表一个方向的向量，改变光的效果)
const normalTexture=textureLoader.load('./textures/door/normal.jpg')

//创建一个立方缓冲几何体
const cubeGeometry=new THREE.BoxGeometry(1,1,1,100,100,100)
//创建基础网格材质
const material=new THREE.MeshStandardMaterial({
    color:'#ffff00',
    //贴上纹理
    map:doorColorTexture,
    
    displacementMap:doorHeightTexture,//置换贴图
    displacementScale:0.1,//影响程度
    transparent:true,//允许透明
    
    alphaMap:doorAplhaTexture,//灰度纹理贴图，控制表面不透明度（黑色透明，白色不透明）
    side:DoubleSide,//渲染双面（防止背面看不到）
    
    aoMap:doorAotexture,//环境遮挡贴图(需要添加第二组uv)
    aoMapIntensity:1.2,//环境遮挡强度，默认为1
    
    roughness:1,//粗糙度
    roughnessMap:roughnessTextrue,//粗糙贴图

    metalness:1,//金属度
    metalnessMap:metalnessTexture,//金属度贴图

    normalMap:normalTexture,//法线贴图
    normalMapType:THREE.ObjectSpaceNormalMap//法线贴图的类型
})
//创建几何体
const cube=new THREE.Mesh(cubeGeometry,material)
//添加到场景
scene.add(cube)
// 给cube添加第二组uv
cubeGeometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(cubeGeometry.attributes.uv.array,2)
)


// 添加一个平面(width,height,宽分段数，高分段数)
const planeGeometry=new THREE.PlaneGeometry(1,1,200,200)
const plane=new THREE.Mesh(planeGeometry,material)
plane.position.set(1.5,0,0)
scene.add(plane)
//给平面设置第二组uv
planeGeometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(planeGeometry.attributes.uv.array,2)
)

// 添加环境光（颜色，强度）
const light=new THREE.AmbientLight(0xffffff,0.5) 
scene.add(light)
// 平行光
const directionlLight=new THREE.DirectionalLight( 0xffffff, 1 );
// 平行光的位置
directionlLight.position.set(10,10,10)
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


