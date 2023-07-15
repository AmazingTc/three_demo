//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, renderer = null

let composer
// 后期处理
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
//电影效果
import {FilmPass} from 'three/examples/jsm/postprocessing/FilmPass'
//辉光效果
import {BloomPass} from 'three/examples/jsm/postprocessing/BloomPass'
// 导入UI界面控制库
import * as dat from 'dat.gui'
let light
let mesh
let uniforms
/*
      
      renderer.autoClear=false//定义renderer是否清除颜色缓存
      renderer.clear()
      composer.render(0.1)
*/
initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initMeshes()//初始化图像
postProcessing()//后期处理
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
    //创建一个圆环物体
    // const geometry=new THREE.TorusGeometry(0.5,0.2,80,80)

    const geometry=new THREE.SphereGeometry( 1.0, 100, 100 )
    //纹理加载器
    const textureLoader=new THREE.TextureLoader()
    //加载纹理图
    const texture1=textureLoader.load('./textures/lava/cloud.png')
    const texture2=textureLoader.load('./textures/lava/lavatile.jpg')
    // 在水平.垂直方向上将如何包裹,纹理将简单地重复到无穷大。
    texture1.wrapS=texture1.wrapT=THREE.RepeatWrapping
    texture2.wrapS=texture2.wrapT=THREE.RepeatWrapping
    //全局变量
    uniforms={
        'texture1':{value:texture1},
        'texture2':{value:texture2},
        'time':{value:1.0},
        'fogDensity':{value:0.001},
        'fogColor':{value:new THREE.Vector3(10,10,10)},
        'uvScale':{value:new THREE.Vector2(1.0,1.0)},
    }
    const material=new THREE.ShaderMaterial({
        uniforms:uniforms,
        vertexShader:`
        uniform vec2 uvScale;
        varying vec2 vUv;
        void main(){
            vUv=uvScale*uv;//后者uv为geometry的uv
            //响应位置
            vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
            gl_Position=projectionMatrix*mvPosition;
        }
        `,
        fragmentShader:`
        uniform sampler2D texture2;
        uniform sampler2D texture1;
        uniform float fogDensity;
        uniform vec3 fogColor;
        uniform float time;
        varying vec2 vUv;
        void main(){
            vec4 noise=texture2D(texture1,vUv);
            vec2 Time1=vUv+vec2(1.5,-1.5)*time*0.02;
            vec2 Time2=vUv+vec2(-0.5,2.0)*time*0.01;
            Time1.x+=noise.x*2.0;
            Time1.y+=noise.y*2.0;
            Time2.x+=noise.y*2.0;
            Time2.y+=noise.z*2.0;
            float p=texture2D(texture1,Time1*2.0).a;

            vec4 color=texture2D(texture2,Time2*2.0);
            vec4 temp=color *(vec4(p,p,p,p)*3.0)+(color*color-0.1);
            if(temp.r>1.0){temp.bg+=clamp(temp.r-2.0,0.0,100.0);}
            if(temp.g>1.0){temp.rb+=temp.g-1.0;}
            if(temp.b>1.0){temp.bg+=temp.b-1.0;}

            gl_FragColor=temp;

            float depth=gl_FragCoord.z/gl_FragCoord.w;
            const float LOG2=1.442695;
            float fogFactor=exp2(-fogDensity*fogDensity*depth*depth*LOG2);
            fogFactor=1.0-clamp(fogFactor,0.0,1.0);
            gl_FragColor=mix(gl_FragColor,vec4(fogColor,gl_FragColor.w),fogFactor);
        }
        `
    })
    mesh=new THREE.Mesh(geometry,material)
    scene.add(mesh)
}
// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    const axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper)
}

function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.autoClear=false//定义renderer是否清除颜色缓存
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
//后期处理
function postProcessing(){
    composer=new EffectComposer(renderer)
    const renderPass=new RenderPass(scene,camera) //必须参数
    const bloomPass=new BloomPass(1.2)//辉光
    const filmPass=new FilmPass(0,1,1024,false)// 电影
    composer.addPass(renderPass)
    composer.addPass(bloomPass)
    composer.addPass(filmPass)
}
// 渲染函数
function render() {
    uniforms['time'].value+=0.05
    mesh.rotation.y+=0.01
    controls.update()
    renderer.clear()
    composer.render(0.1)
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    //正交相机
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 3000)
    camera.position.z = 5
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

