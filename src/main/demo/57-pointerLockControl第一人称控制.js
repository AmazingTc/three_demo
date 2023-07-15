//引入threejs
import * as THREE from 'three'
import { Box2 } from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//指针锁定控制器
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls'
let scene, camera, controls, light, renderer
const colck = new THREE.Clock()
let color = new THREE.Color()

let vertex = new THREE.Vector3()

//controls
let moveForward=false
let moveBackward=false
let moveLeft=false
let moveRight=false
let canJump=false
let velocity=new THREE.Vector3()//速度
let direction=new THREE.Vector3()//方向

let boxes=[]
let preTime=performance.now()

let raycaster=new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0,-1,0), //方向垂直向下
    0,10
)


initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()
initMeshes()
render()

/*

*/


//初始化灯光
function initLights() {
    const light1 = new THREE.AmbientLight()
    scene.add(light1)//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(50, 50, 50)
    light.castShadow = true
    light.shadow.camera.near = 0.01
    light.shadow.camera.far = 500
    light.shadow.camera.right = 30
    light.shadow.camera.left = -30
    light.shadow.camera.top = 30
    light.shadow.camera.bottom = -30
    light.shadow.mapSize.set(1024, 1024)
    light.shadow.radius = 4
    light.shadow.bias = -0.00006
    scene.add(light)
}
// 初始化物体
function initMeshes() {

    //地板
    let floorG = new THREE.PlaneGeometry(2000, 2000, 99, 99)
    floorG.rotateX(-Math.PI / 2)
    let position = floorG.getAttribute('position')
    for (let i = 0, l = position.count; i < l; i++) {
        //顶点位置扰动
        vertex.fromBufferAttribute(position, i) //取出每个点的位置
        vertex.x += Math.random() * 20 - 10
        vertex.y += Math.random() * 2
        vertex.z += Math.random() * 20 - 10
        position.setXYZ(i, vertex.x, vertex.y, vertex.z) //重新设置position
    }
    //共享点分离
    floorG = floorG.toNonIndexed()//返回已索引的 BufferGeometry 的非索引版本 分离
    position = floorG.getAttribute('position')
    const colors = []
    //随机生成顶点颜色
    for (let i = 0, l = position.count; i < l; i++) {
        color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75)
        colors.push(color.r, color.g, color.b)
    }
    floorG.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    let floorM = new THREE.MeshBasicMaterial({
        vertexColors: true,//是否使用顶点着色
    })

    let floor = new THREE.Mesh(floorG, floorM)
    scene.add(floor)



    // 箱子
    let boxG = new THREE.BoxGeometry(20, 20, 20)
    boxG = boxG.toNonIndexed()//分离
    let boxP=boxG.getAttribute('position')
    const boxColors=[]
    for(let i=0,l=boxP.count;i<l;i++){
        color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75)
        boxColors.push(color.r, color.g, color.b)
    }
    boxG.setAttribute('color',new THREE.Float32BufferAttribute(boxColors,3))
    for (let i = 0; i < 500; i++) {
        const boxM = new THREE.MeshPhongMaterial({
            specular: 0xffffff,
            vertexColors:true,
            color:Math.random()*0xffffff
        })
        const box = new THREE.Mesh(boxG, boxM)
        box.position.set(
            Math.floor(Math.random() * 20 - 10) * 20,
            Math.floor(Math.random() * 20) * 20+10,
            Math.floor(Math.random() * 20 - 10) * 20,

        )
        boxes.push(box)
        scene.add(box)
    }

}


// 初始化工具
function initUtils() {
    // controls = new OrbitControls(camera, renderer.domElement)
    // controls.enableDamping = true//允许阻尼
    // controls.dampingFactor = 0.04//阻尼惯性
    //
    controls=new PointerLockControls(camera,renderer.domElement)
    window.addEventListener('mousedown',()=>{
        controls.lock()//激活指针锁定
    })
    window.addEventListener('keydown',(e)=>{
        switch(e.code){
            case'KeyW':moveForward=true;break;
            case'KeyS':moveBackward=true;break;
            case'KeyA':moveLeft=true;break;
            case'KeyD':moveRight=true;break;
            case'Space':
                if(canJump===true){
                    velocity.y+=350
                }
                canJump=false
            default:return 

        }
    })
    window.addEventListener('keyup',(e)=>{
        switch(e.code){
            case'KeyW':moveForward=false;break;
            case'KeyS':moveBackward=false;break;
            case'KeyA':moveLeft=false;break;
            case'KeyD':moveRight=false;break;
            default:return 
        }
    })
    //坐标轴辅助
    scene.add(new THREE.AxesHelper(5))
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)

    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    renderer.render(scene, camera)
    requestAnimationFrame(render)
    updateStatus() //更新状态信息
}
function updateStatus(){
    const time=performance.now()
    if(controls.isLocked){
        const delta=(time-preTime)/1000
        // x.z方向受到阻力后速度减小
        velocity.x-=velocity.x*10*delta
        velocity.z-=velocity.z*10*delta
        
        //右为正 左为负
        direction.x=Number(moveRight)-Number(moveLeft)
        //前为正 后为负
        direction.z=Number(moveForward)-Number(moveBackward)
        direction.normalize()
        //每个方向上做速度增量
        if(moveLeft||moveRight){
            velocity.x+=direction.x*400*delta
        }
        if(moveBackward||moveForward){
            velocity.z+=direction.z*400*delta
        }
        //移动
        controls.moveRight(velocity.x*delta) //速度*时间
        controls.moveForward(velocity.z*delta)


        //自由落体
        velocity.y-=9.8*100*delta //重力影响
        // 是否站在箱子上
        raycaster.ray.origin.copy(controls.getObject().position)
        raycaster.ray.origin.y-=10
        const intersections=raycaster.intersectObjects(boxes,false)
        const onBox=intersections.length>0?true:false
        if(onBox){
            velocity.y=Math.max(0,velocity.y)
            canJump=true
        }

        controls.getObject().position.y+=velocity.y*delta
        if( controls.getObject().position.y<10){
            velocity.y=0
            controls.getObject().position.y=10
            canJump=true
        }
    }
    preTime=time
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xdddddd)
    scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(100, 100, 100)
    //应用于旋转顺序。默认值为 'XYZ'，这意味着对象将首先是 绕X轴旋转，然后是Y轴，最后是Z轴。
    camera.rotation.order = 'YXZ'
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

