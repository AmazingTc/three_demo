//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, renderer = null
// 导入UI界面控制库
import * as dat from 'dat.gui'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
import { Float32BufferAttribute, Vector2 } from 'three'
let gui
let light
let particles //点集合
const PARTICLE = 20 //点大小
//鼠标交互
let pointer=new THREE.Vector2()
let INTERSECTED
let raycaster=new THREE.Raycaster()
let  intersets
/*
     
*/
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initMeshes()//初始化图像
render()


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight({ intensity: 1 }))//环境光
    light = new THREE.DirectionalLight(0xffffff)//点光源（灯泡）
    light.position.set(10, 10, 10)
    scene.add(light)
}
// 初始化图形
function initMeshes() {
    /*
      position: count 24(4*6) 8个不重叠的点
    */
    const boxGeometry = new THREE.BoxGeometry(200, 200, 200, 10, 10, 10)
    boxGeometry.deleteAttribute('normal')
    boxGeometry.deleteAttribute('uv')
    const mergeBoxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry)//得到不重叠的点 position中count=8
    const position = mergeBoxGeometry.getAttribute('position')//八个点的位置信息
    const colors = []
    const sizes = []
    const color = new THREE.Color()
    for (let i = 0; i < position.count; i++) {
        color.setHSL(0.01 + 0.1 * (i / position.count), 1.0, 0.5)//颜色 饱和度 亮度 {}
        color.toArray(colors, i*3)//扁平化

        sizes[i] = PARTICLE *0.5
    }

    const bufferGeometry = new THREE.BufferGeometry()
    //设置位置大小和颜色
    bufferGeometry.setAttribute('position', position)
    bufferGeometry.setAttribute(
        'customColor', new Float32BufferAttribute(colors, 3),
    )
    bufferGeometry.setAttribute(
        'size', new Float32BufferAttribute(sizes, 1),
    )
    console.log(bufferGeometry);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            pointTexture:{value: new THREE.TextureLoader().load('./textures/checkerboard-8x8.png')}
        },
        //顶点
        vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;//上方代码循环得出的color
        void main(){
            vColor=customColor;
            vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
            gl_PointSize = size*(300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
        `,
        //颜色
        fragmentShader: `
        uniform vec3 color; //uniforms中的白色
        uniform sampler2D pointTexture;
        varying vec3 vColor; //从vertexshadar传递到fragmentshader的vColor变量
        void main(){
            gl_FragColor=vec4(color*vColor,1.0);
            gl_FragColor= gl_FragColor* texture2D(pointTexture,gl_PointCoord);
        }
        `
    })
    particles = new THREE.Points(bufferGeometry, material)
    scene.add(particles)


}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)
    gui = new dat.GUI()
}

function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    controls.update()
    particles.rotation.x+=0.001
    particles.rotation.y+=0.001

    const attributes=particles.geometry.attributes
    // 鼠标与相机射线
    raycaster.setFromCamera(pointer,camera)
    intersets=raycaster.intersectObject(particles)
    if(intersets.length>0){
        if(INTERSECTED!=intersets[0].index){
            attributes.size.array[INTERSECTED]=PARTICLE
            INTERSECTED=intersets[0].index
            attributes.size.array[INTERSECTED]=PARTICLE * 1.5
            attributes.size.needsUpdate=true
        }
    }else if(INTERSECTED!==null){
        attributes.size.array[INTERSECTED]=PARTICLE*0.5
        attributes.size.needsUpdate=true
        INTERSECTED=null
    }
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    //正交相机
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = 250
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
window.addEventListener('pointermove',(e)=>{
    pointer.x=(e.clientX /window.innerWidth)*2-1  //-1~1
    pointer.y=-(e.clientY /window.innerHeight)*2+1  //-1~1
})

