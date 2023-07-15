//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, camera, controls, light, renderer
let points,geometry
const particles=2000

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
    //geometry
    const range=400
    const positions=[]
    const colors=[]
    const sizes=[]
    const color=new THREE.Color()
    for(let i=0;i<particles;i++){
        //position
        positions.push(
           ( Math.random()-0.5)*range,
           ( Math.random()-0.5)*range,
           ( Math.random()-0.5)*range
        )
        //color
        color.setHSL(i/particles,1.0,0.5)
        colors.push(
            color.r,color.g,color.b    
        )

        // size
        sizes.push(10)
    }
    geometry=new THREE.BufferGeometry()
    //设置geometry属性
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3))
    geometry.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1).setUsage(THREE.DynamicDrawUsage))

    //shader
    const uniforms={
        pointTexture:{
            value:new THREE.TextureLoader().load('textures/sprites/spark1.png')
        }
    }
    const shaderMaterial=new THREE.ShaderMaterial({
        uniforms:uniforms,
        vertexShader:`
            attribute float size;//geometry中定义的
            varying vec3 vColor;//传递到fragmentShader中
            void main(){
                vColor=color;//geometry中定义的color
                vec4 mvPosition=modelViewMatrix*vec4(position,1.0);//geometry中定义的position
                gl_Position=projectionMatrix*mvPosition;
                gl_PointSize=size*(300.0/-mvPosition.z);
            }
        `,
        fragmentShader:`
            uniform sampler2D pointTexture;//全局变量
            varying vec3 vColor;
            void main(){
                gl_FragColor=vec4(vColor,1.0);
                gl_FragColor=gl_FragColor*texture2D(pointTexture,gl_PointCoord);
            }
        `,
        blending:THREE.AdditiveBlending,
        depthTest:false,
        transparent:true,
        vertexColors:true
    })

    points=new THREE.Points(geometry,shaderMaterial)
    scene.add(points)



}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    //坐标轴辅助
    scene.add(new THREE.AxesHelper(100))
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
    points.rotation.y=0.0001*time
    const sizes=geometry.attributes.size.array
    for(let i=0;i<particles;i++){
        sizes[i]=15*(1+Math.sin(0.1*i+time*0.01))
    }
    geometry.attributes.size.needsUpdate=true
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    // scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.z = 300
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

