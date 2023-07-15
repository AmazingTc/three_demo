//引入threejs
import * as THREE from 'three'
//第一人称控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'
let scene, camera, controls, renderer = null
let clock = new THREE.Clock()
let light
let mixer
let actionNames=[] //动画名称
let actions = {}//动作
let prevAction //上一个动作
let currentAction //当前动作
let currentActionObj = { state: 'Walking' } //操作GUI
let face 
const gui = new dat.GUI()
/*
    动画步骤：
        1.const model = gltf.scene 
        2.const clips=gltf.animations 
        3.mixer=new THREE.AnimationMixer(model)//动画混合器
        4.currentAction=mixer.clipAction(clips[2])
        5.currentAction.play()
        6.在render函数中根据delta更新mixer 
*/
initCamera()
initLights()
initRenderer()
initUtils()
initMeshes()




//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0x222222))//环境光
    light = new THREE.DirectionalLight(0xffffff)//点光源（灯泡）
    light.position.set(0, 20, 10)
    scene.add(light)
}


function initMeshes() {
    // 机器人
    const loader = new GLTFLoader()
    loader.load('/models/robot.glb', (gltf) => {
        const model = gltf.scene //Group
        const clips = gltf.animations //Array 模型动画
        mixer = new THREE.AnimationMixer(model)//动画混合器
        //循环动作
        const moreCountAction=['Walking','Running',"Dance",'Idle']
        //保存所有动画
        for(let i=0;i<clips.length;i++){
            const clip=clips[i]
            const action=mixer.clipAction(clip)
            if(!moreCountAction.includes(clip.name)){
                //动作只播放一次
                action.loop=THREE.LoopOnce
                action.clampWhenFinished=true//停到结束位置
            }
            actions[clip.name]=action
            actionNames.push(clip.name)
        }
        face=model.getObjectByName('Head_4')
        actions['Walking'].play()
        currentAction=actions['Walking']
        /*
        currentAction = mixer.clipAction(clips[2])
        currentAction.play()
        //morph
        //表情
        const face=model.getObjectByName('Head_4')
        // face.morphTargetDirectionary//{angry:0,surprised:1,sad:2} 表情状态
        // face.morphTargetInfluences [0,0,0] //morph影响程度
        face.morphTargetInfluences[0]=1
        */
        model.scale.set(0.5, 0.5, 0.5)
        scene.add(model)
        guiConfig()
        render()
    })
    // 网格
    const grid = new THREE.GridHelper(200, 30, 0, 0)
    grid.material.transparent = true
    grid.material.opacity = 0.2
    scene.add(grid)
    //地面
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshPhongMaterial({
            color: 0x999999
        })
    )
    plane.position.y=-1
    plane.rotateX(-Math.PI / 2)
    scene.add(plane)


}
// 调试器
function guiConfig(){
    
    // 选取动画
    const clilpFolder=gui.addFolder('动画')
    clilpFolder.add(currentActionObj,'state').options(actionNames).onChange(()=>{
        //马上要做的动作
        const nextActionName=currentActionObj['state']
        fadeToAction(nextActionName,1)
    })
    //表情
    const morphFolder=gui.addFolder('表情')
    const morphNames=Object.keys(face.morphTargetDictionary)//['Angry', 'Surprised', 'Sad']
    for(let i=0;i<morphNames.length;i++){
        morphFolder.add(face.morphTargetInfluences,i).name(`${morphNames[i]}`).max(1).min(0).step(0.01)
    }

    //动作穿插
    //主动作
    const states=['Idle','Walking','Running','Dance','Death','Sitting','Standing']
    const complexFolder=gui.addFolder('多动作')
    complexFolder.add(currentActionObj,'state').options(states).onChange(()=>{
         //马上要做的动作
         const nextActionName=currentActionObj['state']
         fadeToAction(nextActionName,1)
    })
    const obj={}//{'Walking',function}
    //副动作
    const emotes=['Jump','Yes','No','Wave','Punch','ThumbsUp']
    for(let i=0;i<emotes.length;i++){
        const name=emotes[i]
        obj[name]=function(){
            fadeToAction(name,1)
            mixer.addEventListener('finished',restroeState)
        }
        complexFolder.add(obj,name)//执行回调
    }
}
function fadeToAction(name,duration){
    prevAction=currentAction//保存旧的
    currentAction=actions[name]//更新动画
    prevAction.fadeOut(duration)//停止上一个
    currentAction.reset().fadeIn(duration).play()//播放选中的动作

}
function restroeState(){
    mixer.addEventListener('finished',restroeState)

    fadeToAction(currentActionObj.state,1)
}

// 初始化工具
function initUtils() {
    //第一人称控制器
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
    const delta = clock.getDelta()
    renderer.render(scene, camera)
    controls.update()
    mixer.update(delta)
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe0e0e0)
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100)
    camera.position.set(-5, 3, 10)
    camera.lookAt(0, 2, 0)
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

