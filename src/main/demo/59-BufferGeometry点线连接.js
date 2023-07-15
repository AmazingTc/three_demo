//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

let gui = new dat.GUI()
const params = {
    particleCount: 500,
    showDots: true,
    showLines: true,
    minDistance: 150,
    limitConnections: false,
    maxConnections: 20,
}

let scene, camera, controls, light, renderer
const colck = new THREE.Clock()

let group = new THREE.Group()

//点
let points
let particlesGeometry
let particlesPositions
let maxParticleCount = 1000 //最大点数
let particleCount = 500 //显示点数
const particlesData = []
const range = 800 //范围

//线
let linePositions
let lineColors
let lineMesh


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
    scene.add(group)
    initPoints()
    initLines()

}
function initPoints() {
    //个数*3个点（x,y,z）坐标
    particlesPositions = new Float32Array(maxParticleCount * 3)
    for (let i = 0; i < maxParticleCount; i++) {
        const x = (Math.random() - 0.5) * range //-400~400
        const y = (Math.random() - 0.5) * range //-400~400
        const z = (Math.random() - 0.5) * range //-400~400
        //位置
        particlesPositions[i * 3] = x
        particlesPositions[i * 3 + 1] = y
        particlesPositions[i * 3 + 2] = z

        particlesData.push({
            velocity: new THREE.Vector3(
                Math.random() * 2 - 1, //-1~1
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
            ),//速度
            numConnection: 0,//连接数量

        })
    }
    particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute(
        'position',
        //用于存储与BufferGeometry相关联的 attribute（例如顶点位置向量，面片索引，法向量，颜色值，UV坐标以及任何自定义 attribute ）
        new THREE.BufferAttribute(particlesPositions, 3).setUsage(THREE.DynamicDrawUsage)
    )
    //只渲染规定个数
    particlesGeometry.setDrawRange(0, particleCount)//范围内的进行渲染

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
    })
    points = new THREE.Points(particlesGeometry, particleMaterial)
    group.add(points)
    gui.add(params, 'particleCount', 0, maxParticleCount, 1).onChange(value => {
        particleCount = parseInt(value)
        particlesGeometry.setDrawRange(0, particleCount)
    })
}
function initLines() {
    const segments = maxParticleCount * (maxParticleCount - 1)
    // 分配内存
    linePositions = new Float32Array(segments * 3)
    lineColors = new Float32Array(segments * 3)

    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage)
    )
    lineGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage)
    )
    lineGeometry.computeBoundingSphere()
    lineGeometry.setDrawRange(0, 0)
    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    })
    lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial)
    group.add(lineMesh)

    gui.add(params, 'showDots').onChange(value => {
        points.visible = value
    }).name('显示点')
    gui.add(params, 'showLines').onChange(value => {
        lineMesh.visible = value
    }).name('显示线')
    gui.add(params, 'minDistance', 10, 300, 1)
    gui.add(params, 'limitConnections')
    gui.add(params,'maxConnections',0,30,1)
}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    //坐标轴辅助
    // scene.add(new THREE.AxesHelper(500))

    const boxHelper = new THREE.BoxHelper(
        new THREE.Mesh(new THREE.BoxGeometry(range, range, range)),
        new THREE.Color(0x303030)
    )
    boxHelper.material.blending = THREE.AdditiveBlending
    boxHelper.material.transparent = true
    group.add(boxHelper)
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

    let vertexposition = 0
    let colorposition = 0
    let numConnected = 0
    for (let i = 0; i < particleCount; i++) {
        particlesData[i].numConnection = 0//连接数0
    }
    for (let i = 0; i < particleCount; i++) {
        const pdata = particlesData[i]
        particlesPositions[i * 3] += pdata.velocity.x
        particlesPositions[i * 3 + 1] += pdata.velocity.y
        particlesPositions[i * 3 + 2] += pdata.velocity.z
        //是否到达边界 到达则掉头
        //x方向 y方向 z方向分别做判断
        if (particlesPositions[i * 3] < -range / 2 || particlesPositions[i * 3] > range / 2) {
            pdata.velocity.x = -pdata.velocity.x
        }
        if (particlesPositions[i * 3 + 1] < -range / 2 || particlesPositions[i * 3 + 1] > range / 2) {
            pdata.velocity.y = -pdata.velocity.y
        }
        if (particlesPositions[i * 3 + 2] < -range / 2 || particlesPositions[i * 3 + 2] > range / 2) {
            pdata.velocity.z = -pdata.velocity.z
        }


        if (params.limitConnections && pdata.numConnection >= params.maxConnections) {
            continue
        }
        for (let j = i + 1; j < particleCount; j++) {
            const pdata1 = particlesData[j]
            if (params.limitConnections && pdata1.numConnection >= params.maxConnections) {
                continue
            }
            const distanceX = particlesPositions[i *3] - particlesPositions[j * 3]
            const distanceY = particlesPositions[i * 3 + 1] - particlesPositions[j * 3 + 1]
            const distanceZ = particlesPositions[i * 3 + 2] - particlesPositions[j * 3 + 2]
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ)
            if (distance < params.minDistance) { //如果小于最小距离
                pdata.numConnection++
                pdata1.numConnection++
                const alpha = 1.0 - distance / params.minDistance
                //线位置
                linePositions[vertexposition++] = particlesPositions[i * 3]
                linePositions[vertexposition++] = particlesPositions[i * 3 + 1]
                linePositions[vertexposition++] = particlesPositions[i * 3 + 2]

                linePositions[vertexposition++] = particlesPositions[j * 3]
                linePositions[vertexposition++] = particlesPositions[j * 3 + 1]
                linePositions[vertexposition++] = particlesPositions[j * 3 + 2]
                
                //线颜色
                lineColors[colorposition++] = alpha
                lineColors[colorposition++] = alpha
                lineColors[colorposition++] = alpha

                lineColors[colorposition++] = alpha
                lineColors[colorposition++] = alpha
                lineColors[colorposition++] = alpha

                numConnected++
            }
        }

    }
    lineMesh.geometry.setDrawRange(0, numConnected * 2)
    lineMesh.geometry.attributes.position.needsUpdate = true
    lineMesh.geometry.attributes.color.needsUpdate = true
    points.geometry.attributes.position.needsUpdate = true
    group.rotation.y = time * 0.0003


    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    // scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 4000)
    camera.position.z = 1500
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

