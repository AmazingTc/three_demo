//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//效果合成器
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
//渲染通道，用于渲染场景
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
//效果处理通道，用于将结果输出到场景
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
//使用该通道你可以传入一个自定义的着色器，用来生成高级的、自定义的后期处理通道
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
//FXAAShader着色器
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

//obj模型加载器
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { MeshLambertMaterial } from 'three'
let scene, camera, controls, renderer = null
let light
let composer, effectFxaa, outLinePass //效果合成器
let mouse = new THREE.Vector2()
let raycaster = new THREE.Raycaster()//光线投射,用于进行鼠标拾取
let rayTexture
let gui = new GUI()
let guiParams
/*
  
  
*/
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initMeshes()//初始化图像



//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xdddddd, 0.3))//环境光
    light = new THREE.DirectionalLight(0xddffdd, 0.6)
    light.position.set(10, 10, 10)
    light.castShadow = true
    //定义阴影贴图的宽度和高度
    light.shadow.mapSize.width = 4096
    light.shadow.mapSize.height = 4096
    const d = 40
    light.shadow.camera.left = -d
    light.shadow.camera.right = d
    light.shadow.camera.top = d
    light.shadow.camera.bottom = -d
    light.shadow.camera.far = 1000


    scene.add(light)
}
// 初始化图形
function initMeshes() {
    //加载模型
    new OBJLoader().load('./models/tree.obj', (obj) => {
        scene.add(obj)
        obj.traverse(child => {
            if (child.isMesh) {
                child.receiveShadow = true
                child.castShadow = true
                child.geometry.computeBoundingSphere()
            };
            obj.scale.multiplyScalar(3)
        })

        //球体
        const geometry = new THREE.SphereGeometry(3, 48, 24)
        for (let i = 0; i < 20; i++) {
            const material = new MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random(), 1.0, 0.3)
            })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(Math.random() * 4 - 2, Math.random() * 4, Math.random() * 4 - 2)
            mesh.scale.multiplyScalar(Math.random() * 0.3 + 0.1)
            mesh.receiveShadow = true
            mesh.castShadow = true
            scene.add(mesh)
        }

        //地板
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshLambertMaterial({
                side: THREE.DoubleSide
            })
        )
        floor.rotateX(-Math.PI / 2)
        floor.receiveShadow = true
        scene.add(floor)

        //圆环   
        const torus = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.3, 16, 100),
            new THREE.MeshPhongMaterial({ color: 0xffaaff })
        )
        torus.position.set(5, 0, 1)
        torus.castShadow = true
        scene.add(torus)



        composer = new EffectComposer(renderer)
        composer.addPass(new RenderPass(scene, camera))
        outLinePass = new OutlinePass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            scene,
            camera
        )
        composer.addPass(outLinePass)
        new THREE.TextureLoader().load('./textures/textures/matcaps/8.png',texture=>{
            outLinePass.patternTexture=texture
            texture.wrapS=texture.wrapT=THREE.RepeatWrapping
            addGui()
            render()
        })
       
    })




}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 5 //能够将相机向内移动多少
    controls.maxDistance = 20 //能够将相机向外移动多少
    controls.enablePan = false //禁用摄像机平移
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper)
}

function addGui(){
    guiParams={
        edgeStrenth:10,//边缘强度
        edgeGlow:1,
        edgeThickness:5,//粗细
        pulsePeriod:1,
        usePatternTexture:true,
        visibleEdgeColor:new THREE.Color(0xff0000),
        hiddenEdgeColor:new THREE.Color(0x0000ff)
    }
    updateOutLine()
    gui.add(guiParams,'edgeStrenth',0,10).onChange(value=>{
        guiParams.edgeStrenth=value
        updateOutLine()
    })
    gui.add(guiParams,'edgeGlow',0,1).onChange(value=>{
        guiParams.edgeGlow=value
        updateOutLine()
    })
    gui.add(guiParams,'edgeThickness',1,30).onChange(value=>{
        guiParams.edgeThickness=value
        updateOutLine()
    })
    gui.add(guiParams,'pulsePeriod',0,10).onChange(value=>{
        guiParams.pulsePeriod=value
        updateOutLine()
    })
    gui.add(guiParams,'usePatternTexture').onChange(value=>{
        guiParams.usePatternTexture=value
        updateOutLine()
    })
    gui.addColor(guiParams,'visibleEdgeColor').onChange(value=>{
        guiParams.visibleEdgeColor=value
        updateOutLine()
    })
    gui.addColor(guiParams,'hiddenEdgeColor').onChange(value=>{
        guiParams.hiddenEdgeColor=value
        updateOutLine()
    })
}
function updateOutLine(){
    outLinePass.edgeStrenth=guiParams.edgeStrenth
    outLinePass.edgeGlow=guiParams.edgeGlow
    outLinePass.edgeThickness=guiParams.edgeThickness
    outLinePass.pulsePeriod=guiParams.pulsePeriod
    outLinePass.usePatternTexture=guiParams.usePatternTexture
    outLinePass.visibleEdgeColor=guiParams.visibleEdgeColor
    outLinePass.hiddenEdgeColor=guiParams.hiddenEdgeColor
}
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.autoClear = false//定义renderer是否清除颜色缓存
    renderer.shadowMap.enabled = true
    renderer.domElement.style.touchAction = 'none'
    //添加鼠标事件
    renderer.domElement.addEventListener('pointermove', e => {
        // 归一化
        if (!e.isPrimary) return
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    })
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}

// 渲染函数
function render() {
    controls.update()
    composer.render()
    //通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(mouse, camera)
    //计算物体和射线的焦点
    const intersects = raycaster.intersectObject(scene, true)
    if (intersects.length > 0) {
        const currentObj = intersects[0].object //射线穿过的第一个
        if(currentObj.id!==38){//地面不做处理
            outLinePass.selectedObjects = []
            outLinePass.selectedObjects.push(currentObj)
        }else{
            outLinePass.selectedObjects = []
        }
    }else{
        outLinePass.selectedObjects = []
    }

    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xffffff, 1, 1000)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000)
    camera.position.set(0, 20, 80)
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
    composer.setSize(window.innerWidth, window.innerHeight)
})


