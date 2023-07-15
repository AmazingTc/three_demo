//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, renderer = null
let light
let mouseX=0,mouseY=0//鼠标坐标
let geometry //几何体
let particles //雪花
let material //雪花纹理
let vertices //雪花位置信息

initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initMeshes()//初始化图像
render()//渲染


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff)//点光源（灯泡）
    light.position.set(0, 20, 10)
    scene.add(light)
}
// 初始化图形
function initMeshes() {
    geometry=new THREE.BufferGeometry()
    vertices=[]
    //创建随机位置
    for(let i=0;i<1000;i++){
        const x=Math.random()*2000-1000//-1000~+1000
        const y=Math.random()*2000-1000
        const z=Math.random()*2000-1000
        vertices.push(x,y,z)
    }
    //导入雪花纹理
    const texture=new THREE.TextureLoader().load('./textures/sprites/snowflake2.png')
    //设置雪花位置
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3))
    //创建材质
    material=new THREE.PointsMaterial({
        size:50,//大小
        transparent:true,//允许透明
        alphaTest:0.5,//如果不透明度低于此值，则不会渲染材质。默认值为0。
        alphaMap:texture,//一张灰度纹理，用于控制整个表面的不透明度。（黑色：完全透明；白色：完全不透明）
        map:texture,//纹理贴图
    })
    console.log(vertices);
    //点
    particles=new THREE.Points(geometry,material)
    scene.add(particles)
    

}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper)
}

function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputEncoding = THREE.sRGBEncoding
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    // 颜色随时间改变
    const time=Date.now()*0.00005
    const h=(360*(time+1)%360)/260
    material.color.setHSL(h,0.5,0.5)
    renderer.render(scene, camera)
    //雪花飘落动画
    for(let i=1;i<vertices.length;i+=3){
        if(vertices[i]<-800){
            vertices[i]=800
        }
        vertices[i]-=Math.random()+0.8
    }
    //重新设置位置属性
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3))
    camera.position.x=-mouseX/2
    camera.position.y=mouseY/2
    camera.lookAt(0,0,0)
    controls.update()
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.fog=new THREE.FogExp2(0x000000,0.0001)
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000)
    camera.position.z=1000
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
window.addEventListener('pointermove',(e)=>{
    mouseX=e.clientX //0~window.innerWidth
    mouseY=e.clientY //0~window.innerHeight
})

