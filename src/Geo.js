/* eslint-disable react/prop-types */
import Consts from "./Consts";

// NOTE: React does not support translate with percent,
// so we have to hack it
function RotateTransform(pivot, angle, dims) {
  // pivot is in %, and center is 50%
  let center = {
    geo: { angle, x: pivot.x, y: pivot.y },
    pivot: { x: pivot.x, y: pivot.y },
  };
  let xy = GetPoint(center, { x: 50, y: 50 });
  xy = { x: xy.x - 50, y: xy.y - 50 };
  return Consts.isWeb
    ? `rotate(${Math.floor(angle)}deg) translate(${xy.x}%, ${xy.y}%)`
    : [
        { rotate: Math.floor(angle) + "deg" },
        { translate: [(xy.x / 100) * dims.x, (xy.y / 100) * dims.y] },
      ];
}

function InitGeo() {
  return {
    x: Consts.worldW / 2, // position of center of mass of the image
    y: Consts.worldH / 4,
    vx: -100,
    vy: 0,
    angle: 0,
    vrot: 0,
  };
}

function CheckPointInside(corners, point) {
  // take a vertical ray through point, and check number of intersections with borders
  let point1 = { x: point.x, y: 0 };
  let numIntersect = 0;
  for (let i = 0; i < corners.length; i++) {
    let border = [
      { x: corners[i].x, y: corners[i].y },
      {
        x: corners[(i + 1) % corners.length].x,
        y: corners[(i + 1) % corners.length].y,
      },
    ];
    let intersect = IntersectLines(
      point.x,
      point.y,
      point1.x,
      point1.y,
      border[0].x,
      border[0].y,
      border[1].x,
      border[1].y
    );
    if (intersect.intersect) numIntersect += 1;
  }
  // exactly one intersection indicates point is inside
  //console.log(numIntersect);
  return numIntersect == 1;
}

function MaxSpeedCheck(v) {
  const maxSpeed = 1000;
  return v > maxSpeed ? maxSpeed : v < -maxSpeed ? -maxSpeed : v;
}

function MaxVrotCheck(v) {
  const maxSpeed = 1000;
  return v > maxSpeed ? maxSpeed : v < -maxSpeed ? -maxSpeed : v;
}

function VectorProduct(rx, ry, sx, sy) {
  return rx * sy - sx * ry;
}

function IntersectLines(px1, py1, px2, py2, qx1, qy1, qx2, qy2) {
  // p
  let rx = px2 - px1;
  let ry = py2 - py1;

  // q
  let sx = qx2 - qx1;
  let sy = qy2 - qy1;

  let vp = VectorProduct(rx, ry, sx, sy);

  // parallel
  if (vp == 0) return { intersect: false };

  // t = (q − p) × s / (r × s)
  let t = VectorProduct(qx1 - px1, qy1 - py1, sx, sy) / vp;

  // u = (q − p) × r / (r × s)
  let u = VectorProduct(qx1 - px1, qy1 - py1, rx, ry) / vp;

  // do not intersect
  if (t < 0 || t > 1 || u < 0 || u > 1) return { intersect: false };

  // intersect
  return { intersect: true, x: px1 + t * rx, y: py1 + t * ry };
}

// NOTE: angle is clockwise rotation!!!
// NOTE: we assume node is recomputed already at this point
function GetLeftBottom(node) {
  let center = GetCenter(node);
  return {
    x: center.x - node.renderSize.w / 2,
    y: center.y - node.renderSize.h / 2,
  };
}

// get point in the node global position at any time
// point is given in static unchanged node
function GetPoint(node, point) {
  let x =
    (point.x - node.pivot.x) * Math.cos(ToRadians(node.geo.angle)) +
    (point.y - node.pivot.y) * Math.sin(ToRadians(node.geo.angle));
  let y =
    -(point.x - node.pivot.x) * Math.sin(ToRadians(node.geo.angle)) +
    (point.y - node.pivot.y) * Math.cos(ToRadians(node.geo.angle));
  return {
    x: node.geo.x + x,
    y: node.geo.y + y,
  };
}

function GetCenter(node) {
  if (node == undefined) return { x: 0, y: 0 };
  return GetPoint(node, { x: node.renderSize.w / 2, y: node.renderSize.h / 2 });
}

function ToRadians(deg) {
  return deg * 0.0174533;
}

function ToDeg(rad) {
  return rad / 0.0174533;
}

function Trymove(geo, dt, noGravity) {
  let newAngle = geo.angle + (dt / 1000) * geo.vrot;
  let newvx = MaxSpeedCheck(geo.vx);
  let newvy = MaxSpeedCheck(
    geo.vy - (noGravity == undefined ? 1 : 0) * (dt / 1000) * Consts.constG
  );

  // NOTE: this is important, as using naive formula results in energy increasing.
  let newx = geo.x + ((dt / 1000) * (geo.vx + newvx)) / 2; // NOTE: dt is in ms
  let newy = geo.y + ((dt / 1000) * (geo.vy + newvy)) / 2;

  //console.log("NEW: " + ((newvy * newvy) / 2 + constG * newy));
  return {
    x: newx,
    y: newy,
    angle: newAngle,
    vx: newvx,
    vy: newvy,
    vrot: geo.vrot,
  };
}

