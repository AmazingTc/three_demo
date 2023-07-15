//引入threejs
import * as THREE from 'three'
import Ammo from 'ammo.js'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, renderer = null
let light
const clock = new THREE.Clock()
//四元数 四元数在three.js中用于表示 rotation （旋转）。
const ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1)
const DISABLE_DEACTIVAAION = 4
const materialDynamic = new THREE.MeshPhongMaterial({
    color: 0xfca400
})
const materialStatic = new THREE.MeshPhongMaterial({
    color: 0x999999
})
const materialInteractive = new THREE.MeshPhongMaterial({
    color: 0x990000
})
let physicsWorld //物理世界
let tmpTransformation = new Ammo.btTransform() //用于motation
let syncList = []
let actions = {} //{'acceleration':true}

const keyActions = {
    "KeyW": 'acceleration',
    "KeyS": 'breaking',
    "KeyA": 'left',
    "KeyD": 'right',
}
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initPhysics()
initMeshes()
render()

/*



*/



//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0x404040))//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(10, 10, 10)
    scene.add(light)
}
// 初始化物体
function initMeshes() {
    //地板
    createCube(new THREE.Vector3(0, -0.5, 0), ZERO_QUATERNION, 500, 1, 500, 0, 2)

    //斜坡
    const quaternion = new THREE.Quaternion(0, 0, 0, 1)
    //从由 axis（轴） 和 angle（角度）所给定的旋转来设置该四元数
    quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 18)
    createCube(new THREE.Vector3(0, -1.5, 0), quaternion, 8, 4, 10, 0, 1)

    //墙
    const size = 0.75
    const nw = 6
    const nh = 6
    for (let i = 0; i < nw; i++) {
        for (let j = 0; j < nh; j++) {
            createCube(
                new THREE.Vector3(size * i - (size * (nw - 1)) / 2, size * j, 10),
                ZERO_QUATERNION,
                size, size, size, 1
            )
        }
    }

    //车
    createCar(new THREE.Vector3(0,4,-20),ZERO_QUATERNION)

}
function createCube(position, quat, w, l, h, mass = 0, friction = 1) {

    //图形
    const material = mass > 0 ? materialDynamic : materialStatic
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, l, h, 1, 1, 1),
        material
    )
    mesh.position.copy(position)
    mesh.quaternion.copy(quat)//表示对象局部旋转的Quaternion（四元数）
    scene.add(mesh)

    //物理
    //初始姿态
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
    const motionState = new Ammo.btDefaultMotionState(transform)

    //碰撞几何结构
    const boxShape = new Ammo.btBoxShape(
        new Ammo.btVector3(w / 2, l / 2, h / 2)
    )
    const localInertia = new Ammo.btVector3(0, 0, 0)
    boxShape.calculateLocalInertia(mass, localInertia)

    //刚体
    const rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(
        mass, motionState, boxShape, localInertia
    )
    const rigidBody = new Ammo.btRigidBody(rigidBodyInfo) //相对几何世界的mesh
    rigidBody.setFriction(friction)
    physicsWorld.addRigidBody(rigidBody)//添加到物理世界

    // 如果具有重力    
    if (mass > 0) {
        rigidBody.setActivationState(DISABLE_DEACTIVAAION)
        function sync(dt) {
            const ms = rigidBody.getMotionState()
            if (ms) {
                ms.getWorldTransform(tmpTransformation)
                const p = tmpTransformation.getOrigin()
                const q = tmpTransformation.getRotation()
                mesh.position.set(p.x(), p.y(), p.z())
                mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
            }
        }
        syncList.push(sync)
    }

}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)
}
function createCar(position, quat) {
    //车架宽 高 长 质量
    const carWidth = 1.8, carHeight = 0.6, carLength = 4, carMass = 800

    //车轮
    const wheelAxisPositionBack = -1//后轮相对中间的位置
    const wheelRadiusBack = 0.4//后轮半径
    const wheelWidthBack = 0.3//后轮宽
    const wheelHalfTrackBack = 1 //后轮间距
    const wheelAxisHeightBack = 0.3 //后轮轴的高度

    const wheelAxisPositionFront = 1.7
    const wheelRadiusFront = 1
    const wheelWidthFront = 0.3
    const wheelHalfTrackFront = 0.35
    const wheelAxisHeightFront = 0.2

    //摩擦力及悬架
    const friction = 1000
    const suspensionStiffness = 20.0 //悬挂刚度
    const suspensionDamping = 2.3 //悬挂阻尼
    const suspensionCompression = 4.4//悬挂压缩
    const suspensionRestLength = 0.6
    const rollInfluence = 0.2

    // 转向
    const steeringIncrement = 0.04
    const steeringClamp = 0.5 //转向锁止
    const maxEngineForce = 2000 //最大推力
    const maxBreakingForce = 100 //最大刹车

    //物理
    //初始姿态
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(
        new Ammo.btVector3(position.x, position.y, position.z)
    )
    transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    )
    const motionState = new Ammo.btDefaultMotionState(transform)

    //碰撞几何结构
    const boxShape = new Ammo.btBoxShape(
        new Ammo.btVector3(carWidth / 2, carHeight / 2, carLength / 2)
    )
    const localInertia = new Ammo.btVector3(0, 0, 0)
    boxShape.calculateLocalInertia(carMass, localInertia)

    //刚体
    const carBody = new Ammo.btRigidBody(
        new Ammo.btRigidBodyConstructionInfo(carMass, motionState, boxShape, localInertia)
    )
    carBody.setActivationState(DISABLE_DEACTIVAAION)
    physicsWorld.addRigidBody(carBody)

    const vehicleMesh = createVehicleMesh(carWidth, carHeight, carLength)


    let engineForce = 0 //引擎力
    let vehicleSteering = 0  //转向角
    let breakForce = 0//刹车力

    let tuning = new Ammo.btVehicleTuning()
    let rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
    let vehicle = new Ammo.btRaycastVehicle(tuning, carBody, rayCaster)
    vehicle.setCoordinateSystem(0, 1, 2)
    physicsWorld.addAction(vehicle)

    //wheels
    let wheelMeshes = []
    let wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
    let wheelAxleCS = new Ammo.btVector3(-1, 0, 0)
    function addWheel(isFront, pos, radius, width, index) {
        let wheelInfo = vehicle.addWheel(
            pos,
            wheelDirectionCS0,
            wheelAxleCS,
            suspensionRestLength,
            radius,
            tuning,
            isFront
        )
        wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
        wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
        wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)
        wheelInfo.set_m_frictionSlip(friction)
        wheelInfo.set_m_rollInfluence(rollInfluence)

        wheelMeshes[index] = createWheelMesh(radius, width)
    }
    addWheel(
        true,
        new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisPositionFront),
        wheelRadiusFront, wheelWidthFront, 0
    )
    addWheel(
        true,
        new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisPositionFront),
        wheelRadiusFront, wheelWidthFront, 1
    )
    addWheel(
        false,
        new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
        wheelRadiusBack, wheelWidthBack, 2
    )
    addWheel(
        false,
        new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
        wheelRadiusBack, wheelWidthBack, 3
    )

    function sync(dt) {
        const speed = vehicle.getRigidBody().getLinearVelocity().length() * 9.8
        breakForce = 0
        engineForce = 0
        if (actions.acceleration) { //w 刹车或者前进
            if (speed < -1) {
                breakForce = maxBreakingForce
            } else {
                engineForce = maxEngineForce
            }
        }
        if (actions.breaking) { //s 刹车或倒车
            if (speed > 1) {
                breakForce = maxBreakingForce
            } else {
                engineForce = -maxEngineForce / 2
            }
        }
        if (actions.left) { //a 左转
            if (vehicleSteering < steeringClamp) {
                vehicleSteering += steeringIncrement
            }
        } else {
            if (actions.right) { //d 右转
                if (vehicleSteering > -steeringClamp) {
                    vehicleSteering -= steeringIncrement
                }
            } else { //自动回轮
                if (vehicleSteering < -steeringIncrement) {
                    vehicleSteering += steeringIncrement
                } else {
                    if (vehicleSteering > steeringIncrement) {
                        vehicleSteering -= steeringIncrement
                    } else {
                        vehicleSteering = 0
                    }
                }
            }
        }

        //后驱
        vehicle.applyEngineForce(engineForce, 2)
        vehicle.applyEngineForce(engineForce, 3)

        //前刹车
        vehicle.setBrake(breakForce / 2, 0)
        vehicle.setBrake(breakForce / 2, 1)
        //后刹车
        vehicle.setBrake(breakForce, 2)
        vehicle.setBrake(breakForce, 3)
        //转向角
        vehicle.setSteeringValue(vehicleSteering, 0)
        vehicle.setSteeringValue(vehicleSteering, 1)

        //同步几何数据
        //轮子
        let tm, p, q
        let n = vehicle.getNumWheels()
        for (let i = 0; i < n; i++) {
            vehicle.updateWheelTransform(i,true)
            tm=vehicle.getWheelTransformWS(i)
            p=tm.getOrigin()
            q=tm.getRotation()
            wheelMeshes[i].position.set(p.x(),p.y(),p.z())
            wheelMeshes[i].quaternion.set(q.x(),q.y(),q.z(),q.w())
        }
        //车体
        tm=vehicle.getChassisWorldTransform()
        p=tm.getOrigin()
        q=tm.getRotation()
        wheelMeshes.position.set(p.x(),p.y(),p.z())
        wheelMeshes.quaternion.set(q.x(),q.y(),q.z(),q.w())
    }
    syncList.push(sync)
}
//车架mesh
function createVehicleMesh(w, l, h) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, l, h, 1, 1, 1),
        materialInteractive
    )
    scene.add(mesh)
    return mesh
}
// 轮子mesh
function createWheelMesh(radium, width) {
    const cylinderG = new THREE.CylinderGeometry(radium, radium)
    cylinderG.rotateZ(Math.PI / 2)
    const mesh = new THREE.Mesh(cylinderG, materialInteractive)
    mesh.add(new THREE.Mesh(
        new THREE.BoxGeometry(width * 1.5, radium * 1.75, radium * 0.25, 10, 10, 10)
    ))
    scene.add(mesh)
    return mesh
}
//物理世界初始化
function initPhysics() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
    const broadphase = new Ammo.btDbvtBroadphase()
    const solver = new Ammo.btSequentialImpulseConstraintSolver()
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        broadphase,
        solver,
        collisionConfiguration
    )
    // 重力
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.82, 0))
}

function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
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

// 渲染函数
function render() {
    const delta = clock.getDelta()
    for (let i = 0; i < syncList.length; i++) {
        syncList[i](delta)
    }
    physicsWorld.stepSimulation(delta, 10)//物理世界变更
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000)
    camera.position.set(-40, 20, -25)
    camera.lookAt(0.33, -0.4, 0.85)
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
window.addEventListener('keyup', e => {
    if (keyActions[e.code]) {
        actions[keyActions[e.code]] = false
        e.preventDefault()
        e.stopPropagation()
        return false
    }
})
window.addEventListener('keydown', e => {
    if (keyActions[e.code]) {
        actions[keyActions[e.code]] = true
        e.preventDefault()
        e.stopPropagation()
        return false
    }
})

