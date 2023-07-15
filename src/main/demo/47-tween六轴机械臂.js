//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//加载 .dae格式模型
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'
//tween动画库
import TWEEN from '@tweenjs/tween.js'

let scene, camera, controls, renderer = null
let clock = new THREE.Clock()
let light
let tween, start = {}, target = {}
let dae  //模型导入
let kineMatics //轴
let grid
let oldState = {}
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initModel()//创建物体


/*
tweenjs中文文档 ：https://github.com/tweenjs/tween.js/blob/master/README_zh-CN.md
npm install @tweenjs/tween.js
*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(50, 50, 50)
    light.castShadow = true
    scene.add(light)
}
// 初始化物体
function initModel() {

    //创建网格
    grid = new THREE.GridHelper(20, 20)
    scene.add(grid)

    //实例化加载器
    const loader = new ColladaLoader()
    loader.load(
        './models/collada/abb_irb52_7_120.dae',
        function (collada) {
            dae = collada.scene
            scene.add(dae)
            dae.traverse(function (child) {
                if (child.isMesh) {
                    child.material.flatShading = true
                    child.material.color = new THREE.Color(Math.random() * 0xffffff)
                }
            })
            dae.scale.set(5, 5, 5)//放大五倍
            kineMatics = collada.kinematics//模型的轴（6轴机械臂）
            setUpTween()
            render()
        }
    )

}

//动画设置
function setUpTween() {
    const duration = THREE.MathUtils.randInt(1000, 5000) //1到5s

    for (const k in kineMatics.joints) {
        if (kineMatics.joints.hasOwnProperty(k)) {
            //一共有8个，6个是转动轴的定义
            if (!kineMatics.joints[k].static) {
                const joint = kineMatics.joints[k]

                
                const old=target[k] //上一个结束的位置
                //如果有上次结束位置 则当做本次的开始位置
                const position =old?old:joint.zeroPosition//初始都为0
                start[k] = position

                //目标位置 范围内随机
                target[k] = THREE.MathUtils.randInt(
                    joint.limits.min,
                    joint.limits.max
                )
            }
        }
    }
    //创建动画
    tween = new TWEEN.Tween(start)
        .to(target, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function (obj) {
            for (const k in kineMatics.joints) {
                if (kineMatics.joints.hasOwnProperty(k)) {
                    //一共有8个，6个是转动轴的定义
                    if (!kineMatics.joints[k].static) {
                        kineMatics.setJointValue(k, obj[k])
                    }
                }
            }
        }).start().onComplete(obj => {
            setUpTween()
        })

}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    const axesHelper = new THREE.AxesHelper(10);
    // scene.add(axesHelper)
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.autoClear = true//定义renderer是否清除颜色缓存
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render(time) {
    const delta = clock.getDelta()
    TWEEN.update(time)//更新
    grid.rotation.y += 0.005
    dae.rotation.z += 0.005
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(10, 10, 10)
    camera.lookAt(0, 4, 0)
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


