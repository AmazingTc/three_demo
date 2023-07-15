//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Ammo from 'ammo.js'
let scene, camera, controls, renderer = null
let light
let clock = new THREE.Clock()
let physicsUniverse
let temTransformation
let meshList=[]
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initPhysicsUniverse()//初始化物理世界
initMeshes()
render()



/*
  1.引入ammo.wasm.js
  2.初始化物理世界
  3.创建图形，关联物理与图形
  4.渲染时更新物理世界



  基本概念：
  1.图形世界：Geometry,material,shders,2drender
  2.物理世界:Gravity(重力),Dynamics(力学),Friction(摩擦力)，Rigid Body(刚体)
  3.Mesh与Rigid Body关联
  Mesh:(geometry,material)   Rigid Body:(Rigid body,btBoxShape) 
  

  物理引擎模型：
  Canon.js
  Physijs
  Box2Djs
  Planck.js
  Ammo.js
  */



//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xdddddd, 0.3))//环境光
    light = new THREE.DirectionalLight(0xddffdd, 0.6)
    light.position.set(10, 10, 10)
    scene.add(light)
}
// 初始化物体
function initMeshes() {
    //底座，质量为0
    createCube(40,new THREE.Vector3(10,-30,10),0,null)
    createCube(8,new THREE.Vector3(0,10,0),10,null)
    createCube(8,new THREE.Vector3(0,20,0),10,null)
    createCube(4,new THREE.Vector3(5,10,0),5,null)
    createCube(2,new THREE.Vector3(3,8,5),1,null)
}
//创建物体
function createCube(size,position,mass,rot_quaternion){
    let quaternion
    if(rot_quaternion==null){
        quaternion={x:0,y:0,z:0,w:1}
    }else{
        quaternion=rot_quaternion
    }

    //graphics
    let cube=new THREE.Mesh(
        new THREE.BoxGeometry(size,size,size),
        new THREE.MeshPhongMaterial({
            color:Math.random()*0xffffff
        })
    )
    cube.position.set(position.x,position.y,position.z)
    scene.add(cube)
    meshList.push(cube)

    //physics
    //物理世界的初始姿态
    let transform=new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(position.x,position.y,position.z))
    transform.setRotation(new Ammo.btQuaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w
    ))
    let defaultMotionState=new Ammo.btDefaultMotionState(transform)

    //设置碰撞几何结构
    let boxShape=new Ammo.btBoxShape(new Ammo.btVector3(size/2,size/2,size/2))
    boxShape.setMargin(0.5)
    let localInertia=new Ammo.btVector3(0,0,0)
    boxShape.calculateLocalInertia(mass,localInertia)

    //rigid body
    let rigidBodyInfo=new Ammo.btRigidBodyConstructionInfo(
        mass,
        defaultMotionState,
        boxShape,
        localInertia
    )
    //刚性物体
    let rigidBody=new Ammo.btRigidBody(rigidBodyInfo)
    //添加到物理世界
    physicsUniverse.addRigidBody(rigidBody)
    cube.userData.physicsBody=rigidBody//关联
}
//物理初始化
function initPhysicsUniverse(){
    const collisionConfiguration=new Ammo.btDefaultCollisionConfiguration()
    const dispatcher=new Ammo.btCollisionDispatcher(collisionConfiguration)
    const overlappingPairCache=new Ammo.btDbvtBroadphase()
    const solver=new Ammo.btSequentialImpulseConstraintSolver()
    physicsUniverse=new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        overlappingPairCache,
        solver,
        collisionConfiguration
    )
    physicsUniverse.setGravity(new Ammo.btVector3(0,-75,0))
    temTransformation=new Ammo.btTransform()
}   
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    const axesHelper = new THREE.AxesHelper(20);
    scene.add(axesHelper)
}


function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.autoClear = true//定义renderer是否清除颜色缓存
    renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}

// 渲染函数
function render() {
    const delta=clock.getDelta()
    //更新物理世界
    updatePhysicsUniverse(delta)
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}
function updatePhysicsUniverse(delta){
    //物理世界
    physicsUniverse.stepSimulation(delta,10)
    //图形世界
    for(let i=0;i<meshList.length;i++){
        let mesh=meshList[i]
        let physicsBody=mesh.userData.physicsBody
        let motionState=physicsBody.getMotionState()
        if(motionState){
            motionState.getWorldTransform(temTransformation)
            let newPositon=temTransformation.getOrigin()
            let newQua=temTransformation.getRotation()
            mesh.position.set(newPositon.x(),newPositon.y(),newPositon.z())
            mesh.quaternion.set(
                newQua.x(),
                newQua.y(),
                newQua.z(),
                newQua.w()
            )
        }
    }
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(25, 0, 25)
    camera.lookAt(0, 6, 0)
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


