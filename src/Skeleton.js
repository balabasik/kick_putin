/* eslint-disable react/prop-types */
import React from "react";
import PropTypes from "prop-types";
import { ParseSvg } from "./Svg";
import Styles from "./Styles";
import { View, Image } from "react-native";
import Consts from "./Consts";
import Resources from "./Resources";
import {
  GetCenter,
  InitGeo,
  GetPoint,
  ToRadians,
  MaxVrotCheck,
  ToDeg,
  GetLeftBottom,
} from "./Geo";

function RenderDefaultNode(params) {
  return (
    <View key={params.key} style={Styles.dummyStyle}>
      <Image style={{ ...params.style }} source={params.src} />
    </View>
  );
}

function RenderHead(params) {
  return (
    <View key={params.key} style={Styles.dummyStyle}>
      <Image
        style={{ ...params.style, opacity: params.bounced ? 1 : 0 }}
        source={params.src[1]}
      />
      <Image
        style={{ ...params.style, opacity: params.bounced ? 0 : 1 }}
        source={params.src[0]}
      />
    </View>
  );
}

// build skeleton
// NOTE: for default nodes we take center of mass as the center of the image
function InitNode(id) {
  return {
    id: id,
    parent: -1,
    sticky: false, // if sticky will move together with parent and no rotation
    pivotParent: { x: 0, y: 0 }, // pivot with respect to the parent (static)
    pivot: { x: 0, y: 0 }, // pivot with respect to this node (static)
    renderLayer: 0, // integer specifying render order, 0 means on top
    renderView: RenderDefaultNode,
    renderSize: { h: 0, w: 0 }, // required when rendering
    geo: InitGeo(),
    src: undefined, // one or more images
  };
}

function OrderNodes(nodes) {
  // we do not look for cycles or anything, this is very simple parser
  // go through nodes, everytime we find a low parent bump its level
  let q = [];
  for (let key in nodes) {
    let node = nodes[key];
    node.parentId = -1;
    node.name = key;
    if (node.children == undefined) node.children = [];
    if (node.pivot != undefined && node.pivot.parent != undefined) {
      if (nodes[node.pivot.parent].children == undefined) {
        nodes[node.pivot.parent].children = [];
      }
      nodes[node.pivot.parent].children.push(key);
    } else {
      q.push(key);
    }
  }
  let ordered = [];
  while (q.length > 0) {
    let next = nodes[q.shift()];
    next.id = ordered.length;
    if (next.pivot != undefined && next.pivot.parent != undefined) {
      next.parentId = nodes[next.pivot.parent].id;
    }
    for (let key of next.children) {
      q.push(key);
    }
    ordered.push(next);
  }

  return ordered;
}

function InitSkeleton(xml, xy, extraScale) {
  let svg = ParseSvg(xml);
  let nodes = svg.nodes;
  //console.log(nodes);
  let skeleton = [];

  // NOTE: as we don't know which order was returned to us, we have to
  // settle on some partial order first, and set parents in accordance to that order
  let ordered = OrderNodes(nodes);
  //console.log(ordered);
  for (let item of ordered) {
    //console.log(item);
    if (item.img == undefined) continue;

    item.skeletonId = skeleton.length;
    let newnode = InitNode(skeleton.length);
    // We do it because we skip some of the nodes
    newnode.parent =
      item.parentId == -1 ? -1 : ordered[item.parentId].skeletonId;
    newnode.renderSize = {
      w: item.img.width * Consts.renderScale * extraScale,
      h: item.img.height * Consts.renderScale * extraScale,
    };
    // NOTE: Y is being counted from top to bottom
    // X is counted from left to right
    // pivot is coordinate with respect to the leftbottom corner of the image
    //console.log(newnode);
    //console.log(item);
    newnode.pivot = {
      x: (item.pivot.xy.x - item.img.xy.x) * Consts.renderScale * extraScale,
      y:
        (item.img.height - item.pivot.xy.y + item.img.xy.y) *
        Consts.renderScale *
        extraScale,
    };
    newnode.sticky = item.pivot.sticky;
    if (newnode.parent != -1) {
      newnode.pivotParent = {
        x:
          (item.pivot.xy.x - ordered[item.parentId].img.xy.x) *
          Consts.renderScale *
          extraScale,
        y:
          (ordered[item.parentId].img.height -
            item.pivot.xy.y +
            ordered[item.parentId].img.xy.y) *
          Consts.renderScale *
          extraScale,
      };
    }
    newnode.renderLayer = item.img.layer;
    newnode.geo.angle = 0;
    newnode.src = Resources.images[item.img.src];

    // hack
    if (item.name == "head") {
      newnode.renderView = RenderHead;
      newnode.src = svg.id == "chicken" ? Resources.chicken : Resources.head;
      newnode.initCorners = svg.corners;
      newnode.initCorners.map((corner) => {
        (corner.x =
          (corner.x - item.pivot.xy.x) * Consts.renderScale * extraScale),
          (corner.y =
            (-corner.y + item.pivot.xy.y) * Consts.renderScale * extraScale);
      });
      // set initial position of the head
      newnode.geo.x = xy.x;
      newnode.geo.y = xy.y;
      // chicken should be lower
      if (svg.id == "chicken") {
        newnode.geo.y -= 30;
      }
    }

    skeleton.push(newnode);
  }

  //console.log(skeleton);
  skeleton.name = svg.id;

  return skeleton;
}

