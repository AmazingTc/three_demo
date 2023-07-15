import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect';//立体化效果
let scene,camera,renderer,controls;
let textureBg//背景
let container
let mouseX=0,mouseY=0
let spheres=[]
let effect//立体化效果

init()
initMeshes()
initEffect()
animate()

function init (){
    container=document.getElementById('container')
    renderer=new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,100000)
    camera.position.z=3200


    // 摄像机视锥体的长宽比
    camera.aspect=window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix();

    scene=new THREE.Scene()
    /**
     * 背景图，六张
     */
    textureBg=new THREE.CubeTextureLoader().setPath( './textures/cube/Park3Med/' ).load( ['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg'] );
    scene.background=textureBg
    scene.add(new THREE.AxesHelper(1000))
    
    controls=new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true
    controls.dampingFactor=0.05
    window.addEventListener('resize',onWindowResize)
    window.addEventListener('mousemove',onMouseMove)
}

function initMeshes(){
    const geometry=new THREE.SphereGeometry(100,32,16)
    // textureBg.mapping=THREE.CubeReflectionMapping //反射周围环境（金属球效果）
    textureBg.mapping=THREE.CubeRefractionMapping//折射周围环境(水滴效果)
    const material=new THREE.MeshBasicMaterial({
        color:0xffffff,
        envMap:textureBg,
        refractionRatio:0.93,//空气折射率
    })
    
    for(let i=0;i<500;i++){
        let mesh=new THREE.Mesh(geometry,material)
        mesh.position.set(
            Math.random()*10000-5000,
            Math.random()*10000-5000,
            Math.random()*10000-5000
        )
        const size = Math.random()*4+1
        mesh.scale.setScalar(size)
        spheres.push(mesh)
        scene.add(mesh)
    }
}

function initEffect(){
    effect=new StereoEffect(renderer)
    effect.setSize(window.innerWidth,window.innerHeight)
}
function onWindowResize(){
    camera.aspect=window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    //因为相当于effect接管了原来renderer的工作
    // renderer.setSize(window.innerWidth,window.innerHeight)  
    effect.setSize(window.innerWidth,window.innerHeight)
}
function onMouseMove(e){
    mouseX=(e.clientX-window.innerHeight/2)*2-1
    mouseY=(e.clientY-window.innerWidth/2)*2-1
}

function animate(){
    controls.update()
    requestAnimationFrame(animate)
    render()
}
function render(){
    const time=Date.now()*0.0001
    camera.position.x+=(mouseX-camera.position.x)*0.05
    camera.position.y+=(-mouseY-camera.position.y)*0.05
    camera.lookAt(new THREE.Vector3(0,0,0))

    spheres.forEach((item,index)=>{
        item.position.x=5000*Math.cos(time+index*1.1)
        item.position.y=5000*Math.sin(time+index*2.1)
    })

    // renderer.render(scene,camera)
   effect.render(scene,camera)
}