function CheckHit(node) {
  let corners = Corners(node);
  return (
    (Consts.enableFloor && CheckFloorHit(corners)) ||
    CheckCeilingHit(corners) ||
    CheckLeftWallHit(corners) ||
    CheckRightWallHit(corners)
  );
}

function CheckLoss(geo) {
  // NOTE: 0, not the floor height here!
  return geo.y < 0;
}

function Move(node, dt) {
  // if we got to a very small time chunk return the current position without change
  if (dt < Consts.collisionRefreshTime) return node.geo;

  let newgeo = Trymove(node.geo, dt);
  let insideWall = CheckHit(node);
  let willInsideWall = CheckHit({ geo: newgeo, initCorners: node.initCorners });

  if (!insideWall && !willInsideWall) {
    return newgeo;
  }

  // During the collision we use much smaller time frame updates
  let numIter = dt / Consts.collisionRefreshTime;

  newgeo = { ...node.geo };
  for (let i = 0; i < numIter; i++) {
    newgeo = SimmulateCollision(
      {
        geo: newgeo,
        initCorners: node.initCorners,
        renderSize: node.renderSize,
      },
      Consts.collisionRefreshTime
    );
    // if we get out of the wall we proceed in similar manner but with less time
    dt -= Consts.collisionRefreshTime;
    if (!CheckHit({ geo: newgeo, initCorners: node.initCorners })) {
      return Move(
        {
          geo: newgeo,
          initCorners: node.initCorners,
          renderSize: node.renderSize,
        },
        dt
      );
    }
  }
  // If we didn't get out of the wall we return the last position
  return newgeo;
}

function MovingDown(old1, new2) {
  return old1.y > new2.y;
}

function MovingUp(old1, new2) {
  return !MovingDown(old1, new2);
}

function MovingLeft(old1, new2) {
  return old1.x > new2.x;
}

function MovingRight(old1, new2) {
  return !MovingLeft(old1, new2);
}

function SimmulateCollision(node, dt) {
  let kRigidFloor = 100000;
  let kRigidWall = 100000;
  let kFriction = 10;
  let kFrictionRot = 50000;
  let totalFloorF = 0; // init value for pushing out immediately
  let totalCeilingF = 0;
  let totalLeftWallF = 0;
  let totalRightWallF = 0;
  let totalL = 0; // clockwise
  let nodeI = node.renderSize.h * node.renderSize.w * Consts.inertiaCoef;
  let floorFriction = 0;
  let floorRotFriction = 0;

  let corners = Corners(node);
  let newcorners = Corners({
    geo: Trymove(node.geo, dt),
    initCorners: node.initCorners,
  });

  // F = kx // NOTE: try F = k*sqrt(x), since otherwise rotation causes weird bounce
  for (let i = 0; i < corners.length; i++) {
    let corner = corners[i];
    let newcorner = newcorners[i];

    if (Consts.enableFloor && corner.y < Consts.floorH) {
      let damping = MovingDown(corner, newcorner)
        ? 1
        : Consts.dampingFactorFloor;
      totalFloorF += (Consts.floorH - corner.y) * kRigidFloor * damping;
      //let r = Math.abs(geo.x - corner.x) < 1 ? 0 : geo.x - corner.x;
      let r = node.geo.x - corner.x;
      //totalL += -corner.y * r * kRigidFloor * damping;
      totalL +=
        (Consts.floorH - corner.y) *
        (Consts.floorH - corner.y) *
        r *
        kRigidFloor *
        damping;
      floorFriction = kFriction * node.geo.vx;
      floorRotFriction = kFrictionRot * ToRadians(node.geo.vrot);
      //console.log("floor dumping: ", damping);
    }
    if (corner.y > Consts.worldH) {
      let damping = MovingUp(corner, newcorner) ? 1 : Consts.dampingFactorFloor;
      totalCeilingF += (corner.y - Consts.worldH) * kRigidFloor * damping;
      //  let r = Math.abs(geo.x - corner.x) < 1 ? 0 : geo.x - corner.x;
      let r = node.geo.x - corner.x;
      //totalL += (corner.y - worldH) * r * kRigidFloor * damping;
      totalL +=
        (corner.y - Consts.worldH) *
        (corner.y - Consts.worldH) *
        r *
        kRigidFloor *
        damping;
      //console.log("floor dumping: ", damping);
    }
    if (corner.x < Consts.borderWidth) {
      let damping = MovingLeft(corner, newcorner)
        ? 1
        : Consts.dampingFactorWall;
      totalLeftWallF += -(corner.x - Consts.borderWidth) * kRigidWall * damping;
      //let r = Math.abs(geo.y - corner.y) < 1 ? 0 : geo.y - corner.y;
      let r = node.geo.y - corner.y;
      //totalL += -corner.x * r * kRigidWall * damping;
      totalL +=
        (corner.x - Consts.borderWidth) *
        (corner.x - Consts.borderWidth) *
        r *
        kRigidWall *
        damping;
      //console.log("left wall dumping: ", damping);
    }
    if (corner.x > Consts.worldW - Consts.borderWidth) {
      let damping = MovingRight(corner, newcorner)
        ? 1
        : Consts.dampingFactorWall;
      totalRightWallF +=
        (corner.x - (Consts.worldW - Consts.borderWidth)) *
        kRigidWall *
        damping;
      //let r = Math.abs(geo.y - corner.y) < 1 ? 0 : geo.y - corner.y;
      let r = node.geo.y - corner.y;
      //totalL += (corner.x - worldW) * r * kRigidWall * damping;
      totalL +=
        (corner.x - (Consts.worldW - Consts.borderWidth)) *
        (corner.x - (Consts.worldW - Consts.borderWidth)) *
        r *
        kRigidWall *
        damping;
      //console.log("right wall dumping: ", damping);
    }
  }

  // update translational and rotational speed
  // NOTE: dt is in ms so we need to convert to seconds
  let dtms = dt / 1000;
  let newvx =
    node.geo.vx +
    dtms * totalLeftWallF -
    dtms * totalRightWallF -
    dtms * floorFriction;
  let newvy =
    node.geo.vy - dtms * (Consts.constG - totalFloorF + totalCeilingF);
  let newvrot = ToDeg(
    ToRadians(node.geo.vrot) +
      (dtms * totalL) / nodeI -
      (dtms * floorRotFriction) / nodeI
  );
  newvrot = MaxVrotCheck(newvrot);
  newvx = MaxSpeedCheck(newvx);
  newvy = MaxSpeedCheck(newvy);
  //console.log(newvrot, geo.vrot);

  // update angle
  let newAngle = node.geo.angle + dtms * node.geo.vrot;
  let newx = node.geo.x + dtms * node.geo.vx;
  let newy = node.geo.y + dtms * node.geo.vy;
  // NOTE: above approximation works better
  //let newAngle = geo.angle + (dtms * (geo.vrot + newvrot)) / 2;
  //let newx = geo.x + (dtms * (geo.vx + newvx)) / 2;
  //let newy = geo.y + (dtms * (geo.vy + newvy)) / 2;

  let ret = {
    x: newx,
    y: newy,
    angle: newAngle,
    vx: newvx,
    vy: newvy,
    vrot: newvrot,
  };

  //console.log(ret);

  return ret;
}