function SetSkeletonXY(skeleton, xy) {
  skeleton[0].geo.x = xy.x;
  skeleton[0].geo.y = xy.y;
  if (skeleton.name == "chicken") {
    skeleton[0].geo.y -= 200 * Consts.renderScale;
  }
  RecomputeSkeleton(skeleton, 0);
}

function RecomputeSkeleton(skeleton, dt) {
  let dtms = dt / 1000;
  // NOTE: head is already recomputed, so we start from node 1
  for (let i = 1; i < skeleton.length; i++) {
    // by the time we reach node i its parent is recomputed already
    // NOTE: the only degree of freedom for non-head nodes is rotation angle
    // and rotation speed?
    let curnode = skeleton[i];
    //console.log("before:", JSON.stringify(curnode.geo));
    let newpivot = GetPoint(skeleton[curnode.parent], curnode.pivotParent);
    curnode.geo.x = newpivot.x;
    curnode.geo.y = newpivot.y;
    if (curnode.sticky) {
      // If node is sticky its angle is equal to the angle of the parent
      curnode.geo.angle = skeleton[curnode.parent].geo.angle;
    } else {
      let curcenter = GetCenter(curnode);
      // compute total torque around pivot
      // NOTE: we don't take into account torque generated by the children on the node
      let mass = 3; // coef that will increase influence of gravity
      let massInert = 5; // coef that will increase momentum coming from parents
      let totalL = Consts.constG * (curcenter.x - curnode.geo.x) * mass;
      //console.log(totalL);
      // we need to go over all the parent nodes and add the centrifugal force
      let nextNode = curnode;
      while (nextNode.parent != -1) {
        nextNode = skeleton[nextNode.parent];
        // distance from center of rotation till the center of the node
        let r = Math.sqrt(
          (nextNode.geo.x - curcenter.x) * (nextNode.geo.x - curcenter.x) +
            (nextNode.geo.y - curcenter.y) * (nextNode.geo.y - curcenter.y)
        );
        let x1 = nextNode.geo.x;
        let y1 = nextNode.geo.y;
        let x2 = curcenter.x;
        let y2 = curcenter.y;
        let x0 = curnode.geo.x;
        let y0 = curnode.geo.y;
        let dist =
          ((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1)) /
          Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + 1); // NOTE: +1 is here to avoid div by 0
        totalL +=
          ToRadians(nextNode.geo.vrot) *
          ToRadians(nextNode.geo.vrot) *
          r *
          dist *
          massInert;
      }
      // NOTE: could be a bit smaller since image is not really a rectangle
      // Steiner theorem
      let cumI =
        Consts.inertiaCoef *
          (curnode.renderSize.w * curnode.renderSize.w +
            curnode.renderSize.h * curnode.renderSize.h) +
        (curnode.renderSize.w / 2 - curnode.pivot.x) *
          (curnode.renderSize.w / 2 - curnode.pivot.x) +
        (curnode.renderSize.h / 2 - curnode.pivot.y) *
          (curnode.renderSize.h / 2 - curnode.pivot.y);
      //console.log(cumI, totalL);
      // this is not really scientific, but to simulate friction...
      let accelerating =
        (totalL > 0 && curnode.geo.vrot > 0) ||
        (totalL < 0 && curnode.geo.vrot < 0);
      const nodesDampingFactor = accelerating ? 0.5 : 1;
      let newvrot = MaxVrotCheck(
        ToDeg(
          ToRadians(curnode.geo.vrot) +
            (nodesDampingFactor * (dtms * totalL)) / cumI
        )
      );
      curnode.geo.angle += (dtms * (curnode.geo.vrot + newvrot)) / 2;
      //console.log(i, curnode.geo.vrot, newvrot, curnode.geo.angle);
      curnode.geo.vrot = newvrot;
      //console.log("after:", JSON.stringify(curnode.geo));
    }
  }
}

function GetNodeStyle(node) {
  let leftBottom = GetLeftBottom(node);
  return {
    //backgroundColor: "black",
    position: "absolute",
    width: node.renderSize.w,
    height: node.renderSize.h,
    left: Math.floor(leftBottom.x),
    bottom: Math.floor(leftBottom.y),
    transform: Consts.isWeb
      ? `rotate(${Math.floor(node.geo.angle)}deg)`
      : [
          { rotate: Math.floor(node.geo.angle) + "deg" }, // note angle is preserved even when calculated from different center
        ], // rotation around center of image
  };
}

class Skeleton extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    bounced: PropTypes.any,
    skeleton: PropTypes.array,
  };

  /*
  UNSAFE_componentWillReceiveProps(props) {
    //console.log("props");
  }
  */

  render() {
    //let now = GetTime();
    //console.log(now - this.latestTime);
    //this.latestTime = now;
    let renderLayers = [];
    if (this.props.skeleton.length > 0) {
      this.props.skeleton.map((node) => {
        let depth = node.renderLayer;
        while (renderLayers.length <= depth) {
          renderLayers.push([]);
        }
        renderLayers[depth].push(
          node.renderView({
            style: GetNodeStyle(node),
            bounced: this.props.bounced,
            src: node.src,
            key: node.id,
          })
        );
      });
      // reverse since 0 render layer is on top
      renderLayers.reverse();
    }
    return (
      <View style={Styles.dummyStyle}>
        {renderLayers.map((layer, index) => {
          return (
            <View key={"layer" + index} style={Styles.dummyStyle}>
              {layer.map((el) => {
                return el;
              })}
            </View>
          );
        })}
      </View>
    );
  }
}

export default Skeleton;
export { InitSkeleton, RecomputeSkeleton, SetSkeletonXY };
