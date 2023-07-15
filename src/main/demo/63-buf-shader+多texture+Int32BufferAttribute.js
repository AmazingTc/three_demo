//引入threejs
import * as THREE from 'three'
import { DoubleSide } from 'three'
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
   const triangles=10000
   const range=800
   const size=50
   const positions=[]
   const uvs=[]
   const textureIndeices=[]
    for(let i=0;i<=triangles;i++){
        const x=(Math.random()-0.5)*range
        const y=(Math.random()-0.5)*range
        const z=(Math.random()-0.5)*range

        const ax=x+(Math.random()-0.5)*size
        const ay=y+(Math.random()-0.5)*size
        const az=z+(Math.random()-0.5)*size

        const bx=x+(Math.random()-0.5)*size
        const by=y+(Math.random()-0.5)*size
        const bz=z+(Math.random()-0.5)*size

        const cx=x+(Math.random()-0.5)*size
        const cy=y+(Math.random()-0.5)*size
        const cz=z+(Math.random()-0.5)*size

        positions.push(ax,ay,az)
        positions.push(bx,by,bz)
        positions.push(cx,cy,cz)

        //uv映射
        uvs.push(0,0)
        uvs.push(0,0.5)
        uvs.push(1,0)

        const t=i%3 //0,1,2
        textureIndeices.push(t,t,t)
    }
    const geometry=new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2))
    geometry.setAttribute('textureIndex',new THREE.Int32BufferAttribute(textureIndeices,1))


    const loader=new THREE.TextureLoader()
    const map1=loader.load('textures/crate.gif')
    const map2=loader.load('textures/floors/FloorsCheckerboard_S_Diffuse.jpg')
    const map3=loader.load('textures/terrain/grasslight-big.jpg')

    const material=new THREE.ShaderMaterial({
        uniforms:{
            uTextures:{
                value:[map1,map2,map3]
            }
        },
        vertexShader:`
            in int textureIndex;
            flat out int vIndex;
            out vec2 vUv;
            void main(){
                vIndex=textureIndex;//geometry中定义
                vUv=uv;//geometry中uv
                gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
            }
        `,
        fragmentShader:`
            flat in int vIndex;
            in vec2 vUv;
            uniform sampler2D uTextures[3];
            out vec4 outColor;
            void main(){
                if(vIndex==0){
                    outColor=texture(uTextures[0],vUv);
                }
                else if(vIndex==1){
                    outColor=texture(uTextures[1],vUv);
                }
                else if(vIndex==2){
                    outColor=texture(uTextures[2],vUv);
                }
            }
        `,
        side:THREE.DoubleSide,
        glslVersion:THREE.GLSL3,
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
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xdddddd)
    // scene.fog = new THREE.Fog(0xdddddd, 0.75)
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 3500)
    camera.position.z = 2500
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