function MinArgY(ar) {
  let ret = 0;
  let miny = undefined;
  for (let i = 0; i < ar.length; i++) {
    if (miny == undefined || ar[i].y < miny) {
      miny = ar[i].y;
      ret = i;
    }
  }
  return ret;
}

function MaxArgY(ar) {
  let ret = 0;
  let maxy = undefined;
  for (let i = 0; i < ar.length; i++) {
    if (maxy == undefined || ar[i].y > maxy) {
      maxy = ar[i].y;
      ret = i;
    }
  }
  return ret;
}

function MinArgX(ar) {
  let ret = 0;
  let minx = undefined;
  for (let i = 0; i < ar.length; i++) {
    if (minx == undefined || ar[i].x < minx) {
      minx = ar[i].x;
      ret = i;
    }
  }
  return ret;
}

function MaxArgX(ar) {
  let ret = 0;
  let maxx = undefined;
  for (let i = 0; i < ar.length; i++) {
    if (maxx == undefined || ar[i].x > maxx) {
      maxx = ar[i].x;
      ret = i;
    }
  }
  return ret;
}

function Corners(node) {
  let res = [];
  for (let corner of node.initCorners) {
    let x =
      corner.x * Math.cos(ToRadians(node.geo.angle)) +
      corner.y * Math.sin(ToRadians(node.geo.angle));
    //console.log(x);
    let y =
      -corner.x * Math.sin(ToRadians(node.geo.angle)) +
      corner.y * Math.cos(ToRadians(node.geo.angle));
    x += node.geo.x;
    y += node.geo.y;
    res.push({ x, y });
  }
  return res;
}

function CheckFloorHit(corners) {
  let mincorner = MinArgY(corners);
  return corners[mincorner].y < Consts.floorH;
}

function CheckCeilingHit(corners) {
  let maxcorner = MaxArgY(corners);
  return corners[maxcorner].y > Consts.worldH;
}

function CheckLeftWallHit(corners) {
  let mincorner = MinArgX(corners);
  return corners[mincorner].x < Consts.borderWidth;
}

function CheckRightWallHit(corners) {
  let maxcorner = MaxArgX(corners);
  return corners[maxcorner].x > Consts.worldW - Consts.borderWidth;
}

export {
  GetLeftBottom,
  Move,
  Trymove,
  CheckLoss,
  GetCenter,
  GetPoint,
  Corners,
  CheckPointInside,
  InitGeo,
  ToRadians,
  ToDeg,
  MaxVrotCheck,
  RotateTransform,
};
