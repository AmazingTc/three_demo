//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//效果合成器
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
//渲染通道，用于渲染场景
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
//故障效果处理，用于将结果输出到场景
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'
let scene, camera, controls, renderer = null
let light
let object //物体容器
let composer //效果合成器
/*
  后期处理：GlitchPass(画面抖动，类似于电视屏幕故障)
        1.引入效果合成器EffectComposer(必须)
        2.引入渲染同道RenderPass（必须）
        3.导入需要的通道
        4.创建合成器new EffectComposer(renderer)，添加通道composer.addPass(new xxxPass)
        5.渲染：composer.render()

  渲染通道：
BloomPass   该通道会使得明亮区域参入较暗的区域。模拟相机照到过多亮光的情形
DotScreenPass   将一层黑点贴到代表原始图片的屏幕上
FilmPass    通过扫描线和失真模拟电视屏幕
MaskPass    在当前图片上贴一层掩膜，后续通道只会影响被贴的区域
RenderPass  该通道在指定的场景和相机的基础上渲染出一个新的场景
SavePass    执行该通道时，它会将当前渲染步骤的结果复制一份，方便后面使用。这个通道实际应用中作用不大；
ShaderPass  使用该通道你可以传入一个自定义的着色器，用来生成高级的、自定义的后期处理通道
TexturePass 该通道可以将效果组合器的当前状态保存为一个纹理，然后可以在其他EffectCoposer对象中将该纹理作为输入参数
  
*/
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initMeshes()//初始化图像
render()


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight({ intensity: 1 }))//环境光
    light = new THREE.DirectionalLight(0xffffff)//点光源（灯泡）
    light.position.set(10, 10, 10)
    scene.add(light)
}
// 初始化图形
function initMeshes() {
    //创建一个容器
    object = new THREE.Object3D()
    scene.add(object)
    const geometry=new THREE.SphereGeometry(1,4,4)
    //为容器添加100个物体
    for(let i=0;i<100;i++){
        const material=new THREE.MeshPhongMaterial({
            color:0xffffff*Math.random(),
        })
        const mesh=new THREE.Mesh(geometry,material)
        //normalize:将该向量转换为单位向量（unit vector）， 也就是说，将该向量的方向设置为和原向量相同
        //-0.5~0.5
        mesh.position.set(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize()
        mesh.scale.x=mesh.scale.y=mesh.scale.z=Math.random()*50
        //位置缩放(-200~200)
        mesh.position.multiplyScalar(Math.random()*400)
        object.add(mesh)
    }

    // 创建合成器
    composer=new EffectComposer(renderer)
    //添加通道
    composer.addPass(new RenderPass(scene,camera))
    composer.addPass(new GlitchPass(10))
}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper)
}

function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.autoClear = false//定义renderer是否清除颜色缓存
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}

// 渲染函数
function render() {
    object.rotation.y+=0.005
    controls.update()
    composer.render()
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xffffff, 1, 1000)
    //正交相机
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.z = 400
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
    composer.setSize(window.innerWidth, window.innerHeight)
})

