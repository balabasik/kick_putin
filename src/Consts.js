/* eslint-disable react/prop-types */
import { Platform, Dimensions } from "react-native";

const ConstsCore = {
  // const is used to determine if compiling for web or for phone.
  isWeb: Platform.OS == "web",
  isAndroid: Platform.OS == "android",

  // App consts
  renderLines: false,
  renderCM: false,
  jumpOnStart: false,

  screenW: Dimensions.get("window").width, // 392.7272   4320/11   // 1080   // 360
  screenH: Dimensions.get("window").height, // 759.2727   8352/11  // 1920   // 640

  // Common consts
  // max aspect ratio 1.95, min 4/3
  worldH: Dimensions.get("window").height,
  /*Math.min(
    Dimensions.get("window").height,
    1.95 * Dimensions.get("window").width
  ),*/
  worldW: Math.min(
    (Dimensions.get("window").height / 4) * 3,
    Dimensions.get("window").width
  ),

  // Geo consts
  dampingFactorFloor: 0.2, //0.1, //0.4,
  dampingFactorWall: 0.1,
  enableFloor: false, // NOTE: will be mutated to true temporarily

  // How often we check the position
  refreshTime: 20,
  // Steps
  stepTime: 30,
  // Collision refresh time is way smaller since collision takes very small time
  collisionRefreshTime: 1, //0.1,

  // Const how fast map is scrolling
  phConst: 1,

  // Map scale
  mapScaleY: 1,

  nGameLevels: 6,

  // larger the value easier is to hit the head
  clickAreaScale: 1.2,
};

var Consts = {
  ...ConstsCore,
  borderWidth:
    (ConstsCore.worldW / ConstsCore.worldH / 3) * 4 * 0.017 * ConstsCore.worldW,
  extraMapScaleX: Math.min(
    1,
    (ConstsCore.worldW / ConstsCore.worldH / (3 / 4)) * 1
  ),
  renderScale: (0.16 * ConstsCore.worldH) / 1000,
  // Geo consts
  constG: 9.8 * 300 * (ConstsCore.worldH / 1000), // pxlRatio
  inertiaCoef: 2 * (ConstsCore.worldH / 1000) * (ConstsCore.worldH / 1000),
  kickV: 1100 * (ConstsCore.worldH / 1000),
  floorH: 0.05 * ConstsCore.worldH,
};

export default Consts;
