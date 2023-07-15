//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, camera, controls, light, renderer
let mesh

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
    const size=20
    const segments=10 //片段数   
    const segmentSize=size/segments //每个片段大小

    const positions=[] //位置
    const normals=[]//法向量
    const colors=[]
    for(let i=0;i<=segments;i++){
        const y=i*segmentSize-size/2 //-10~10
        for(let j=0;j<=segments;j++){
            const x=j*segmentSize-size/2 //-10~10
            positions.push(x,y,0)//平面 z为0
            normals.push(0,0,1)
            colors.push(
                x/size+0.5,
                y/size+0.5,
                1,
            )
        }
    }
    
    const indeces=[]
    for(let i=0;i<segments;i++){
        for(let j=0;j<segments;j++){
            const p0=i*(segments+1)+j
            const p1=i*(segments+1)+j+1
            const p2=(i+1)*(segments+1)+j
            const p3=(i+1)*(segments+1)+j+1
            indeces.push(p0,p1,p2)
            indeces.push(p2,p3,p1)
        }
    }

    const geometry=new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3))
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3))
    geometry.setIndex(indeces)
    const material=new THREE.MeshPhongMaterial({
        // color:0xff0000,
        side:THREE.DoubleSide,
        wireframe:true,
        vertexColors:true,
    })

    mesh=new THREE.Mesh(geometry,material)
    scene.add(mesh)

   

}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    //坐标轴辅助
    // scene.add(new THREE.AxesHelper(10))
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
function render(time) {
    renderer.render(scene, camera)
    controls.update()
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    // scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 3500)
    camera.position.z = 64
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

