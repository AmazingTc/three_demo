//引入threejs
import * as THREE from 'three'
import { CubeTexture, Curve } from 'three'
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
// 创建一个场景
const scene=new THREE.Scene()
// 创建一个透视相机
const camera=new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 相机位置
camera.position.set(0,0,10)//x,y,z轴坐标
//添加相机到场景
scene.add(camera)


// 添加一个几何物体
const cubeGemetry=new THREE.BoxGeometry(1,1,1)
//创建材质
const cubeMaterial=new THREE.MeshBasicMaterial({color:0xffff00})
// 根据几何体和材质创建物体
const cube=new THREE.Mesh(cubeGemetry,cubeMaterial)
//设置物体位置
// cube.position.set(5,0,0)
// 设置物体缩放
cube.scale.set(1,1,1)
// 将几何体添加到场景中
scene.add(cube)


// 初始化渲染器
const renderer=new THREE.WebGLRenderer()
//设置渲染尺寸大小
renderer.setSize(window.innerWidth,window.innerHeight)
//将webgl渲染的canvas内容添加到body
console.log(renderer);
document.body.appendChild(renderer.domElement)


// 创建轨道控制器
const controls=new OrbitControls(camera,renderer.domElement)

//添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper( 5 );
//添加都场景
scene.add(axesHelper)


// 设置时钟跟踪时间
const clock=new THREE.Clock()

let x=0
// 渲染函数
function render(){
    // let time=clock.getElapsedTime()
    let delaTime=clock.getDelta()
    // console.log('时钟运行总时长',time);
    //此处获取为两帧之间间隔的毫秒数
    console.log('两次获取间隔时间',delaTime);
    // let t=time/1000%5
    // cube.position.x=t*1
    // if(cube.position.x>5){
    //     cube.position.x=0
    // }
    // 使用渲染器，通过相机将场景渲染进来
     renderer.render(scene,camera)
    //请求动画帧,渲染下一帧就会调用render函数
    requestAnimationFrame(render)
}
render()



