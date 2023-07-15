//引入threejs
import * as THREE from 'three'
import { CubeTexture, Curve } from 'three'
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
//导入gsap动画库
import gsap from 'gsap'


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


//设置动画
//改变cube物体的位置属性 将x位置改为5 花费5s时间  速度快慢快
const animate=gsap.to(cube.position,{
    x:5,        
    duration:5,
    ease:"power1.inOut",//动画速度
    repeat:-1,//重复次数  -1无限循环
    yoyo:true,//往返运动
    delay:2,//延时时间
    onComplete:()=>{
        console.log('动画完成');
    },
    onStart:()=>{
        console.log('动画开始');
    }
})
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
//改变cube物体的旋转属性 绕x旋转360度 花费5s时间
gsap.to(cube.rotation,{
    x:Math.PI*2,
    duration:5,
    repeat:2,
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


