//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, renderer = null
//着色器编写水面
import { Water } from 'three/examples/jsm/objects/Water'
import { Sky } from 'three/examples/jsm/objects/Sky'
// 导入UI界面控制库
import * as dat from 'dat.gui'
//导入obj加载器
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { PMREMGenerator } from 'three'
let gui
let light
let water, sky, boat
let sunPosition
let sunParams
let pmremGenerator, renderTarget//环境效果处理
/*
    水面制作：1.导入examples下的水面
             2. 创建水面：water = new Water(
                     new THREE.PlaneGeometry(1000, 1000),//bufferGeometry
                     {
                    waterNormals: new THREE.TextureLoader().load(
                        './textures/waternormals.jpg',
                        texture => {
                            texture.wrapS = texture.wrapT = THREE.RepeatWrapping
                           }
                         ),
                    subDirection: sunPosition,
                    sunColor: 0xffffff,
                     waterColor: 0x0010ef
                    }
                 ) 
            3.添加到场景，scene.add(water)
            4.渲染函数中根据时间线动画 : water.material.uniforms['time'].value += 1 / 100       

     天空制作：1.导入examples中的Sky
               2.sky=new Sky()
               3.   sky.scale.set(1000,1000,1000)//缩放
                    sky.material.uniforms['sunPosition'].value.copy(sunPosition)//太阳位置
                    scene.add(sky)//添加到场景     
               4.改变渲染器色调映射： renderer.toneMapping=THREE.ACESFilmicToneMapping                
*/

initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initMeshes()//初始化图像



//初始化灯光
function initLights() {
    // scene.add(new THREE.AmbientLight(0x222222))//环境光
    light = new THREE.DirectionalLight(0xffffff)//点光源（灯泡）
    light.position.set(100, 10, 0)
    scene.add(light)
}
// 初始化图形
function initMeshes() {
    //太阳位置
    sunPosition = new THREE.Vector3(100, 10, 0)
    sunParams = {
        elevation: 2,//极角 (纬度)
        azimuth: 90,//方位角（经度）
    }

    // 水面
    water = new Water(
        new THREE.PlaneGeometry(1000, 1000),//bufferGeometry
        {//options ShaderMaterial 着色器材质
            waterNormals: new THREE.TextureLoader().load(
                './textures/waternormals.jpg',
                texture => {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
                }
            ),
            subDirection: sunPosition,
            sunColor: 0xffffff,
            waterColor: 0x1001cc
        }
    )
    water.rotateX(-Math.PI / 2)
    scene.add(water)

    //天空
    sky = new Sky()
    sky.scale.set(1000, 1000, 1000)//缩放
    sky.material.uniforms['sunPosition'].value.copy(sunPosition)//太阳位置
    scene.add(sky)

    if (renderTarget !== undefined) renderTarget.dispose()
    renderTarget = pmremGenerator.fromScene(sky)
    scene.environment = renderTarget.texture

    //船体    
    const loader = new OBJLoader()
    const texture = new THREE.TextureLoader().load('./textures/door/color.jpg')
    const material = new THREE.MeshLambertMaterial({
        map: texture,
    })
    loader.load('./models/AmerWarship.obj', (obj) => {
        obj.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material = material
            }
        })
        boat = obj
        scene.add(obj)
        render()//渲染
    })

    //gui
    gui.add(sunParams, 'elevation', 0, 90, 0.05).name('太阳高度').onChange((value) => {
        const theta = THREE.MathUtils.degToRad(90 - sunParams.elevation)//极角
        const phi = THREE.MathUtils.degToRad(sunParams.azimuth)//方位角
        sunPosition.setFromSphericalCoords(1, theta, phi)
        sky.material.uniforms['sunPosition'].value.copy(sunPosition)
        light.position.copy(sunPosition)

        if (renderTarget !== undefined) renderTarget.dispose()
        renderTarget = pmremGenerator.fromScene(sky)
        scene.environment = renderTarget.texture
    })


}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 10, 0)
    controls.minDistance = 40
    controls.maxDistance = 200
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)
    gui = new dat.GUI()
}

function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
    pmremGenerator = new THREE.PMREMGenerator(renderer)
}
// 渲染函数
function render() {

    controls.update()
    //水面随时间线变化
    water.material.uniforms['time'].value += 1 / 100
    renderer.render(scene, camera)
    //船随时间运动
    const time = window.performance.now() * 0.001
    boat.position.y = Math.sin(time) * 2
    boat.rotation.y += Math.random() * 0.001 - 0.001
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000)
    camera.position.set(-100, 30, 0)
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

