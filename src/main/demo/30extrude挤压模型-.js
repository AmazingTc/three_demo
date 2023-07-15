//引入threejs
import * as THREE from 'three'
// 导入轨迹球控制器
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

let scene, camera, controls, renderer = null

/*
   

*/
initCamera()
initLights()
initRenderer()
initUtils()
initMeshes()
render()



//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0x222222))//环境光
    const light = new THREE.PointLight(0xffffff)//点光源（灯泡）
    light.position.copy(camera.position)//位置为相机位置
    scene.add(light)
}
//创建物体
function initMeshes() {
    //红色环形
    //创建一条平滑的三维样条曲线
    const closedSpline = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-60, -100, 60),//左下点位
        new THREE.Vector3(-60, 20, 60),//左中点位
        new THREE.Vector3(-60, 120, 60),//左上点位
        new THREE.Vector3(60, 20, -60),//右中点位
        new THREE.Vector3(60, -100, -60),//右下点位
    ])
    closedSpline.curveType = 'catmullrom'
    closedSpline.closed = true//是否闭合
    //挤压设置
    const extrudeSettings = {
        steps: 200,//段数,越多看起来越平滑
        bevelEnabled: false,//是否启用斜角效果
        extrudePath: closedSpline//路径
    }
    const r=20//半径
    const points=[]//点
    const count=3//棱
    for(let i=0;i<count;i++){
        const angle=i/count*2*Math.PI
        points.push(new THREE.Vector2(
            r*Math.cos(angle),
            r*Math.sin(angle)
        ))
    }
    const shape1=new THREE.Shape(points)
    //挤压缓冲几何体
    const geometry1=new THREE.ExtrudeGeometry(shape1,extrudeSettings)
    const material1=new THREE.MeshLambertMaterial({color:0xb00000})//反光弱
    const mesh1=new THREE.Mesh(geometry1,material1)
    scene.add(mesh1)

    //蓝色条形五角星
    // 随机横向路径上的点
    const randomPoints=[]
    for(let i=0;i<10;i++){
        randomPoints.push(new THREE.Vector3(
            (i-4.5)*50,//以50为间隔，在-4.5到4.5之间分配
            THREE.MathUtils.randFloat(-30,30),
            THREE.MathUtils.randFloat(-30,30)
        ))
    }
    const Spline = new THREE.CatmullRomCurve3(randomPoints)
    Spline.curveType = 'catmullrom'
    const extrudeSettings1 = {
        steps: 200,//段数,越多看起来越平滑
        bevelEnabled: false,//是否启用斜角效果
        extrudePath: Spline//路径
    }
    const points1=[]//点
    const count1=5//棱
    //五角星算法
    for(let i=0;i<count1*2;i++){
        const l=i%2===1?10:15
        const a=i/count1*Math.PI
        points1.push(new THREE.Vector2(
            Math.cos(a)*l,
            Math.sin(a)*l
        ))
    }
    const shape2=new THREE.Shape(points1)
    //挤压缓冲几何体
    const geometry2=new THREE.ExtrudeGeometry(shape2,extrudeSettings1)
    const material2=new THREE.MeshLambertMaterial({color:0xff8000})//反光弱
    const mesh2=new THREE.Mesh(geometry2,material2)
    scene.add(mesh2)


    
    //五角星
   const material3=[material1,material2]
   const extrudeSettings3={
    depth:10,//挤出的形状的深度
    steps:1,//用于沿着挤出样条的深度细分的点的数量
    bevelEnabled:true,//对挤出的形状应用是否斜角
    bevelThickness:2,//置原始形状上斜角的厚度
    bevelSize:4,//斜角与原始形状轮廓之间的延伸距离
    bevelSegment:1//曲线上点的数量，默认值是12
   } 
   //该对象将一个二维形状挤出为一个三维几何体
   const geometry3=new THREE.ExtrudeGeometry(shape2,extrudeSettings3)
   const mesh3=new THREE.Mesh(geometry3,material3)
   mesh3.position.set(50,100,50)
   scene.add(mesh3) 


}


// 初始化工具
function initUtils() {
    //轨迹控制器
    controls = new TrackballControls(camera, renderer.domElement)
    //缩放限制
    controls.minDistance = 200//能够将相机向外移动多少
    controls.maxDistance = 500//能够将相机向内移动多少
    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper)

}

function initRenderer() {
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    //改变渲染器输入编码
    // renderer.outputEncoding = THREE.sRGBEncoding
    //设置渲染尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    //设置像素比
    renderer.setPixelRatio(window.devicePixelRatio)
    //将webgl渲染的canvas内容添加到body
    document.body.appendChild(renderer.domElement)
}
// 渲染函数
function render() {
    renderer.render(scene, camera)
    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x2222222)
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 0, 500)
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

    controls.handleResize()
})

