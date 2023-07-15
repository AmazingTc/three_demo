//引入threejs
import * as THREE from 'three'
//轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, controls, renderer = null
let light

initCamera()//初始化相机
initLights()//初始化灯光
initRenderer()//初始化渲染器
initUtils()//初始化工具
initMeshes()//创建物体
render()

/*
    三维向量Vector3（x,y,z）
    使用三维向量可以表示的有：
    1.一个位于三维空间中的点。
    2.一个在三维空间中的方向与长度的定义。在three.js中，长度总是从(0, 0, 0)到(x, y, z)的 Euclidean distance（欧几里德距离，即直线距离）， 方向也是从(0, 0, 0)到(x, y, z)的方向。
    3.任意的、有顺序的、三个为一组的数字组合。

    设置分量值：
    v.x=10
    v.setX(10)
    v.set(1,1,1)
    v.setScale(50)===v.set(50,50,50)

    v.setCompoent(0,33)//index(0:x,1:y,2:z)  value
    

    拷贝：
    let v1=new Three.Vector3(3,4,5)
    v.copy(v1)
    console.log(v)//{x:3,y:4,z:5}

    //创建一个新的Vector3对象
    v=v1.clone()
    console.log(v)//{x:3,y:4,z:5}

    随机赋值
    v.random()//0~1 长度随机
    v.randomDirection()//-1~1  长度为1  

    向量的长度
    (0,0,0)到vector3(x,y,z)的距离
    v=new Vector3(3,4,5)
    console.log(v.length()) //获取向量的具体长度  7.07106 （5倍根号2） =（3*3+4*4+5*5）开根号
    console.log(v.lengthSq()) //50,只比较大小，无需具体向量长度时使用
    console.log(v.manhattanLength())//曼哈顿距离 x+y+z
    v.setLength(100)//三个分量等比例缩放，向量长度达到100为止
    log(v.length())//100

    v.normalize()//归一化 将向量长度设为1 方向不变

    取整
    v=new Vectore(-0.8,0.5,0.8)
    v.ceil() //0,1,1  向上取整
    c.round()//-1,1,1 四舍五入
    v.floor()//-1,0,0  向下取整
    v.roundToZero()//0,0,0 向0取整

    v=new Vector3(1,2,3)
    v.max(new Vector3(2,2,2)) //1,2,2
    v.min(new Vector3(2,2,2)) //2,2,3

    夹子运算(区间限定，就近)
    v=new Vector3(10,20,30)
    let v1=v.clone().clamp(new Vector3(11,11,11),new Vector3(28,28,28))
    console.log(v1)//11,20,18

    let v2=v.clone().clampLength(40,50) //长度限定且就近，分量等比例缩放

    let v3=v.clone().clampScalar(11,29) //分量限定 {x:11,y:20,z:29}

    //向量转数组
    Vector=>[]
    let v=new Vector3(1,2,3)
    let v1=new Vector3(4,5,6)
    let array=[]
    v.toArray(array,0) [1,2,3]
    v1.toArray(array,3) [1,2,3,4,5,6]

    //数组转向量
    let v2=new Vector3()
    let arr=[1,2,3]
    v2.fromArray(arr,0)//从第0个开始赋值
    console.log(v2) //{x:1,y:2,z:3}


    正负取反 ：v2.negate() {-1,-2,-3}

    向量运算
    let v1=new Vector3(1,2,3)
    let v2=new Vector3(4,5,6)
    v1.add(v2)//v1: {5,7,9}
    v1.addVectors(v3,v4)//v1=v3+v4
    v1.addScalar(100) //三个分量分别+100
    v1.addScaleVectore(v2,100)//三个分量分别+v2*100
    v1.sub(v2) //三个分量相减

    v1.multiply(v2) //三个分量相乘
    v1.multiplyScalar(100)//三个分量分别乘100

    v1.divide(v2) //三个分量相除


    点积和叉积
    
    v=new Vector3(1,2,3)
    v1=new Vector3(2,3,4)
    点积为标量：分量相乘求和 等于0说明两个向量垂直  一般用于描述角度
    v.dot(v1) //20

    差积结果为向量，方向垂直于原两个向量
    v.cross(v1)//{0,0,12} ，此向量分别垂直于v和v1，遵循右手法则，长度为原两个向量的长度的积

    两向量的夹角
     v=new Vector3(3,0,0)
    v1=new Vector3(0,4,0)
    v.angleTo(v1) //90度 转弧度=1.57079...
    
    量向量距离
    v.distanceTo(v1)//两个向量顶点的距离  5

    插值
    v.lerp(v1,0.5) //连接两个向量的顶点 取中间值

    判断是否相等
     v=new Vector3(3,0,0)
     v1.copy(v1)
     console.log(v==v1)  false
     console.log(v===v1) false
     console.log(v.equals(v1)) true

*/


//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff))//环境光
    light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(10, 20, 10)
    light.castShadow = true
    scene.add(light)
}
// 初始化物体
function initMeshes() {


}

// 初始化工具
function initUtils() {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true//允许阻尼
    controls.dampingFactor = 0.04//阻尼惯性
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper)
}
//初始化渲染器
function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.shadowMap.enabled = true
    renderer.setClearColor(0xbfd1e5)
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.autoClear = false//定义renderer是否清除颜色缓存
    renderer.shadowMap.enabled = true
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 20, 20)
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


