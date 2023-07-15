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
    const positions=[]
    //InstancedBufferGeometry 属性
    const instances=50000 //数量
    const offsets=[] //偏移量
    const colors=[] //颜色
    const orientationsStart=[]
    const orientationsEnd=[]
    const vec=new THREE.Vector4()
    
    positions.push(0.025,-0.025,0)
    positions.push(-0.025,0.025,0)
    positions.push(0,0,0.025)
    for(let i=0;i<instances;i++){
        offsets.push(
            Math.random()-0.5,//-0.5~0.5
            Math.random()-0.5,
            Math.random()-0.5
        )
        colors.push(
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),//alpha
        )
        vec.set(
            Math.random()*2-1,//-1~1
            Math.random()*2-1,//-1~1
            Math.random()*2-1,//-1~1
            Math.random()*2-1,//-1~1
        )
        vec.normalize()
        orientationsStart.push(vec.x,vec.y,vec.z,vec.w)

        vec.set(
            Math.random()*2-1,//-1~1
            Math.random()*2-1,//-1~1
            Math.random()*2-1,//-1~1
            Math.random()*2-1,//-1~1
        )
        vec.normalize()
        orientationsEnd.push(vec.x,vec.y,vec.z,vec.w)
    }
    geometry=new THREE.InstancedBufferGeometry() 
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
    //设置InstancedBufferGeometry属性
    geometry.setAttribute('color',new THREE.InstancedBufferAttribute(new Float32Array(colors),4))
    geometry.setAttribute('offset',new THREE.InstancedBufferAttribute(new Float32Array(offsets),3))
    geometry.setAttribute('orientationStart',new THREE.InstancedBufferAttribute(new Float32Array(orientationsStart),4))
    geometry.setAttribute('orientationEnd',new THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd),4))
    
    material=new THREE.ShaderMaterial({
        side:THREE.DoubleSide,
        transparent:true,
        uniforms:{
            time:{value:1.0},
            sineTime:{value:1.0},
        },
        vertexShader:`
            precision highp float;//高精度
            varying vec3 vPosition;
            varying vec4 vColor;//定义的属性
            attribute vec3 offset; //定义的属性
            attribute vec4 orientationStart; //定义的属性
            attribute vec4 orientationEnd; //定义的属性
            attribute vec4 color;//定义的属性
            uniform float sineTime;
            void main(){
                vPosition=offset*max(abs((sineTime*2.0+1.0)),0.5)+position;
                vec4 orientation=mix(//线性插值
                    orientationStart,orientationEnd,sineTime
                );
                vec3 vcV=cross(orientation.xyz,vPosition);
                vPosition=vcV*(2.0*orientation.w)+(cross(orientation.xyz,vcV)*2.0+vPosition);
                vColor=color;
                gl_Position=projectionMatrix*modelViewMatrix*vec4(vPosition,1.0);
            }
        `,
        fragmentShader:`
            precision highp float;//高精度
            uniform float time;
            varying vec3 vPosition;
            varying vec4 vColor;
            void main(){
                vec4 color=vec4(vColor);
                color.r+=sin(vPosition.x*10.0+time)*0.5;
                gl_FragColor=color;
            }
        `

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
    scene.add(new THREE.AxesHelper(1))
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
    mesh.material.uniforms.time.value=time*0.01
    mesh.material.uniforms.sineTime.value=Math.sin(mesh.material.uniforms.time.value*0.05)
    mesh.rotation.y=time*0.001
    

    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    // scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10)
    camera.position.z = 4
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

