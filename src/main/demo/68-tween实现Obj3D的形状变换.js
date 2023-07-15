//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer'
import TWEEN from '@tweenjs/tween.js' //动画库

let scene, camera, controls, renderer
const particlesCount = 512 //个数
const positions = [] //位置信息
const objs = []
let current = 0
initCamera()//初始化相机
initRenderer()//初始化渲染器
initUtils()
initMeshes()
render()

/*

*/

// 初始化物体
function initMeshes() {
    // 初始化位置信息

    // 平面实现  状态1
    const amountX = 16
    const amountZ = 32
    const separationPlane = 150
    const offsetX = ((amountX - 1) * separationPlane) / 2
    const offsetZ = ((amountZ - 1) * separationPlane) / 2
    for (let i = 0; i < particlesCount; i++) {
        const x = (i % amountX) * separationPlane
        const z = Math.floor(i / amountZ) * separationPlane
        const y = (Math.sin(x * 0.5) + Math.sin(z * 0.5)) * 200 //让平面正弦波动
        positions.push(x-offsetX, y, z-offsetZ)
    }

    //状态2 立方体
    const amount = 8
    const separationCube = 150
    const offset = ((amount - 1) * separationCube) / 2
    for (let i = 0; i < particlesCount; i++) {
        const x = (i % amount) * separationCube
        const z = Math.floor(i / amount % amount) * separationCube
        const y = Math.floor(i / (amount * amount)) * separationCube
        positions.push(x-offset/2, y, z)
    }

    //状态3随机分布
    for(let i=0;i<particlesCount;i++){
        positions.push(
            (Math.random()-0.5)*4000,
            (Math.random()-0.5)*4000,
            (Math.random()-0.5)*4000,
        )
    }

    //状态4 球
    const radius=750
    for(let i=0;i<particlesCount;i++){
        const phi=Math.acos(-1+(2*i)/particlesCount)
        const theta=Math.sqrt(particlesCount*Math.PI)*phi

        positions.push(
            radius*Math.cos(theta)*Math.sin(phi),
            radius*Math.sin(theta)*Math.sin(phi),
            radius*Math.cos(phi),
        )
    }


    console.log(positions);
    const image = document.createElement('img')
    image.src = 'textures/sprite.png'
    image.addEventListener('load', e => {
        //初始化的位置
        for (let i = 0; i < particlesCount; i++) {
            const obj = new CSS3DSprite(image.cloneNode())
            obj.position.x = (Math.random() - 0.5) * 4000 //-2000~2000
            obj.position.y = (Math.random() - 0.5) * 4000 //-2000~2000
            obj.position.z = (Math.random() - 0.5) * 4000 //-2000~2000
            scene.add(obj)
            objs.push(obj)
        }
        transition()
    })


}
function transition(){
    //positions中状态的偏移
    const offset=current*particlesCount*3
    const duration=2000
    //i:粒子索引  j:当前状态下粒子位置索引
    for(let i=0,j=offset;i<particlesCount;i++,j+=3){
        const obj=objs[i]
        new TWEEN.Tween(obj.position)
            .to({
                x:positions[j],
                y:positions[j+1],
                z:positions[j+2],
            },Math.random()*duration+duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start()
    }
    //动画结束实现切换
    new TWEEN.Tween({})
        .to({},duration*2)
        .onComplete(transition)
        .start()
    current=(current+1)%4
}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    scene.add(new THREE.AxesHelper(300))
}
//初始化渲染器
function initRenderer() {

    renderer = new CSS3DRenderer()
    // renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render(time) {
    renderer.render(scene, camera)
    controls.update()
    TWEEN.update()
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xb0b0b0)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000)
    camera.position.set(600, 400, 1500)
}
window.addEventListener('resize', (e) => {
    //更新相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight
    //更新相机投影矩阵
    camera.updateProjectionMatrix()
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
})

