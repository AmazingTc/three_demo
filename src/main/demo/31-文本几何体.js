//引入threejs
import * as THREE from 'three'
// 导入轨迹球控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 导入字体加载器
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
let scene, camera, controls, renderer = null
let ground, textMesh
let light
/*
   1.导入字体加载器FontLoader
   2.导入TextGeometry
   2.文本几何体使用 typeface.json所生成的字体,导入json文件
   3.创建TextGeometry实例
   4.创建材质
   5.添加到场景
*/
initCamera()
initLights()
initRenderer()
initUtils()
initMeshes()
render()



//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0x222222))//环境光
    light = new THREE.PointLight(0xffffff)//点光源（灯泡）
    light.position.set(100, 100, 100)
    scene.add(light)
}

//创建文本
function initMeshes() {
    const materials = [
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true,
        }),//文字面材质
        new THREE.MeshPhongMaterial({
            color: 0xff0000,
        })//文字挤压范围内的材质
    ]
    const loader = new FontLoader()
    loader.load('./fonts/helvetiker_bold.typeface.json', (font) => {
        //用于将文本生成为单一的几何体的类
        const geometry = new TextGeometry(
            'Hello three.js!',
            {
                font: font,
                size: 50,
                height: 10,//挤出文本的厚度
                curveSegments: 20,//表示文本的曲线上点的数量
                bevelThickness: 2,//文本上斜角的深度
                bevelSize: 1.5,//斜角与原始文本轮廓之间的延伸距离
                bevelEnabled: true,//是否开启斜角
            }
        )
        //边界矩形不会默认计算，需要调用该接口指定计算边界矩形，否则保持默认值 null
        geometry.computeBoundingBox()
        //字符宽度/2
        const xOffset = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2
        textMesh = new THREE.Mesh(geometry, materials)
        textMesh.position.set(-xOffset, 10, 0)
        scene.add(textMesh)

        const plane = new THREE.PlaneGeometry(500, 500)
        const material = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            shininess:200,
            
        })
        //地面
        ground = new THREE.Mesh(plane, material)
        ground.rotateX(-Math.PI / 2)
        scene.add(ground)
        //设置阴影
        renderer.shadowMap.enabled = true
        light.castShadow = true
        textMesh.castShadow = true
        ground.receiveShadow = true
    })

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
    //改变渲染器输入编码
    renderer.outputEncoding = THREE.sRGBEncoding
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    renderer.render(scene, camera)
    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0x2222222)
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 250, 700)
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

