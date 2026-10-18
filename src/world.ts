/** S004 HOME: the simulation owns room geometry and interactable state; graphics are projections. */
export interface Bounds { minX: number; maxX: number; minZ: number; maxZ: number }
export type ObjectKind = 'floor' | 'wall' | 'threshold' | 'bed' | 'table' | 'chair' | 'cabinet' | 'lamp' | 'rug' | 'plant';
export interface WorldObject {
  readonly id: string; readonly label: string; readonly kind: ObjectKind;
  readonly bounds: Readonly<Bounds>; readonly height: number;
  readonly solid: boolean; readonly detail: string;
}
export interface WorldState { readonly objects: readonly WorldObject[]; lampOn: boolean }
export const LIMITS = Object.freeze({ minX: -5.8, maxX: 5.8, minZ: -5.05, maxZ: 7.1 });
export const DOORWAY = Object.freeze({ minX: -1.25, maxX: 1.25, z: 4.95 });
const make = (id: string, label: string, kind: ObjectKind, a: number, b: number, c: number, d: number,
  height: number, solid: boolean, detail: string): WorldObject =>
  Object.freeze({ id, label, kind, bounds: Object.freeze({ minX:a, maxX:b, minZ:c, maxZ:d }), height, solid, detail });
export const HOME_OBJECTS: readonly WorldObject[] = Object.freeze([
  make('floor', 'Oak floor', 'floor', -5.8,5.8,-5,5,0.10,false,'Warm wooden flooring'),
  make('porch', 'Entrance path', 'floor', -1.5,1.5,5,7.1,0.09,false,'A step outside the front door'),
  make('north-wall', 'Back wall', 'wall', -5.8,5.8,-5.05,-4.82,2.8,true,'Solid room boundary'),
  make('west-wall', 'Left wall', 'wall', -5.8,-5.57,-5.05,5.05,1.8,true,'Solid room boundary'),
  make('east-wall', 'Right wall', 'wall', 5.57,5.8,-5.05,5.05,1.8,true,'Solid room boundary'),
  make('south-west-wall', 'Front wall · left', 'wall', -5.8,-1.25,4.83,5.05,1.2,true,'Solid wall beside the entrance'),
  make('south-east-wall', 'Front wall · right', 'wall', 1.25,5.8,4.83,5.05,1.2,true,'Solid wall beside the entrance'),
  make('doorway', 'Open front door', 'threshold', -1.25,1.25,4.84,5.07,0.03,false,'You can walk outside and back in'),
  make('bed', 'Etta’s bed', 'bed', -4.85,-2.5,-3.85,-1.1,0.62,true,'A place to rest — not yet interactive'),
  make('table', 'Writing table', 'table', 2.05,4.68,-3.8,-2.45,0.82,true,'A wooden table'),
  make('chair', 'Desk chair', 'chair', 2.62,3.45,-1.95,-1.06,0.98,true,'A chair by the writing table'),
  make('cabinet', 'Low cabinet', 'cabinet', -5.03,-4.25,0.7,2.35,1.15,true,'A little cupboard'),
  make('lamp', 'Standing lamp', 'lamp', -1.55,-1.07,2.25,2.73,1.96,true,'Press E or use the button to toggle the light'),
  make('rug', 'Woven rug', 'rug', -1.7,1.62,-2.3,0.55,0.015,false,'A soft rug'),
  make('plant', 'Houseplant', 'plant', 4.42,4.95,2.4,2.95,1.25,true,'A leafy indoor plant')
]);
export const INTERACTION_RANGE = 1.65;
export function createWorld(): WorldState { return { objects: HOME_OBJECTS, lampOn: true }; }
export function resetWorld(world: WorldState): void { world.lampOn = true; }
export function distanceToObject(x: number, z: number, object: WorldObject): number {
  const b = object.bounds;
  return Math.hypot(Math.max(b.minX-x,0,x-b.maxX), Math.max(b.minZ-z,0,z-b.maxZ));
}
export function nearbyObject(world: WorldState, x: number, z: number, maxDistance = 2.15):
  { object: WorldObject; distance: number } | null {
  const options = world.objects.filter(o => !['floor','wall','threshold','rug'].includes(o.kind))
    .map(object => ({object, distance:distanceToObject(x,z,object)}))
    .filter(item=>item.distance <= maxDistance)
    .sort((a,b)=>a.distance-b.distance || a.object.id.localeCompare(b.object.id));
  return options[0] || null;
}
/** All actions remain manual in S004. Etta cannot infer, trigger or invent an action. */
export function interact(world: WorldState, x: number, z: number, id: string): boolean {
  const target = world.objects.find(o => o.id === id);
  if (!target || target.kind !== 'lamp' || distanceToObject(x,z,target) > INTERACTION_RANGE) return false;
  world.lampOn = !world.lampOn;
  return true;
}
