//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


let scene, camera, controls,light,renderer
let terrainMesh
let heightData //高度信息

const  terrainWidth=200
const terrainDepth=200
const widthSegments=128,depthSegments=128
const terrainMaxHeight=8
const terrainMinHeight=-2



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
    // scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(100, 100, 50)
    light.castShadow=true
    const dLight=200
    const sLight=dLight*0.25
    light.shadow.camera.left=-sLight
    light.shadow.camera.right=sLight
    light.shadow.camera.top=sLight
    light.shadow.camera.bottom=-sLight
    light.shadow.camera.near=-dLight/30
    light.shadow.camera.far=-dLight
    light.shadow.mapSize.set(2048,2048)

    scene.add(light)
    const helper = new THREE.DirectionalLightHelper( light, 20 );
scene.add( helper );
    

}
// 初始化物体
function initMeshes() {

    //创建顶点的左边
    const size=widthSegments*depthSegments//总点数
    heightData=new Float32Array(size)
    const hRange=terrainMaxHeight-terrainMinHeight//高度区间
    const w2=widthSegments/2
    const d2=depthSegments/2

    const phseMult=5//越大地形起伏越多
    let p=0
    for(let i=0;i<depthSegments;i++){
        for(let j=0;j<widthSegments;j++){
            const radius=Math.sqrt(Math.pow((j-w2)/w2,2)+Math.pow((i-d2)/d2,2))
            const height=(Math.sin(radius*phseMult)+1)*0.5*hRange+terrainMinHeight
            heightData[p]=height
            p++
        }
    }



    //terrain地形
    const geometry=new THREE.PlaneGeometry(terrainWidth,terrainDepth,widthSegments-1,depthSegments-1)
    geometry.rotateX(-Math.PI/2)

    //通过更改顶点的坐标实现地形的起伏
    const vertices=geometry.attributes.position.array //顶点信息
    for(let i=0,j=0,l=vertices.length;i<l;i++,j+=3){
        vertices[j+1]=heightData[i]
    }
    geometry.computeVertexNormals()//计算法线
    const material=new THREE.MeshPhongMaterial({
        color:0xC7C7C7
    })
    terrainMesh=new THREE.Mesh(geometry,material)
    terrainMesh.castShadow=true
    terrainMesh.receiveShadow=true
    scene.add(terrainMesh)


    //添加纹理
    new THREE.TextureLoader().load('./textures/crate.gif',texture=>{
        texture.wrapS=texture.wrapT=THREE.RepeatWrapping
        texture.repeat.set(widthSegments-1,depthSegments-1)
        material.map=texture
        material.side=THREE.DoubleSide
        material.needsUpdate=true
    })

}


// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性

    //坐标轴辅助
    scene.add(new THREE.AxesHelper(50))
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled=true
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    renderer.render(scene, camera)
    controls.update()
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xdddddd)
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 1000)
    camera.position.set(0, 60, 200)
    camera.lookAt(scene.position)
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


