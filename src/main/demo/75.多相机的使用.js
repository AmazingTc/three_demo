import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, renderer
let mesh1, mesh2, mesh3
let controls
let container
let group
let cameraPerspective, cameraPerspectiveHelper
let activeCamera,activeCameraHelper
let cameraOrho,cameraOrhoHelper
let frustumSize=600
init()
initMeshes()
/**
    多相机的使用：
    1.创建Mesh
    3.增加相机
    4.设置视口
    5.设置裁剪区域
    6.添加正交相机

 
 */


function init() {

    scene = new THREE.Scene()
    scene.add(new THREE.AxesHelper(300))
    group = new THREE.Group()
    scene.add(group)

    container = document.getElementById('container')
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)
    renderer.autoClear = false
    renderer.setAnimationLoop(animate)

    // 相机1
    camera = new THREE.PerspectiveCamera(50, 0.5*window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = 2500

    //相机2
    cameraPerspective = new THREE.PerspectiveCamera(50, 0.5*window.innerWidth / window.innerHeight, 150, 1000)
    cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective)


    //相机3（正交）
    cameraOrho=new THREE.OrthographicCamera(
        0.5*frustumSize*window.innerWidth/window.innerHeight/-2,
        0.5*frustumSize*window.innerWidth/window.innerHeight/2,
        frustumSize/2,
        frustumSize/-2,
        150,
        1000
        )
    cameraOrho.rotation.y=Math.PI
    group.add(cameraOrho)
    cameraOrhoHelper=new THREE.CameraHelper(cameraOrho)
    scene.add(cameraOrhoHelper)    


    activeCamera=cameraPerspective
    activeCameraHelper=cameraPerspectiveHelper

    cameraPerspective.rotation.y = Math.PI
    scene.add(cameraPerspectiveHelper)
    group.add(cameraPerspective)

    // 摄像机视锥体的长宽比
    camera.aspect = 0.5*window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();


    //轨道控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    window.addEventListener('resize', onWindowResize)
    window.addEventListener('keydown',onkeydown)

}
function onkeydown(e){
    switch(e.keyCode){
        case 79://o键
            activeCamera=cameraOrho;
            activeCameraHelper=cameraOrhoHelper;
            break;
        case 80://p键
            activeCamera=cameraPerspective;
            activeCameraHelper=cameraPerspectiveHelper;
            break;
    }
}
function initMeshes() {
    mesh1 = new THREE.Mesh(
        new THREE.SphereGeometry(100, 16, 8),
        //不受光的限制，无灯光也可以显示
        new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
    )
    scene.add(mesh1)

    mesh2 = new THREE.Mesh(
        new THREE.SphereGeometry(50, 16, 8),
        //不受光的限制，无灯光也可以显示
        new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    )
    mesh2.position.y = 150
    mesh1.add(mesh2) //mesh2添加到mesh1中


    mesh3 = new THREE.Mesh(
        new THREE.SphereGeometry(10, 16, 8),
        //不受光的限制，无灯光也可以显示
        new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
    )
    mesh3.position.z = 150
    group.add(mesh3) //mesh2添加到group中

    const geometry=new THREE.BufferGeometry()
    const vertices=[]
    for(let i=0;i<10000;i++){
        vertices.push(
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000)
        )
    }
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3))
    const particles=new THREE.Points(geometry,new THREE.PointsMaterial({color:0x888888}))
    scene.add(particles)


}

function onWindowResize() {
    camera.aspect = 0.5*window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    cameraPerspective.aspect = 0.5*window.innerWidth / window.innerHeight
    cameraPerspective.updateProjectionMatrix()

    cameraOrho.left=-0.5*frustumSize*window.innerWidth/window.innerHeight
    cameraOrho.right=-0.5*frustumSize*window.innerWidth/window.innerHeight
    cameraOrho.top=frustumSize/2
    cameraOrho.bottom=frustumSize/2
    cameraOrho.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate(times) {
    times = times * 0.0005
    mesh1.position.set(
        700 * Math.cos(times),
        700 * Math.sin(times),
        700 * Math.sin(times),
    )

    mesh2.position.x=70 * Math.cos(times)
    mesh2.position.z= 70 * Math.sin(times)
    controls.update()


    if(activeCamera===cameraPerspective){
        cameraPerspective.fov=35+30*Math.sin(0.5*times)
        cameraPerspective.far=mesh1.position.length()
        cameraPerspective.updateProjectionMatrix()
        cameraPerspectiveHelper.update()
        cameraPerspectiveHelper.visible=true
        cameraOrhoHelper.visible=false
    }else{
        cameraOrho.far=mesh1.position.length()
        cameraOrho.updateProjectionMatrix()

        cameraOrhoHelper.update()


        cameraPerspectiveHelper.visible=false
        cameraOrhoHelper.visible=true
    }

    // 清除整个渲染区域
   renderer.clear();
    

    group.lookAt(mesh1.position)


    activeCameraHelper.visible=false
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
    // 设置裁剪区域和启用裁剪测试
    //裁剪区域的左上角坐标 (x, y) 和宽度、高度 (width, height)
    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, cameraPerspective);



    activeCameraHelper.visible=true
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    // 设置裁剪区域和启用裁剪测试
    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, camera);
}
