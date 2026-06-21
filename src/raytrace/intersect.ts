import { vec3Add, vec3DotProduct, vec3Normalize, vec3Scale, vec3Subtract } from '../math/vec3';
import type { Cone, Cube, Cylinder, HitRecord, Plane, SceneObject, Sphere, Vec3 } from '../scene/types';

const EPSILON = 0.001;

function makeHit(
  rayPos: Vec3,
  rayDir: Vec3,
  t: number,
  normal: Vec3,
  object: SceneObject,
): HitRecord {
  const hitPoint = vec3Add(rayPos, vec3Scale(rayDir, t));
  const facing = vec3DotProduct(rayDir, normal);
  const adjustedNormal = facing > 0 ? vec3Scale(normal, -1) : normal;

  return {
    hitPoint,
    normal: vec3Normalize(adjustedNormal),
    t,
    object,
  };
}

export function raySphereIntersect(rayPos: Vec3, rayDir: Vec3, sphere: Sphere): HitRecord | null {
  const offset = vec3Subtract(rayPos, sphere.location);
  const a = vec3DotProduct(rayDir, rayDir);
  const b = 2 * vec3DotProduct(rayDir, offset);
  const c = vec3DotProduct(offset, offset) - sphere.radius * sphere.radius;
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return null;
  }

  const sqrtDisc = Math.sqrt(discriminant);
  let t = (-b - sqrtDisc) / (2 * a);
  if (t < EPSILON) {
    t = (-b + sqrtDisc) / (2 * a);
  }

  if (t < EPSILON) {
    return null;
  }

  const hitPoint = vec3Add(rayPos, vec3Scale(rayDir, t));
  const normal = vec3Scale(vec3Subtract(hitPoint, sphere.location), 1 / sphere.radius);
  return makeHit(rayPos, rayDir, t, normal, sphere);
}

export function rayPlaneIntersect(rayPos: Vec3, rayDir: Vec3, plane: Plane): HitRecord | null {
  if (Math.abs(rayDir[1]) < 1e-9) {
    return null;
  }

  const t = (plane.y - rayPos[1]) / rayDir[1];
  if (t < EPSILON) {
    return null;
  }

  return makeHit(rayPos, rayDir, t, [0, 1, 0], plane);
}

export function rayCubeIntersect(rayPos: Vec3, rayDir: Vec3, cube: Cube): HitRecord | null {
  const half = cube.size / 2;
  const min: Vec3 = [
    cube.location[0] - half,
    cube.location[1] - half,
    cube.location[2] - half,
  ];
  const max: Vec3 = [
    cube.location[0] + half,
    cube.location[1] + half,
    cube.location[2] + half,
  ];

  let tMin = -Infinity;
  let tMax = Infinity;
  let normal: Vec3 = [0, 0, 0];

  const axes: Array<[number, number, 0 | 1 | 2]> = [
    [min[0], max[0], 0],
    [min[1], max[1], 1],
    [min[2], max[2], 2],
  ];

  for (const [minBound, maxBound, axis] of axes) {
    const origin = rayPos[axis];
    const direction = rayDir[axis];

    if (Math.abs(direction) < 1e-9) {
      if (origin < minBound || origin > maxBound) {
        return null;
      }
      continue;
    }

    let t1 = (minBound - origin) / direction;
    let t2 = (maxBound - origin) / direction;
    let n1: Vec3 = [0, 0, 0];
    let n2: Vec3 = [0, 0, 0];
    n1[axis] = -1;
    n2[axis] = 1;

    if (t1 > t2) {
      [t1, t2] = [t2, t1];
      [n1, n2] = [n2, n1];
    }

    if (t1 > tMin) {
      tMin = t1;
      normal = n1;
    }
    if (t2 < tMax) {
      tMax = t2;
    }

    if (tMin > tMax) {
      return null;
    }
  }

  const t = tMin >= EPSILON ? tMin : tMax;
  if (t < EPSILON) {
    return null;
  }

  return makeHit(rayPos, rayDir, t, normal, cube);
}

