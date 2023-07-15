//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//模型加载器
import { GLTFLoader } from 'three//examples/jsm/loaders/GLTFLoader'

let scene, camera, controls, renderer = null
let dirLight //平行光
let model //模型
let animations //模型动画
let mixer //动画混合器
let ground //地面
let clock=new THREE.Clock()
initCamera()
initLights()
initRenderer()
initUtils()
initMeshes()

render()



//初始化灯光
function initLights() {
    scene.add(new THREE.HemisphereLight(0xffffff,0x444444))//环境光
    const dirLigh=new THREE.DirectionalLight(0xffffff)
    dirLigh.position.set(-10,10,-10)
    dirLigh.castShadow=true
    scene.add(dirLigh)
}
//创建物体
function initMeshes() {
    //创建模型加载器
    const loader = new GLTFLoader()
    //加载模型
    loader.load('./models/Soldier.glb', (gltf) => {
        model = gltf.scene
        scene.add(model)
        const clip=gltf.animations[1]
        mixer=new THREE.AnimationMixer(gltf.scene)
        const action=mixer.clipAction(clip)
        action.play()
        model.traverse((child)=>{
            if(child.isMesh){
                child.castShadow=true
            }
        })
    })
    // 创建一个平面
    const geometry=new THREE.PlaneGeometry(10,10)
    const material=new THREE.MeshPhongMaterial({color:0x999999})
    ground=new THREE.Mesh(geometry,material)
    ground.receiveShadow=true
    ground.rotation.x=-Math.PI/2
    scene.add(ground)
}



// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target=new THREE.Vector3(0,2,0)
    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)

}
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //改变渲染器输入编码
    renderer.outputEncoding = THREE.sRGBEncoding
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}

// 渲染函数
function render() {
    let delta=clock.getDelta()
    renderer.render(scene, camera)
    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
    if(mixer){mixer.update(delta)}
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x888888)//场景背景颜色
    scene.fog=new THREE.Fog(0xa0a0a0,10,50)//线性雾
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(1, 2, -8)
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

