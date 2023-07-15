//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//动画混入器
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
let scene, camera, controls, renderer = null
let textureCube
let meshes=[]
/*
    天空盒子是针对场景的操作


*/  
initCamera()
initLights()
initRenderer()
initEnvironment()
initUtils()
initMeshes()
render()



//初始化灯光
function initLights() {
   scene.add(new THREE.AmbientLight(0xffffff))
}
//创建物体
function initMeshes() {
    //球体
   const geometry=new THREE.SphereGeometry(0.1,64,64)
   const material=new THREE.MeshBasicMaterial({
    color:0xffffff,
    envMap:textureCube,//材质环境映射
    
   })
   for(let i=0;i<500;i++){
    const mesh=new THREE.Mesh(geometry,material)
    //随机位置
    mesh.position.set(Math.random()*10-5,Math.random()*10-5,Math.random()*10-5 )
    mesh.scale.x=mesh.scale.y=mesh.scale.z=Math.random()*3+1 //随机缩放1到四倍
    meshes.push(mesh)
    scene.add(mesh)
  }
}

//初始化场景环境
function initEnvironment(){
    const pmreGenerator=new THREE.PMREMGenerator(renderer)
    scene.environment=pmreGenerator.fromScene(new RoomEnvironment(),0.001).texture
}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper)

}
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //改变渲染器输入编码
    // renderer.outputEncoding = THREE.sRGBEncoding
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
let index=1
// 渲染函数
function render() {
    const time=0.001*Date.now()
    renderer.render(scene, camera)
    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
    for(let i=0;i<meshes.length;i++){
        const s=meshes[i]
        s.position.x=5*Math.cos(time+i)
        s.position.y=5*Math.sin(time+i)

    }
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // 文件路径，在dist目录下
    const urls=[
        './textures/pisa/px.png',//x轴正方向图片
        './textures/pisa/nx.png',//x轴负方向图片
        './textures/pisa/py.png',
        './textures/pisa/ny.png',
        './textures/pisa/pz.png',
        './textures/pisa/nz.png',
    ]
    //加载图片
    textureCube=new THREE.CubeTextureLoader().load(urls)
    //设置背景图片
    scene.background=textureCube


    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 2, 15)
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

