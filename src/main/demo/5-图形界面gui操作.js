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
const cubeGemetry=new THREE.BoxGeometry(1,1,1)
//创建材质
const cubeMaterial=new THREE.MeshBasicMaterial({color:0xffff00})
// 根据几何体和材质创建物体
const cube=new THREE.Mesh(cubeGemetry,cubeMaterial)
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
// 设置控制器阻尼，让控制器更真实
controls.enableDamping=true

//添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper( 5 );
//添加都场景
scene.add(axesHelper)


const gui=new dat.GUI()
// 添加一个控件，修改物体x轴位置
gui.add(cube.position,"x").min(0).max(5).step(0.1).name('正方体x轴').
onChange(value=>{
    //获取修改的值
    console.log('当前x的值为：',value);
}).onFinishChange(value=>{
    //完成修改时触发
    console.log('完成修改后的值为：',value);
})

const params={
    color:'#ffff00',
    fn:()=>{
        //让物体运动
        gsap.to(cube.position,{x:5,duration:3})
    }
}
//添加一个控件，修改物体颜色
gui.addColor(params,'color').onChange(value=>{
    //改变物体颜色
    cube.material.color.set(value)
}).name('物体颜色')
//添加选项框
gui.add(cube,"visible").name('显示隐藏')
// 设置点击按钮触发某个事件
gui.add(params,'fn').name('触发移动')
//创建一个文件夹
var folder=gui.addFolder('设置立方体')
//添加到文件夹
folder.add(cube.material,"wireframe")



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


