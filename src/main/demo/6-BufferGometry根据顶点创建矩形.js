//引入threejs
import * as THREE from 'three'
import { CubeTexture, Curve } from 'three'
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
// 导入UI界面控制库
import * as dat from 'dat.gui'

// 创建一个场景
const scene=new THREE.Scene()
// 创建一个透视相机
const camera=new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 相机位置
camera.position.set(5,5,5)//x,y,z轴坐标
//添加相机到场景
scene.add(camera)


// 添加一个几何物体
const geometry=new THREE.BufferGeometry()
//顶点数组，三个点组成一个面
const vertives=new Float32Array([
    -1.0,-1.0,1.0,
    1.0,-1.0,1.0,
    1.0,1.0,1.0,

    1.0,1.0,1.0,
    -1.0,1.0,1.0,
    -1.0,-1.0,1.0,
])
geometry.setAttribute('position',new THREE.BufferAttribute(vertives,3))
//创建材质
const material=new THREE.MeshBasicMaterial({color:0xffff00})
//创建物体
const mesh=new THREE.Mesh(geometry,material)
//添加到场景
scene.add(mesh)

// 初始化渲染器
const renderer=new THREE.WebGLRenderer()
//设置渲染尺寸大小
renderer.setSize(window.innerWidth,window.innerHeight)
//将webgl渲染的canvas内容添加到body
console.log(renderer);
document.body.appendChild(renderer.domElement)


// 创建轨道控制器
const controls=new OrbitControls(camera,renderer.domElement)
// 设置控制器阻尼，让控制器更真实
controls.enableDamping=true

//添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper( 5 );
//添加都场景
scene.add(axesHelper)


//双击控制进入全屏
window.addEventListener('dblclick',()=>{
   const fullScreenElement=document.fullScreenElement
   if(fullScreenElement){
        document.exitFullscreen()
   } else {
        //让canvas全屏
        renderer.domElement.requestFullscreen()
   }
})

// 渲染函数
function render(){
    controls.update()//设置阻尼之后必须使用更新
    // 使用渲染器，通过相机将场景渲染进来
     renderer.render(scene,camera)
    //请求动画帧,渲染下一帧就会调用render函数
    requestAnimationFrame(render)
}
render()
// 尺寸自适应渲染
window.addEventListener('resize',()=>{
    //更新相机宽高比
    camera.aspect=window.innerWidth/window.innerHeight
    //更新相机投影矩阵
    camera.updateProjectionMatrix()
    //更新渲染器
    renderer.setSize(window.innerWidth,window.innerHeight)
    //更新渲染器像素比
    renderer.setPixelRatio(window.devicePixelRatio)
})


