import * as THREE from 'three';
import { ARENA_HALF_SIZE, OBSTACLES, type BodyState } from './simulation';

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
export function createStage(mount: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c202b);
  scene.fog = new THREE.Fog(0x0c202b, 16, 35);
  const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 65);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xcfefff, 0x25434a, 2.5));
  const sun = new THREE.DirectionalLight(0xffe7c6, 2.7);
  sun.position.set(-3, 8, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
  scene.add(sun);
  const ground = mesh(scene, new THREE.PlaneGeometry(ARENA_HALF_SIZE * 2, ARENA_HALF_SIZE * 2), 0x1d414c, 0, -0.015, 0);
  ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  const grid = new THREE.GridHelper(ARENA_HALF_SIZE * 2, 15, 0x4a8991, 0x315762);
  grid.position.y = 0.001; scene.add(grid);
  // Physical block locations derive from the simulation source of truth.
  for (const o of OBSTACLES) {
    const w = o.maxX - o.minX, d = o.maxZ - o.minZ;
    mesh(scene, new THREE.BoxGeometry(w, 1.1, d), 0x778b97, (o.minX + o.maxX) / 2, 0.55, (o.minZ + o.maxZ) / 2);
  }
  for (const a of [-ARENA_HALF_SIZE, ARENA_HALF_SIZE]) {
    mesh(scene, new THREE.BoxGeometry(0.12, 0.22, 15), 0x3d727d, a, 0.09, 0);
    mesh(scene, new THREE.BoxGeometry(15, 0.22, 0.12), 0x3d727d, 0, 0.09, a);
  }
  const etta = buildEtta();
  scene.add(etta.root);
  let lastWidth = 0, lastHeight = 0;
  function resize() {
    const w = Math.max(1, mount.clientWidth), h = Math.max(1, mount.clientHeight);
    if (w === lastWidth && h === lastHeight) return;
    lastWidth = w; lastHeight = h;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  function update(body: BodyState, elapsed: number) {
    etta.root.position.set(body.x, 0, body.z);
    etta.root.rotation.y = body.yaw;
    etta.animate(elapsed, Math.hypot(body.vx, body.vz));
    resize();
    renderer.render(scene, camera);
  }
  function dispose() {
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(m => m.dispose());
      }
    });
    grid.geometry.dispose();
    (grid.material as THREE.Material).dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
  return { camera, update, dispose };
}
