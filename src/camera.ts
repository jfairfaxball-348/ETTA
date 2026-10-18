import * as THREE from 'three';
import type { BodyState } from './simulation';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export class FollowCamera {
  yaw = 0;
  pitch = 0.47;
  distance = 7.4;
  private readonly target = new THREE.Vector3();
  reset(): void { this.yaw = 0; this.pitch = 0.47; this.distance = 7.4; }
  orbit(dx: number, dy: number): void {
    this.yaw -= dx * 0.007;
    this.pitch = clamp(this.pitch + dy * 0.005, 0.18, 1.15);
  }
  zoom(wheelDelta: number): void {
    this.distance = clamp(this.distance + wheelDelta * 0.007, 3.4, 12);
  }
  apply(camera: THREE.PerspectiveCamera, body: BodyState): void {
    this.target.set(body.x, 1.25, body.z);
    const horizontal = Math.cos(this.pitch) * this.distance;
    camera.position.set(
      body.x + Math.sin(this.yaw) * horizontal,
      1.25 + Math.sin(this.pitch) * this.distance,
      body.z + Math.cos(this.yaw) * horizontal
    );
    camera.lookAt(this.target);
  }
}
