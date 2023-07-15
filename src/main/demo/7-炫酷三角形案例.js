//引入threejs
import * as THREE from 'three'
import { CubeTexture, Curve } from 'three'
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
camera.position.set(10, 10, 10)//x,y,z轴坐标
//添加相机到场景
scene.add(camera)

//创建50个三角形的面
for (let i = 0; i < 100; i++) {
    // 每个三角需要三个点，每个顶点需要三个值
    //创建一个几何面缓冲区
    const gometry = new THREE.BufferGeometry()
    const positionArr = new Float32Array(9)
    for (let j = 0; j < 9; j++) {
        //位置随机为-5 到 5之间
        positionArr[j] = Math.random()*11-5
    }
    gometry.setAttribute('position', new THREE.BufferAttribute(positionArr, 3))
    let color=new THREE.Color(Math.random(),Math.random(),Math.random)
    //创建材质
    const material = new THREE.MeshBasicMaterial({ color: color,transparent:true,opacity:0.5 })
    //创建物体
    const mesh = new THREE.Mesh(gometry, material)
    //添加到场景
    scene.add(mesh)
    gsap.to(mesh.rotation,{
        y:Math.PI*2,
        duration:20,
        repeat:-1,
    })
}



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


//双击控制进入全屏
window.addEventListener('dblclick', () => {
    const fullScreenElement = document.fullScreenElement
    if (fullScreenElement) {
        document.exitFullscreen()
    } else {
        //让canvas全屏
        renderer.domElement.requestFullscreen()
    }
})

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


