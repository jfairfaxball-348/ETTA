import * as THREE from 'three';
import type { BodyState } from './simulation';
import { HOME_OBJECTS, type WorldObject, type WorldState } from './world';

function material(color: number, metalness = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness });
}
function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, color: number,
  x: number, y: number, z: number): THREE.Mesh {
  const object = new THREE.Mesh(geometry, material(color));
  object.position.set(x, y, z);
  object.castShadow = true; object.receiveShadow = true; parent.add(object);
  return object;
}
function buildEtta(): { root: THREE.Group; animate: (elapsed: number, movement: number) => void } {
  const root = new THREE.Group(), figure = new THREE.Group();
  root.add(figure);
  const porcelain = 0xe9b5a5, coat = 0x61d4c4, dark = 0x24394b, hair = 0x30293b;
  mesh(figure, new THREE.CapsuleGeometry(0.30, 0.56, 6, 12), coat, 0, 1.13, 0);
  mesh(figure, new THREE.SphereGeometry(0.30, 20, 16), porcelain, 0, 1.99, 0);
  mesh(figure, new THREE.SphereGeometry(0.315, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.50), hair, 0, 2.08, 0);
  // Front is -Z. Large eyes and asymmetrical fringe give Etta a recognisable face.
  for (const x of [-0.115, 0.115]) {
    mesh(figure, new THREE.SphereGeometry(0.044, 10, 8), dark, x, 2.02, -0.277);
    mesh(figure, new THREE.CapsuleGeometry(0.088, 0.38, 4, 10), dark, x, 0.51, 0.02);
    mesh(figure, new THREE.SphereGeometry(0.11, 10, 8), 0xc0c3c9, x, 0.13, -0.09);
  }
  mesh(figure, new THREE.SphereGeometry(0.050, 10, 8), 0xbd786d, 0, 1.91, -0.298);
  const arms: THREE.Group[] = [];
  for (const sign of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sign * 0.38, 1.46, 0);
    mesh(arm, new THREE.CapsuleGeometry(0.115, 0.43, 5, 10), coat, 0, -0.35, 0);
    mesh(arm, new THREE.SphereGeometry(0.12, 10, 8), porcelain, 0, -0.71, 0);
    figure.add(arm); arms.push(arm);
  }
  // A small scarf is intentionally part of Etta, not a world object.
  mesh(figure, new THREE.TorusGeometry(0.265, 0.063, 8, 24), 0xf3c47a, 0, 1.60, 0).rotation.x = Math.PI / 2;
  return { root, animate(elapsed, movement) {
    const amplitude = Math.min(1, movement / 2.5);
    figure.position.y = amplitude * Math.sin(elapsed * 12) * 0.024;
    arms[0].rotation.x = Math.sin(elapsed * 9) * amplitude * 0.25;
    arms[1].rotation.x = -arms[0].rotation.x;
  }};
}