export function rayCylinderIntersect(rayPos: Vec3, rayDir: Vec3, cylinder: Cylinder): HitRecord | null {
  const halfHeight = cylinder.height / 2;
  const bottomY = cylinder.location[1] - halfHeight;
  const topY = cylinder.location[1] + halfHeight;
  const cx = cylinder.location[0];
  const cz = cylinder.location[2];
  const r = cylinder.radius;

  let best: HitRecord | null = null;

  const ox = rayPos[0] - cx;
  const oz = rayPos[2] - cz;
  const dx = rayDir[0];
  const dz = rayDir[2];
  const a = dx * dx + dz * dz;
  const b = 2 * (ox * dx + oz * dz);
  const c = ox * ox + oz * oz - r * r;
  const discriminant = b * b - 4 * a * c;

  if (discriminant >= 0 && a > 1e-9) {
    const sqrtDisc = Math.sqrt(discriminant);
    const roots = [(-b - sqrtDisc) / (2 * a), (-b + sqrtDisc) / (2 * a)];

    for (const t of roots) {
      if (t < EPSILON) {
        continue;
      }

      const y = rayPos[1] + t * rayDir[1];
      if (y < bottomY - EPSILON || y > topY + EPSILON) {
        continue;
      }

      const hitPoint = vec3Add(rayPos, vec3Scale(rayDir, t));
      const normal: Vec3 = [
        (hitPoint[0] - cx) / r,
        0,
        (hitPoint[2] - cz) / r,
      ];
      const hit = makeHit(rayPos, rayDir, t, normal, cylinder);
      if (!best || hit.t < best.t) {
        best = hit;
      }
    }
  }

  const capNormals: Array<[number, Vec3]> = [
    [bottomY, [0, -1, 0]],
    [topY, [0, 1, 0]],
  ];

  for (const [capY, capNormal] of capNormals) {
    if (Math.abs(rayDir[1]) < 1e-9) {
      continue;
    }

    const t = (capY - rayPos[1]) / rayDir[1];
    if (t < EPSILON) {
      continue;
    }

    const hitPoint = vec3Add(rayPos, vec3Scale(rayDir, t));
    const dxCap = hitPoint[0] - cx;
    const dzCap = hitPoint[2] - cz;
    if (dxCap * dxCap + dzCap * dzCap > r * r + EPSILON) {
      continue;
    }

    const hit = makeHit(rayPos, rayDir, t, capNormal, cylinder);
    if (!best || hit.t < best.t) {
      best = hit;
    }
  }

  return best;
}

export function rayConeIntersect(rayPos: Vec3, rayDir: Vec3, cone: Cone): HitRecord | null {
  const baseY = cone.location[1];
  const apexY = baseY + cone.height;
  const cx = cone.location[0];
  const cz = cone.location[2];
  const r = cone.radius;
  const h = cone.height;
  const k = r / h;

  const ox = rayPos[0] - cx;
  const oy = rayPos[1] - baseY;
  const oz = rayPos[2] - cz;
  const dx = rayDir[0];
  const dy = rayDir[1];
  const dz = rayDir[2];

  const a = dx * dx + dz * dz - k * k * dy * dy;
  const b = 2 * (ox * dx + oz * dz + k * k * (h - oy) * dy);
  const c = ox * ox + oz * oz - k * k * (h - oy) * (h - oy);

  let best: HitRecord | null = null;

  const discriminant = b * b - 4 * a * c;
  if (Math.abs(a) > 1e-9 && discriminant >= 0) {
    const sqrtDisc = Math.sqrt(discriminant);
    const roots = [(-b - sqrtDisc) / (2 * a), (-b + sqrtDisc) / (2 * a)];

    for (const t of roots) {
      if (t < EPSILON) {
        continue;
      }

      const y = rayPos[1] + t * rayDir[1];
      if (y < baseY - EPSILON || y > apexY + EPSILON) {
        continue;
      }

      const hitPoint = vec3Add(rayPos, vec3Scale(rayDir, t));
      const px = hitPoint[0] - cx;
      const py = hitPoint[1] - baseY;
      const pz = hitPoint[2] - cz;
      const normal: Vec3 = [px, k * k * (h - py), pz];
      const hit = makeHit(rayPos, rayDir, t, normal, cone);
      if (!best || hit.t < best.t) {
        best = hit;
      }
    }
  }

  if (Math.abs(rayDir[1]) > 1e-9) {
    const t = (baseY - rayPos[1]) / rayDir[1];
    if (t >= EPSILON) {
      const hitPoint = vec3Add(rayPos, vec3Scale(rayDir, t));
      const dxCap = hitPoint[0] - cx;
      const dzCap = hitPoint[2] - cz;
      if (dxCap * dxCap + dzCap * dzCap <= r * r + EPSILON) {
        const hit = makeHit(rayPos, rayDir, t, [0, -1, 0], cone);
        if (!best || hit.t < best.t) {
          best = hit;
        }
      }
    }
  }

  return best;
}

export function rayObjectIntersect(
  rayPos: Vec3,
  rayDir: Vec3,
  object: SceneObject,
): HitRecord | null {
  switch (object.type) {
    case 'sphere':
      return raySphereIntersect(rayPos, rayDir, object);
    case 'plane':
      return rayPlaneIntersect(rayPos, rayDir, object);
    case 'cube':
      return rayCubeIntersect(rayPos, rayDir, object);
    case 'cylinder':
      return rayCylinderIntersect(rayPos, rayDir, object);
    case 'cone':
      return rayConeIntersect(rayPos, rayDir, object);
  }
}

export function raySceneIntersect(
  rayPos: Vec3,
  rayDir: Vec3,
  objects: SceneObject[],
  maxDistance: number,
): HitRecord | null {
  let nearest: HitRecord | null = null;

  for (const object of objects) {
    const hit = rayObjectIntersect(rayPos, rayDir, object);
    if (hit && hit.t > EPSILON && hit.t < maxDistance && (nearest === null || hit.t < nearest.t)) {
      nearest = hit;
    }
  }

  return nearest;
}