//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, camera, controls, light, renderer
let mesh, geometry, material

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
    const circleG = new THREE.CircleGeometry(1, 6)
    geometry = new THREE.InstancedBufferGeometry()
    geometry.index = circleG.index
    geometry.attributes = circleG.attributes

    const particleCount = 60000 //点数
    const translateArr = new Float32Array(particleCount * 3)
    for (let i = 0, i3 = 0, l = particleCount; i < l; i++, i3 += 3) {
        translateArr[i3] = Math.random() * 2 - 1
        translateArr[i3 + 1] = Math.random() * 2 - 1
        translateArr[i3 + 2] = Math.random() * 2 - 1
    }
    geometry.setAttribute('translate', new THREE.InstancedBufferAttribute(translateArr, 3))

    //rawShaderMaterial:不会自动声明geometry的属性
    material = new THREE.RawShaderMaterial({
        uniforms: {
            map: {
                value: new THREE.TextureLoader().load('textures/sprites/circle.png')
            },
            time: {
                value: 0.0
            }
        },
        vertexShader: `
            precision highp float;
            uniform mat4 modelViewMatrix;//需要定义
            uniform mat4 projectionMatrix;
            uniform float time;
            attribute vec3 position;
            attribute vec2 uv; //geometry的属性
            attribute vec3 translate;
            varying vec2 vUv; //传递到片段着色
            varying float vScale;
            void main(){
                vec4 mvPosition=modelViewMatrix*vec4(translate,1.0);
                vec3 trTime=vec3(translate.x+time,translate.y+time,translate.z+time);
                float scale=sin(trTime.x*2.1)+cos(trTime.y*4.1)+sin(trTime.z*4.2);
                vScale=scale;
                scale=scale*10.0+10.0;
                mvPosition.xyz+=position*scale;
                gl_Position=projectionMatrix*mvPosition;
                vUv=uv;
            }
        `,
        fragmentShader: `
            //解决报错 No precision specified for (float)
            precision highp float;
            uniform sampler2D map;
            varying float vScale;
            varying vec2 vUv;//从顶点着色器传递过来的数据
            //方法
            vec3 HUEToRGB(float H){
                H=mod(H,1.0);
                float R=abs(H*2.0-3.0)-1.0;
                float G=abs(H*2.0-5.0);
                float B=abs(H*1.0-1.0);
                return clamp(vec3(R,G,B),0.0,1.0);
            }
            vec3 HSLToRGB(vec3 HSL){
                vec3 RGB =HUEToRGB(HSL.x);
                float C=(1.0-abs(2.0*HSL.z-1.0))*HSL.y;
                return (RGB-0.5)*C+HSL.z;
            }
            void main(){
                vec4 diffuseColor=texture2D(map,vUv);//贴图
                if(diffuseColor.w<0.5) discard;
                gl_FragColor=vec4(diffuseColor.xyz*HSLToRGB(vec3(vScale/5.0,1.0,0.5)),diffuseColor.w);
            }
        `

    })

    mesh = new THREE.Mesh(geometry, material)
    mesh.scale.setScalar(500)
    scene.add(mesh)
}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    //坐标轴辅助
    scene.add(new THREE.AxesHelper(200))
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
    material.uniforms['time'].value=time*0.001

    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xdddddd)
    // scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000)
    camera.position.z = 1400
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

