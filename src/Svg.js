/* eslint-disable react/prop-types */
import { XMLParser } from "fast-xml-parser";

function GetTranslateProps(transform) {
  if (transform == undefined || transform == "") return undefined;
  let re = /translate\(([^)]+)\)/;
  let match = transform.match(re);
  if (match.length < 1 || match[1] == "") return undefined;
  let xy = match[1].split(" ");
  if (xy.length < 1) return undefined;
  return { x: parseFloat(xy[0]) || 0, y: parseFloat(xy[1]) || 0 };
}

//{"id":"img_lefthand_layer_2","width":"43","height":"75",
//"transform":"translate(90.08 273.51)","xlink:href":"../native/BSButton/assets/putin_left_hand_00_ps_43_75.png"}}
function ParseImageNode(node, nodes) {
  //console.log(node);
  let info = node.id.split("_");
  //let type = info[0]; // img
  let name = info[1]; // lefthand
  let layer = parseInt(info[3]); // 2 (after layer)
  let width = parseInt(node.width);
  let height = parseInt(node.height);

  // IMPORTANT: WE DO NOT ROTATE IMAGES!!!
  // MAKE SURE THERE ARE NO ROTATION IN SVG!
  // translate(104.41 270.02)
  let xy = GetTranslateProps(node.transform);
  if (xy == undefined) {
    console.log("warning, translate property missing from", node.id);
    xy = { x: 0, y: 0 };
  }
  //console.log(xy);

  //let src =
  //  "../" + node["xlink:href"].substr(node["xlink:href"].indexOf("assets"));
  let src = node["xlink:href"].substr(node["xlink:href"].indexOf("costumes"));
  //console.log(src);
  if (nodes[name] == undefined) nodes[name] = {};
  nodes[name].img = { layer, width, height, src, xy };
}

//<circle id="pivot_lefthand_parent_body" cx="116.13" cy="290.73" r="1.67" fill="#f0f" stroke="#000" stroke-miterlimit="10"/>
function ParsePivotNode(node, nodes) {
  //console.log(node);
  let info = node.id.split("_");
  //let type = info[0]; // pivot
  let name = info[1];
  let sticky = node.id.includes("sticky");
  let parent = info.length > 2 ? info[3] : undefined; // body (after parent)
  let xy = { x: parseFloat(node.cx), y: parseFloat(node.cy) };
  if (nodes[name] == undefined) nodes[name] = {};
  nodes[name].pivot = { xy, parent, sticky };
}

function ParseCorners(str) {
  let ret = [];
  let ar = str.split(" ");

  for (let i = 0; i + 1 < ar.length; i += 2) {
    ret.push({ x: parseFloat(ar[i]), y: parseFloat(ar[i + 1]) });
  }
  return ret;
}

const options = {
  attributeNamePrefix: "",
  ignoreAttributes: false,
  allowBooleanAttributes: true,
};

function ParseSvg(svgXml) {
  const parser = new XMLParser(options);
  let svg = parser.parse(svgXml).svg;
  //console.log(svg);

  // Top level is svg, then we have images and circles.
  //console.log(svg.id);
  let images = svg.image;
  let pivots = svg.circle;
  let nodes = {};

  //console.log(images);
  if (Array.isArray(images)) {
    for (let image of images) {
      ParseImageNode(image, nodes);
    }
  } else {
    ParseImageNode(images, nodes);
  }

  if (Array.isArray(pivots)) {
    for (let pivot of pivots) {
      ParsePivotNode(pivot, nodes);
    }
  } else {
    ParsePivotNode(pivots, nodes);
  }

  let corners = ParseCorners(svg.polygon.points);

  return { id: svg.id, nodes, corners };
}

export { ParseSvg };
