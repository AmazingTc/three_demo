//引入threejs
import * as THREE from 'three'
import { Loader, PolarGridHelper } from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
//顶点法线辅助
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
//切线辅助
import {VertexTangentsHelper} from 'three/examples/jsm/helpers/VertexTangentsHelper'
let scene, camera, controls, renderer = null

let light
let vertexNormalsHelper
let vertexTangentsHelper
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器

initMeshes()

render()
/*

*/


//初始化灯光
function initLights() {
    // scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.SpotLight(0xffffff, 0.6)
    light.position.set(100, 100, 100)
    scene.add(light)
}
// 初始化物体
function initMeshes() {
    new GLTFLoader().load('./models/gltf/LeePerrySmith/LeePerrySmith.glb', gltf => {
        const model = gltf.scene.children[0]
        scene.add(model)
        //法线辅助
        vertexNormalsHelper = new VertexNormalsHelper(model,0.05)
        scene.add(vertexNormalsHelper)
        //切线辅助，需要先开启geometry计算
        model.geometry.computeTangents()
        vertexTangentsHelper=new VertexTangentsHelper(model,0.05)
        scene.add(vertexTangentsHelper)


        //模型盒子辅助
        scene.add(new THREE.BoxHelper(model))


        //网格线框几何体，来对一个geometry以线框的形式进行查看。
        const wirefame=new THREE.WireframeGeometry(model.geometry)
        //线段 它和Line几乎是相同的，唯一的区别是它在渲染时使用的是gl.LINES， 而不是gl.LINE_STRIP。
        const line=new THREE.LineSegments(wirefame)
        line.material.depthTest=false//是否在渲染此材质时启用深度测试
        line.material.opacity=0.25
        line.material.transparent=true
        line.position.x=4
        scene.add(line)


    })

    initUtils()
}


// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性

    //坐标轴辅助
    scene.add(new THREE.AxesHelper(5))
    //pointlight辅助，可以看见灯光的位置
    scene.add(new THREE.PointLightHelper(light, 15))
    //矩阵网格辅助(黑色)
    scene.add(new THREE.GridHelper(10, 3, 0x000000, 0x000000))

    //极坐标网格辅助(红色)
    //极坐标格半径 
    scene.add(new THREE.PolarGridHelper(10, 3, 8, 64, 0xff0000, 0x0000ff))


}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
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
    renderer.render(scene, camera)
    controls.update()
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(10, 10, 10)
    camera.lookAt(scene.position)
    camera.updateProjectionMatrix()
}
window.addEventListener('resize', (e) => {
    //更新相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight
    //更新相机投影矩阵
    camera.updateProjectionMatrix()
    //更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    //更新渲染器像素比
    renderer.setPixelRatio(window.devicePixelRatio)
})


