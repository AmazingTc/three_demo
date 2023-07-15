//引入threejs
import * as THREE from 'three'
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, renderer = null
let mesh,dirLight
let clip
let mixer
let clock=new THREE.Clock()
/*
    1.使用THREE.VectorKeyframeTrack等定义关键帧
    2.创建动画剪辑AnimationClip
    3.使用动画混合器AnimationMixer关联播放动画
    4.渲染函数更新混合器，mixer.update(delta)
*/


initCamera()
initLights()
initRenderer()
initUtils()
initMesh()
//初始化动画
initClip()
enableAnimation()

render()




//初始化灯光
function initLights() {
   scene.add(new THREE.AmbientLight(0xffffff,0.2))
   dirLight=new THREE.DirectionalLight(0xffffff,1)
   dirLight.position.set(10,10,5)
   scene.add(dirLight)
}
//创建物体
function initMesh(){
    const geometry=new THREE.BoxGeometry()
    const material=new THREE.MeshPhongMaterial({color:0xff0000})
    mesh=new THREE.Mesh(geometry,material)
    scene.add(mesh)
}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)

}
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({antialias:true})
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
    const delta=clock.getDelta()
    renderer.render(scene, camera)
    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
    mixer.update(delta)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background=new THREE.Color(0x888888)
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(10, 30, 50)
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

function initClip(){
    //创建向量类型的关键帧轨道
    //位置移动动画
    const positionKF=new THREE.VectorKeyframeTrack(
        '.position',//name 关键帧轨道(KeyframeTrack)的标识符
        [0,1,2,3],//关键帧的时间数组
        [
            //与时间数组中的时间点对应的值数组(每一帧position位置)
            0,0,0,
            10,10,0,
            10,0,0,
            0,0,0
        ]
    )

    //  大小缩放动画
     const scaleKF=new THREE.VectorKeyframeTrack(
        '.scale',//name 关键帧轨道(KeyframeTrack)的标识符
        [0,1,2,3],//关键帧的时间数组
        [
            //与时间数组中的时间点对应的值数组
           1,1,1,
           2,2,2,
           3,3,3,
           1,1,1
        ]
    )

    //旋转动画
    const xAxis=new THREE.Vector3(1,0,0)//绕x轴旋转
    //起始
    const qInitial=new THREE.Quaternion().setFromAxisAngle(xAxis,0)
    //结束
    const qFinal=new THREE.Quaternion().setFromAxisAngle(xAxis,Math.PI)
    const quaternionKF=new THREE.QuaternionKeyframeTrack(
        '.quaternion',//name 关键帧轨道(KeyframeTrack)的标识符
        [0,1,2,3],//关键帧的时间数组
        [
            //与时间数组中的时间点对应的值数组
           qInitial.x,qInitial.y,qInitial.z,qInitial.w,
           qFinal.x,qFinal.y,qFinal.z,qFinal.w,
           qInitial.x,qInitial.y,qInitial.z,qInitial.w,
           qFinal.x,qFinal.y,qFinal.z,qFinal.w,
        ]
    )


    //颜色改变动画
    const colorKF=new THREE.ColorKeyframeTrack(
        '.material.color',//改变的是材质的颜色
        [0,1,2,3],
        [
            1,0,0,//RGB三个颜色的占比 red
            0,1,0, //green
            0,0,1, //blue
            1,1,1 //white
        ]
    )

    // 透明度动画
    const opacityKF=new THREE.NumberKeyframeTrack(
        '.material.opacity',
        [0,1,2,3],
        [
            1,0.5,0.3,0.1
        ]
    )
    

    // 动画剪辑（AnimationClip）是一个可重用的关键帧轨道集，它代表动画    
    clip=new THREE.AnimationClip(
        'Action',//动画名称
        4,//持续时间
        [positionKF,scaleKF,quaternionKF,colorKF,opacityKF],//一个由关键帧轨道（KeyframeTracks）组成的数组。
    )
}
function enableAnimation(){
    //动画混合器是用于场景中特定对象的动画的播放器。当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。
    mixer=new THREE.AnimationMixer(mesh)
    const clipAction=mixer.clipAction(clip)
    clipAction.play()
}