/** Build visual proxies only from authoritative world objects. */
export function createStage(mount: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x243b46);
  scene.fog = new THREE.Fog(0x243b46, 24, 44);
  const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 65);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !coarse, powerPreference:'low-power' });
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse?1.25:1.5));
  renderer.shadowMap.enabled=!coarse;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xc6e7ff,0x514032,2.3));
  const sun=new THREE.DirectionalLight(0xffe8c8,2.7);
  sun.position.set(-3,9,5);sun.castShadow=!coarse;
  sun.shadow.mapSize.set(512,512);
  sun.shadow.camera.left=-10;sun.shadow.camera.right=10;
  sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;
  scene.add(sun);
  const addBox=(w:number,h:number,d:number,color:number,x:number,y:number,z:number)=>{
    return mesh(scene,new THREE.BoxGeometry(w,h,d),color,x,y,z);
  };
  let lampShade:THREE.MeshStandardMaterial|null=null;
  const lampLight=new THREE.PointLight(0xffd49a,0,4.5,2);
  scene.add(lampLight);
  function renderObject(o:WorldObject) {
    const b=o.bounds,w=b.maxX-b.minX,d=b.maxZ-b.minZ;
    const x=(b.minX+b.maxX)/2,z=(b.minZ+b.maxZ)/2,h=o.height;
    if(o.kind==='floor'){
      const floor=addBox(w,h,d,o.id==='floor'?0x927c6b:0xae9b84,x,-h/2,z);
      floor.castShadow=false;
    } else if(o.kind==='wall'){
      addBox(w,h,d,0xd3bda8,x,h/2,z);
      if(o.id==='north-wall')addBox(w,0.14,d+0.06,0xf3dec3,x,h-0.10,z);
    } else if(o.kind==='threshold'){
      addBox(w,h,d,0xe1b77d,x,h/2,z);
    } else if(o.kind==='rug'){
      addBox(w,h,d,0x8fada3,x,h/2+0.005,z);
      addBox(w-0.16,0.012,d-0.16,0xc6c9a9,x,h+0.01,z);
    } else if(o.kind==='bed'){
      addBox(w,0.35,d,0xb08a67,x,0.2,z);
      addBox(w-0.10,0.23,d-0.15,0xe6d9b9,x,0.49,z);
      addBox(w-0.13,0.13,d*0.57,0x83a99f,x,0.65,z+0.52);
      for(const px of [x-w*0.24,x+w*0.24])
        addBox(w*0.35,0.12,0.37,0xf7ece1,px,0.69,b.minZ+0.33);
      addBox(w,0.92,0.17,0xa57355,x,0.52,b.minZ+0.08);
    } else if(o.kind==='table'){
      addBox(w,0.12,d,0x946747,x,h-0.06,z);
      for(const px of [b.minX+0.16,b.maxX-0.16])
        for(const pz of [b.minZ+0.14,b.maxZ-0.14])
          addBox(0.16,h-0.13,0.16,0x634632,px,(h-0.13)/2,pz);
      addBox(0.62,0.05,0.42,0xe2d8b9,x-0.46,h+0.03,z);
    } else if(o.kind==='chair'){
      addBox(w,0.15,d,0x829b85,x,0.53,z);
      addBox(w,0.63,0.14,0x829b85,x,0.77,b.maxZ-0.07);
      for(const px of [b.minX+0.11,b.maxX-0.11])
        for(const pz of [b.minZ+0.13,b.maxZ-0.13])
          addBox(0.13,0.5,0.13,0x554e40,px,0.25,pz);
    } else if(o.kind==='cabinet'){
      addBox(w,h,d,0xb37c58,x,h/2,z);
      addBox(w+0.07,0.10,d+0.07,0xd9ae7d,x,h+0.02,z);
      addBox(0.035,0.045,0.12,0xf3d8a9,b.maxX+0.025,h*0.58,z);
    } else if(o.kind==='lamp'){
      mesh(scene,new THREE.CylinderGeometry(0.21,0.23,0.11,12),0x9b7957,x,0.06,z);
      mesh(scene,new THREE.CylinderGeometry(0.043,0.045,1.50,10),0xc2b393,x,0.82,z);
      const shade=mesh(scene,new THREE.ConeGeometry(0.235,0.43,16,1,true),0xf0d9a4,x,1.73,z);
      lampShade=shade.material as THREE.MeshStandardMaterial;
      lampLight.position.set(x,1.66,z);
    } else if(o.kind==='plant'){
      mesh(scene,new THREE.CylinderGeometry(0.18,0.13,0.33,10),0xc28b66,x,0.18,z);
      mesh(scene,new THREE.CylinderGeometry(0.018,0.025,0.65,8),0x59795d,x,0.63,z);
      for(let i=0;i<5;i++){
        const angle=i*Math.PI*2/5;
        mesh(scene,new THREE.SphereGeometry(0.21,8,6),0x6e9975,
          x+Math.cos(angle)*0.16,0.75+(i%2)*0.20,z+Math.sin(angle)*0.16);
      }
    }
  }
  HOME_OBJECTS.forEach(renderObject);
  // Architectural decoration does not confer additional collision or interaction truth.
  addBox(2.1,1.2,0.08,0x715f57,-0.55,1.88,-4.68);
  addBox(1.88,1.02,0.09,0x91b9bf,-0.55,1.88,-4.61);
  addBox(0.07,1.02,0.12,0xf2dfbd,-0.55,1.88,-4.53);
  addBox(1.88,0.06,0.12,0xf2dfbd,-0.55,1.88,-4.52);
  const etta=buildEtta();scene.add(etta.root);
  // Separate optical viewpoint: fixed eye height and heading, never spectator orbit.
  // Render to an offscreen target only after an explicit Ask/episode decision.
  const eyeCamera = new THREE.PerspectiveCamera(66, 384 / 216, 0.07, 30);
  const eyeTarget = new THREE.WebGLRenderTarget(384, 216, { depthBuffer: true });
  // Use sRGB target pixels: raw linear RGB encoded as JPEG otherwise looks much too dark.
  eyeTarget.texture.colorSpace = THREE.SRGBColorSpace;
  function captureEye(body: BodyState) {
    eyeCamera.position.set(body.x, 1.98, body.z);
    eyeCamera.lookAt(body.x - Math.sin(body.yaw) * 3, 1.87, body.z - Math.cos(body.yaw) * 3);
    eyeCamera.updateMatrixWorld();
    const previous = renderer.getRenderTarget();
    const priorVisibility = etta.root.visible;
    const bytes = new Uint8Array(384 * 216 * 4);
    try {
      etta.root.visible = false; // Etta's own head must not occlude her view.
      renderer.setRenderTarget(eyeTarget);
      renderer.render(scene, eyeCamera);
      renderer.readRenderTargetPixels(eyeTarget, 0, 0, 384, 216, bytes);
    } finally {
      renderer.setRenderTarget(previous);
      etta.root.visible = priorVisibility;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 384; canvas.height = 216;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Eye image conversion unavailable.');
    const image = context.createImageData(384, 216);
    for (let y = 0; y < 216; y++)
      image.data.set(bytes.subarray((215-y)*384*4, (216-y)*384*4), y*384*4);
    context.putImageData(image, 0, 0);
    const uri = canvas.toDataURL('image/jpeg', 0.67);
    if (!uri.startsWith('data:image/jpeg;base64,')) throw new Error('JPEG capture unavailable.');
    const data = uri.slice('data:image/jpeg;base64,'.length);
    if (data.length > 175_000) throw new Error('Eye image exceeded the safe request limit.');
    return { mimeType: 'image/jpeg' as const, data, width: 384, height: 216 };
  }
  let lastWidth=0,lastHeight=0;
  function resize(){
    const w=Math.max(1,mount.clientWidth),h=Math.max(1,mount.clientHeight);
    if(w===lastWidth && h===lastHeight)return;
    lastWidth=w;lastHeight=h;camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  function update(body:BodyState,elapsed:number,world:WorldState){
    etta.root.position.set(body.x,0,body.z);etta.root.rotation.y=body.yaw;
    etta.animate(elapsed,Math.hypot(body.vx,body.vz));
    lampLight.intensity=world.lampOn?1.65:0;
    if(lampShade){lampShade.emissive.setHex(0xffd69a);lampShade.emissiveIntensity=world.lampOn?0.48:0.02;}
    resize();renderer.render(scene,camera);
  }
  function dispose(){
    scene.traverse(object=>{
      if(object instanceof THREE.Mesh){
        object.geometry.dispose();
        const materials=Array.isArray(object.material)?object.material:[object.material];
        materials.forEach(m=>m.dispose());
      }
    });
    eyeTarget.dispose();renderer.dispose();renderer.domElement.remove();
  }
  return {camera,update,captureEye,dispose};
}
