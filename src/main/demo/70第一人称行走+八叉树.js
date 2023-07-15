//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import { Octree } from 'three/examples/jsm/math/Octree';//八叉树
import{OctreeHelper} from 'three/examples/jsm/helpers/OctreeHelper'
import { Capsule } from 'three/examples/jsm/math/Capsule.js';//每个胶囊代表着一个物体的实例
//角色
const player={
    geometry:new Capsule(new THREE.Vector3(0,0.5,0),new THREE.Vector3(0,1,0),0.5),
    velocity:new THREE.Vector3(),//速度
    direction:new THREE.Vector3(),//方向
    onFloor:false,//是否在地面
}
//控制
let keyStates={}//按键状态 'keyW':true


let renderer
let scene, camera, controls, light
const clock = new THREE.Clock()
const GRAVITY = 30;//重力系数

const worldOctree=new Octree()//八叉树

initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()
initMeshes()


//初始化灯光
function initLights() {
    const emLight = new THREE.AmbientLight(0xffffff,0.5)
    scene.add(emLight)
    light = new THREE.DirectionalLight(0xfffffff)
    light.position.set(100, 100, 100)
    scene.add(light)
    // var planeShape = new CANNON.Plane();
}

function addListener() {
  window.addEventListener('mousedown',e=>{
    document.body.requestPointerLock()  //锁定鼠标
  })
  window.addEventListener('mousemove',e=>{
    if(document.pointerLockElement===document.body){
        camera.rotation.y-=e.movementX/500 //鼠标左右轴移动，相机y轴旋转
        camera.rotation.x-=e.movementY/500//鼠标上下移动
    }
  })
  window.addEventListener('keydown',e=>{
    if(document.pointerLockElement===document.body){
        keyStates[e.code]=true
    }
  })
  window.addEventListener('keyup',e=>{
    if(document.pointerLockElement===document.body){
        keyStates[e.code]=false
    }
  })

}



// 初始化物体
function initMeshes() {

    // 创建天空球体
    const sphereGeometry = new THREE.SphereGeometry(100, 50, 30)
    const textureLoader = new THREE.TextureLoader()
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load('./textures/sky.jpg'),
        side: THREE.BackSide // 显示内部
    })
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphereMesh.position.y-=30
    scene.add(sphereMesh)
    // 创建平面
    const planeGeometry = new THREE.PlaneGeometry(200, 200, 20, 20);
    const planeTexture = new THREE.TextureLoader().load('./test.jpg'); // 加载平面纹理
    const planeMaterial = new THREE.MeshPhongMaterial({map:planeTexture}); // 创建基于纹理映射的材质
    planeGeometry.rotateX(-Math.PI / 2);
    var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.y=-20

    scene.add(planeMesh);
    worldOctree.fromGraphNode(planeMesh)
    


    const imageLoader = new THREE.TextureLoader()
    const texture = imageLoader.load('./textures/house.png')
    new OBJLoader().load('./models/house.obj', obj => {
        obj.children[0].position.y = -18
        obj.children[0].material.map = texture
        // obj.scale.set(0.7, 0.7, 0.7)
        // obj.castShadow=true
        // obj.receiveShadow=true
        scene.add(obj)
        worldOctree.fromGraphNode(obj)
        new FBXLoader().load('./models/fbx_Grass/Grass.FBX', model => {
            // 创建草地纹理映射
            var grassTexture = new THREE.TextureLoader().load('./models/fbx_Grass/petal.jpg')
            var grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
            for (let i = 0; i < planeGeometry.attributes.position.array.length; i += 3) {
                var newGrass = new THREE.Mesh(model.children[0].geometry, grassMaterial); // 复制草地模型
                const x = planeGeometry.attributes.position.array[i]
                const y = planeGeometry.attributes.position.array[i + 1]
                const z = planeGeometry.attributes.position.array[i + 2]
                newGrass.scale.set(0.02, 0.02, 0.02); // 缩小草地模型的大小
                newGrass.position.set(
                    x + Math.random() * 10 - 5,
                    y,
                    z + Math.random() * 10 - 5
                )
                newGrass.rotateX(-Math.PI / 2); //旋转草地使其朝上
                planeMesh.add(newGrass); // 将草地添加到平面上
            }
            render()
            addListener()

        })
    })
}
// 初始化工具
function initUtils() {
    // controls = new OrbitControls(camera, renderer.domElement)
    // controls.enableDamping = true//允许阻尼
    // controls.dampingFactor = 0.04//阻尼惯性
    // controls.minPolarAngle = 0; // 45度
    // controls.maxPolarAngle = Math.PI / 2.5

    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper)

    const helper = new THREE.DirectionalLightHelper(light, 5);
    scene.add(helper);
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)


    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping

    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
//处理控制
function handleControls(deltaTime){
   
    const speedDelta=deltaTime*(player.onFloor?25:8)
    if(keyStates['KeyW']){
        //前进的方向*系数
        player.velocity.add(getMoveVector().multiplyScalar(speedDelta))
    }
    if(keyStates['KeyS']){
        //前进的方向*系数
        player.velocity.add(getMoveVector().multiplyScalar(-speedDelta))
    }
    if(keyStates['KeyA']){
        player.velocity.add(getMoveVector(1).multiplyScalar(-speedDelta))
    }
    if(keyStates['KeyD']){
        player.velocity.add(getMoveVector(1).multiplyScalar(speedDelta))
    }
    if(player.onFloor){
        if(keyStates['Space']){
            //跳跃
            player.velocity.y=15
        }
    }
}

//获取移动的方向
function getMoveVector(flag){
    camera.getWorldDirection(player.direction)
    player.direction.y=0
    player.direction.normalize()
    if(flag){
        //左右方向移动
        player.direction.cross(camera.up)//叉积，根据player面对的方向以及相机的上方向，求出与两向量垂直的方向
    }
    return player.direction
}

//player碰撞检查
function playerCollisions(){
    const result=worldOctree.capsuleIntersect(player.geometry)
    //无碰撞返回false，有碰撞返回一个对象{碰撞点法线,深度}
    if(result){
        player.onFloor=result.normal.y>0;
        if(!player.onFloor){
            player.velocity.addScaledVector(result.normal,-result.normal.dot(player.velocity))
        }
        player.geometry.translate(result.normal.multiplyScalar(result.depth))
    }else{
        player.onFloor=false
    }
}
//更新player
function updatePlayer(deltaTime){
    let damping=Math.exp(-5*deltaTime)-1//阻尼系数
    if(!player.onFloor){
        player.velocity.y-=GRAVITY*deltaTime//受重力影响
        damping*=0.1
    }
    player.velocity.addScaledVector(player.velocity,damping)
    //距离=速度*时间
    const deltaPosition=player.velocity.clone().multiplyScalar(deltaTime)
    player.geometry.translate(deltaPosition)//移动胶囊
    playerCollisions()
    camera.position.copy(player.geometry.end)
}



// 渲染函数
function render() {
    const deltaTime=Math.min(0.05,clock.getDelta())
    renderer.render(scene, camera)
    // controls.update()
    handleControls(deltaTime)//更新控制（速度、方向）
    updatePlayer(deltaTime)//更新player
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x88ccee)
    scene.fog = new THREE.Fog(0xf5f5f5, 50, 300)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(20, 20, 20)
    camera.rotation.order = 'YXZ'
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
