/* eslint-disable react/prop-types */
import Consts from "./Consts";

const Styles = {
  appStyle: {
    backgroundColor: "#222222",
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },

  worldStyle: {
    position: "absolute",
    height: Consts.worldH,
    width: Consts.worldW,
    overflow: "hidden",
  },

  dummyStyle: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
  },
};

export default Styles;
