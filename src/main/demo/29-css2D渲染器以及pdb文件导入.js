//引入threejs
import * as THREE from 'three'
// 导入轨迹球控制器
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
//导入pdb文件加载器
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader'
import {CSS2DRenderer,CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'
let scene, camera, controls, renderer = null
let css2DRenderer
const url = './pdb/caffeine.pdb'//资源路径
/*
    pdb文件读取：
        1.导入加载器，导入CSS2DRenderer,CSS2DObject
        2. （1）CSS2DRenderer渲染器可以使三维物体和基于HTML的标签相结合
           （2）各个DOM元素被包含到一个CSS2DObject实例中并被添加到场景图中。
           （3）CSS2DRenderer也需要在渲染函数中进行render
        2.根据数据position,color等添加物体到场景中

*/
initCamera()
initLights()
initRenderer()
// CSS3D渲染器简化版本
initCss2dRenderer()
initEnvironment()
initUtils()
initMeshes()
render()



//初始化灯光
function initLights() {
    scene.add(new THREE.AmbientLight(0xaaaaaa))
}
//创建物体
function initMeshes() {
    const loader=new PDBLoader()
    loader.load(url,pdb=>{
        /*
        geometryAtoms:color [24] ,position [24]  :原子模型的颜色和位置
        geometryBonds:position[50] ,25对化学键
        json:atoms[24] ,0-2:位置信息，3：颜色信息，4：label描述标签    
        */
        //24个原子
        let positions=pdb.geometryAtoms.getAttribute('position')
        let colors=pdb.geometryAtoms.getAttribute('color')
        let position=new THREE.Vector3()
        let color=new THREE.Color()
        for(let i=0;i<positions.count;i++){
            position.x=positions.getX(i)
            position.y=positions.getY(i)
            position.z=positions.getZ(i)
            color.r=colors.getX(i)
            color.g=colors.getY(i)
            color.b=colors.getZ(i)
            //mesh
            const geometry=new THREE.IcosahedronGeometry(0.23,3)
            const material=new THREE.MeshPhongMaterial({
                color:color
            })
            const mesh=new THREE.Mesh(geometry,material)
            mesh.position.copy(position)
            scene.add(mesh)
        }
        //25个化学键
        positions=pdb.geometryBonds.getAttribute('position')
        const start=new THREE.Vector3()
        const end=new THREE.Vector3()
        for(let i=0;i<positions.count;i+=2){
            start.x=positions.getX(i)
            start.y=positions.getY(i)
            start.z=positions.getZ(i)
            end.x=positions.getX(i+1)
            end.y=positions.getY(i+1)
            end.z=positions.getZ(i+1)
            const geometry=new THREE.BoxGeometry(0.05,0.05,0.05)
            const material=new THREE.MeshPhongMaterial({
                color:0xffffff
            })
            const mesh=new THREE.Mesh(geometry,material)
            mesh.position.copy(start)//复制向量
            mesh.position.lerp(end,0.5)//朝着进行插值的Vector3,插值因数，其范围通常在[0, 1]闭区间。
            mesh.scale.z=start.distanceTo(end)*10 //distanceTo计算该向量到所传入的end间的距离
            mesh.lookAt(end)
            scene.add(mesh)
        }
        //label描述标签
        const atoms=pdb.json.atoms
        position=new THREE.Vector3()
        color=new THREE.Color()
        for(let i=0;i<atoms.length;i++){
            const atom=atoms[i]//每一个标签
            position={
                x:atom[0],
                y:atom[1],
                z:atom[2],
            }
            const text=document.createElement('div')//创建div
            text.style.color=`rgb(${atom[3][0]},${atom[3][1]},${atom[3][2]})`
            text.textContent=atom[4]//标签文本
            const label=new CSS2DObject(text)//将DOM元素转换为CSS2DObject实例
            label.position.copy(position)
            scene.add(label)
        }

        
    })
}

//初始化场景环境
function initEnvironment() {
    const pmreGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmreGenerator.fromScene(new RoomEnvironment(), 0.001).texture
}

// 初始化工具
function initUtils() {
    //轨迹控制器
    controls = new TrackballControls(camera, renderer.domElement)
    controls.enableDamping = true
    //添加坐标轴辅助器
    const axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper)

}
//CSS2D渲染器
function initCss2dRenderer(){
    css2DRenderer=new CSS2DRenderer()
    css2DRenderer.setSize(window.innerWidth,window.innerHeight)
    css2DRenderer.domElement.style.position='absolute'
    css2DRenderer.domElement.style.top='0'
    css2DRenderer.domElement.style.pointerEvents='none'
    document.body.appendChild(css2DRenderer.domElement)
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
    css2DRenderer.render(scene,camera)
    controls.update()//设置阻尼之后必须使用更新
    requestAnimationFrame(render)
}
// 初始化相机场景
function initCamera() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 3, 3)
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

