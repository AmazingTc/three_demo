//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, light, renderer
const colck = new THREE.Clock()
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
    const geometry=new THREE.BufferGeometry()
    const material=new THREE.MeshPhongMaterial({
        // color:0xff0000,
        side:THREE.DoubleSide,
        vertexColors:true,//使用顶点着色
        specular:0xffffff,//高亮颜色
        shininess:250,
        transparent:true
    })
    const triangles=4000 //三角形个数
    const range=800 //范围
    const size=20 //大小
    const positions=[]//点位置
    const normals=[]//法线
    const colors=[]//颜色

    //三个顶点临时变量
    const positionA=new THREE.Vector3()
    const positionB=new THREE.Vector3()
    const positionC=new THREE.Vector3()

    const color=new THREE.Color()

    // 求法线
    const ab=new THREE.Vector3()
    const cb=new THREE.Vector3()


    for(let i=0;i<triangles;i++){

        //三角形位置
        const x=(Math.random()-0.5)*range  //-400~400
        const y=(Math.random()-0.5)*range  //-400~400
        const z=(Math.random()-0.5)*range  //-400~400


        //三角形三个顶点位置在大小范围内随机
        const ax=x+(Math.random()-0.5)*size  //-400~400
        const ay=y+(Math.random()-0.5)*size  //-400~400
        const az=z+(Math.random()-0.5)*size  //-400~400
        positionA.set(ax,ay,az)
        const bx=x+(Math.random()-0.5)*size  //-400~400
        const by=y+(Math.random()-0.5)*size  //-400~400
        const bz=z+(Math.random()-0.5)*size  //-400~400
        positionB.set(bx,by,bz)

        const cx=x+(Math.random()-0.5)*size  //-400~400
        const cy=y+(Math.random()-0.5)*size  //-400~400
        const cz=z+(Math.random()-0.5)*size  //-400~400
        positionC.set(cx,cy,cz)

        //三角形三个点的位置
        positions.push(ax,ay,az)
        positions.push(bx,by,bz)
        positions.push(cx,cy,cz)


        // 法线
        ab.subVectors(positionA,positionB) //向量减法
        cb.subVectors(positionC,positionB)

        cb.cross(ab) // 叉积 求出与两个向量垂直的向量 即法向量
        cb.normalize()

        normals.push(cb.x,cb.y,cb.z)
        normals.push(cb.x,cb.y,cb.z)
        normals.push(cb.x,cb.y,cb.z)

        // 颜色
        color.setHSL(
           Math.random(),
            0.8,
            Math.random(),
        )
        const alpha=Math.random()
        colors.push(color.r,color.g,color.b,alpha)
        colors.push(color.r,color.g,color.b,alpha)
        colors.push(color.r,color.g,color.b,alpha)

    }
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4))
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3))//此时 material中的color生效
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
    mesh=new THREE.Mesh(geometry,material)
    scene.add(mesh)
}


// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
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
function render(time) {
    renderer.render(scene, camera)
    mesh.rotation.y=time*0.001
    controls.update()
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    // scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3500)
    camera.position.z=1500
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

