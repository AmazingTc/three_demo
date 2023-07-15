//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, renderer = null
// 导入UI界面控制库
import * as dat from 'dat.gui'
let gui
let light
let uniforms //着色器全局变量
/*
     shader:着色器，是一段GLSL编写的程序，在GBU上运行
     shaderMaterial:着色器材质
                     作用：绑定多个对象到一个BufferGeometry,以提高性能
                     注意点：1.只能使用WebGLRenderer,因为 vertexShader 和 fragmentShader 属性中GLSL代码必须使用WebGL来编译并运行在GPU中。
                            2.必须使用 BufferGeometry实例，使用BufferAttribute实例来定义自定义属性
                            3.WebGLRenderTarget 或 WebGLCubeRenderTarget 实例不再被用作uniforms。 必须使用它们的texture 属性    

     VertexShaders(顶点着色器) 先运行，接收attributes,计算顶点位置，并把其他数据（barying）传递到fragmentshader
    fragmentShaders(片段着色器) 设置每个片段的位置
    三种类型变量：Uniforms:全局变量
                 Attributes:每个顶点关联的变量，被两种着色器访问
                 varying:从vertexshadar传递到fragmentshader的变量                             
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
    light.position.set(100, 10, 0)
    scene.add(light)
}
// 初始化图形
function initMeshes() {
    const geometry = new THREE.PlaneGeometry(2, 2) //属于bufferGeometry
    /*
    Shader object,本质为Mesh(bufferGeometry,ShaderMaterial)
    ShaderMaterial:  1.uniforms:全局变量
                     2.vertextShader:顶端着色器，定义位置信息
                     3.fragmentShader:片断着色器，定义颜色
                            void mian(){
                                gl_FragColor=vec4(1.0,0.0,0.0,1.0); //蓝色
                            }
    GLSL语言：基于c                
    */
    const shaderMaterial = new THREE.ShaderMaterial()
    console.log(shaderMaterial);
    uniforms={
        time:{value:1.0}
    }
    shaderMaterial.uniforms=uniforms
    //顶点着色器
    shaderMaterial.vertexShader=`
    varying vec2 vUv;  //varying变量可以传递到fragmentShader
			void main()	{
				vUv = uv; //planeGeometry中 ->attibutes ->uv
				gl_Position = vec4( position, 1.0 ); //planeGeometry中 ->attibutes ->position
			}
    `
    //片段着色器
    shaderMaterial.fragmentShader=`
    varying vec2 vUv; 
    uniform float time; //我们定义的shaderMaterial.uniforms 属于全局变量
    void main()	{

        vec2 p = - 1.0 + 2.0 * vUv;
        float a = time * 40.0;
        float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;

        e = 400.0 * ( p.x * 0.5 + 0.5 );
        f = 400.0 * ( p.y * 0.5 + 0.5 );
        i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
        d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
        r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
        q = f / r;
        e = ( r * cos( q ) ) - a / 2.0;
        f = ( r * sin( q ) ) - a / 2.0;
        d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
        h = ( ( f + d ) + a / 2.0 ) * g;
        i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
        h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
        h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
        i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
        i = mod( i / 5.6, 256.0 ) / 64.0;
        if ( i < 0.0 ) i += 4.0;
        if ( i >= 2.0 ) i = 4.0 - i;
        d = r / 350.0;
        d += sin( d * d * 8.0 ) * 0.52;
        f = ( sin( a * g ) + 1.0 ) / 2.0;
        gl_FragColor = vec4( vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x + vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x ), 1.0 );

    }                     
    `
    scene.add(new THREE.Mesh(geometry, shaderMaterial))


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
    uniforms["time"].value+=1/10 //控制速度
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    //正交相机
    camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0, 100)
    camera.position.set(0, 0, 10)
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

