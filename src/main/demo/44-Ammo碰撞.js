//引入threejs
import * as THREE from 'three'
import Ammo from 'ammo.js'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry'
let scene, camera, controls, renderer = null
let light
const clock = new THREE.Clock()
let physicsWorld //物理世界
let dispatcher
let rigidBodies = []// mesh，质量(mass)>0
let margin = 0.05
let friction = 0.5 // 摩擦系数
const transform = new Ammo.btTransform//用于渲染时更新
let mouse = new THREE.Vector2()//鼠标二维向量
const raycaster = new THREE.Raycaster()//射线
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initPhysics()//初始化物理世界
initMeshes()//创建物体
initClick()//点击鼠标生成小球
render()

/*



*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(10, 20, 10)
    light.castShadow = true
    scene.add(light)
}
// 初始化物体
function initMeshes() {
    // 地板
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(
            50, 50, 0.01
        ),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    )
    floor.receiveShadow = true
    floor.rotateX(-Math.PI / 2)
    scene.add(floor)
    //网格线绘制
    var grid = new THREE.GridHelper(50, 50, 0xfffff);
    grid.material.opacity = 0.8;
    grid.material.transparent = true;
    scene.add(grid);
    buildFromMesh(floor, 0, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), false)

    // 塔1
    const tower1 = new THREE.Mesh(
        new THREE.BoxGeometry(4, 8, 4),
        new THREE.MeshPhongMaterial({ color: 0xB03014 })
    )
    tower1.name = '塔1'
    tower1.position.set(8, 2, 0)
    tower1.receiveShadow = true
    tower1.castShadow = true
    scene.add(tower1)
    buildFromMesh(tower1, 100, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true)
    const tower2 = new THREE.Mesh(
        new THREE.BoxGeometry(4, 8, 4),
        new THREE.MeshPhongMaterial({ color: 0xB03014 })
    )
    tower2.name = '塔2'
    tower2.position.set(-8, 2, 0)
    tower2.receiveShadow = true
    tower2.castShadow = true
    scene.add(tower2)
    buildFromMesh(tower2, 100, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true)

    //桥
    const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(14, 1, 3),
        new THREE.MeshPhongMaterial({ color: 0xb0f32 })
    )
    bridge.receiveShadow = true
    bridge.castShadow = true
    bridge.position.set(0, 10, 0)
    bridge.name = '桥'
    buildFromMesh(bridge, 50, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true)
    scene.add(bridge)

    //石板    
    for (let i = 0; i < 8; i++) {
        const stone = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 0.3),
            new THREE.MeshPhongMaterial({ color: 0xb0b0b0 })
        )
        stone.position.set(0, 1, 15 * (0.5 - i / 9))
        stone.receiveShadow = true
        stone.castShadow = true
        stone.name = '石板' + (i + 1)
        buildFromMesh(stone, 10, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true)
        scene.add(stone)
    }

    // 小山
    const hillPoints = []
    hillPoints.push(new THREE.Vector3(4, -5, 4))
    hillPoints.push(new THREE.Vector3(-4, -5, 4))
    hillPoints.push(new THREE.Vector3(4, -5, -4))
    hillPoints.push(new THREE.Vector3(-4, -5, -4))
    hillPoints.push(new THREE.Vector3(0, 5, 0))
    const hill = new THREE.Mesh(
        new ConvexGeometry(hillPoints),
        new THREE.MeshPhongMaterial({ color: 0xB03814 })
    )
    hill.position.set(0, 2.5, -8)
    hill.name = '小山'
    buildFromMesh(hill, 200, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true)
    scene.add(hill)


}


//给物体添加物理特性
//几何物体 质量 线速度 加速度 是否能被击破
function buildFromMesh(mesh, mass, vel, angVel, isBreakable) {
    let boxShape = null

    if (mesh.geometry instanceof THREE.BoxGeometry || mesh.geometry instanceof ConvexGeometry) {
        //计算当前几何体的的边界矩形
        mesh.geometry.computeBoundingBox()

        // 获取物体尺寸
        const sx = mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x
        const sy = mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y
        const sz = mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z

        boxShape = new Ammo.btBoxShape(new Ammo.btVector3(sx / 2, sy / 2, sz / 2))
    } else if (mesh.geometry instanceof THREE.SphereGeometry) {
        mesh.geometry.computeBoundingSphere()
        boxShape = new Ammo.btSphereShape(mesh.geometry.boundingSphere.radius)
    }



    //创建刚体
    const rigidBody = createRigidBody(
        boxShape, mesh.position, mesh.quaternion, mass
    )
    rigidBody.setFriction(friction)//摩擦力
    rigidBody.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z))//线速度
    rigidBody.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z))//加速度
    //关联函数
    buildRelation(mesh, rigidBody, mass)
}

function createConvexHullPyhsicsShape(coords) {
    const btShape = new Ammo.btConvexHullShape()
    const temVec3 = new Ammo.btVector3(0, 0, 0)
    for (let i = 0, i1 = coords.length; i < i1; i += 3) {
        temVec3.setValue(coords[i], coords[i + 1], coords[i + 2])
        const lastOne = (i >= (i1 - 3))
        btShape.addPoint(temVec3, lastOne)
        btShape.addPoint(temVec3, lastOne)
    }
    return btShape
}

//刚体相关
function createRigidBody(btShape, position, quaternion, mass) {
    const btLocalInertia = new Ammo.btVector3(0, 0, 0)
    btShape.setMargin(margin)
    btShape.calculateLocalInertia(mass, btLocalInertia)

    //位置和方向组合而成，用来表示刚体的变换，如平移、旋转等。
    let transform = new Ammo.btTransform()
    //将当前变换对象设置为初始状态，即将旋转变换矩阵归一化，平移向量3个维度的分量归零
    transform.setIdentity()
    //设置平移变换的向量，origin为平移变换的3x3矩阵
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))
    //设置当前变换对象的旋转变换数据，rotation表示存储旋转数据的四元数对象
    transform.setRotation(new Ammo.btQuaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w
    ))
    let defaultMotionState = new Ammo.btDefaultMotionState(transform)
    //创建刚体
    let rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        defaultMotionState,
        btShape,
        btLocalInertia
    )
    let rigidBody = new Ammo.btRigidBody(rigidBodyInfo)
    return rigidBody
}

function buildRelation(mesh, rigidBody, mass) {
    mesh.userData.physicsBody = rigidBody
    const btVecUserData = new Ammo.btVector3(0, 0, 0)
    btVecUserData.threeObject = mesh
    // rigidBody.setUserPointer(btVecUserData) 报错未解决

    if (mass > 0) {
        rigidBodies.push(mesh)
        rigidBody.setActivationState(4)
    }
    physicsWorld.addRigidBody(rigidBody)
}

//物理世界初始化
function initPhysics() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
    const broadphase = new Ammo.btDbvtBroadphase()
    const solver = new Ammo.btSequentialImpulseConstraintSolver()

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        broadphase,
        solver,
        collisionConfiguration
    )
    //设置重力向量
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0))
}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.shadowMap.enabled = true
    renderer.setClearColor(0xbfd1e5)
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.autoClear = false//定义renderer是否清除颜色缓存
    renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
//点击事件
function initClick() {
    window.addEventListener('pointerdown', e => {
        //获取归一化的鼠标坐标
        mouse.set(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        )
        //通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(mouse, camera)

        //生成小球
        //线速度
        const vel = new THREE.Vector3().copy(
            raycaster.ray.direction//速度方向
        ).multiplyScalar(24)
        const ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 14, 10),
            new THREE.MeshPhongMaterial({ color: 0x000000 })
        )
        ball.name = '小球'
        ball.position.copy(raycaster.ray.origin)//射线起点
        ball.receiveShadow = true
        ball.castShadow = true
        scene.add(ball)
        //物理特性设置
        buildFromMesh(ball, 20, vel, new THREE.Vector3(0, 0, 0), false)

    })
}
// 渲染函数
function render() {

    updatePhysics()//更新物理世界函数
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}
function updatePhysics() {
    const delta = clock.getDelta()
    //进行世界物理模拟，delta为时间步进
    physicsWorld.stepSimulation(delta, 10)
    // 更新mesh的位置和状态
    for (let i = 0; i < rigidBodies.length; i++) {
        const mesh = rigidBodies[i]
        const physics = mesh.userData.physicsBody
        const motationState = physics.getMotionState()//获取刚体的形状，返回值为获取的形状指针
        if (motationState) {
            motationState.getWorldTransform(transform)
            const position = transform.getOrigin()//换取变换的原点
            const quaternion = transform.getRotation()//换取表示旋转信息的四元数
            //根据物理改变几何属性
            mesh.position.set(position.x(), position.y(), position.z())
            mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w())
        }
    }
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 20, 20)
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


