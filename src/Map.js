/* eslint-disable react/prop-types */
import React from "react";
import { View, Image, Text } from "react-native";
import Styles from "./Styles";
import Consts from "./Consts";
import Resources from "./Resources";

const borderColors = [
  "rgb(7,2,2)",
  "rgb(3,3,20)",
  "rgb(6,9,4)",
  "rgb(130,200,240)",
  "rgb(6,2,21)",
  "rgb(0,0,0)",
];

const borderBorderColors = [
  "rgb(140,90,75)",
  "rgb(60,100,125)",
  "rgb(90,130,60)",
  "rgb(38,35,61)",
  "rgb(45,20,85)",
  "rgb(100,100,100)",
];

// NOTES:
// 1. lottie can't be blurred....
// 2. SVGs seem to take lots of resources despite being smaller in size

const messages = [
  "SOMEWHERE VERY VERY DEEP",
  "YELLOW SUBMARINE",
  "A LITTLE PARTY NEVER KILLED NOBODY",
  "SKY IS NOT THE LIMIT",
  "#KickPutinToTheMoon",
  "YOU ARE A GOD OF KICKING",
];

const messagesRus = [
  "ГЛУБОКО ГЛУБОКО ПОД ЗЕМЛЕЙ",
  "ВОДИЧКА ОТЛИЧНАЯ",
  "АКВАДИСКОТЕКА",
  "МНЕ БЫ МНЕ БЫ МНЕ БЫ В НЕБО",
  "НУ ЕЩЁ НЕМНОЖКО",
  "ТЫ БОГ НАБИВАНИЯ",
];

const survivalMessageRus = "ВРЕМЯ НАБИТЬ ЛИЦО";
const survivalMessage = "FACE KICKING TIME";

const k300 = 100;
const k4000 = 5000;

const levelTextHeight = (Consts.worldH * 50) / 2048;
const yellowColor = "rgb(255,225,135)";
const darkYellowColor = "rgb(40,40,0)";

// 10
const nScreens = Resources.borderResources.left.length;

class MyTintedBorder extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    /*  this.borders.map((hIndex) => {
      console.log(
        this.props.index * 10 + (hIndex + 1),
        this.props.relative - 1,
        this.props.relative + 1,
        this.props.index * 10 + hIndex
      );
    });*/
    //console.log(this.props.relative);
    return (
      <View style={Styles.dummyStyle}>
        <View {...this.props}>
          {Resources.borderResources.left.map((res, hIndex) => {
            return this.props.index * nScreens +
              ((this.props.index % 2 == 0 ? hIndex : nScreens - 1 - hIndex) +
                1) <
              this.props.relative || // note: we render 2 extra screens above to avoid flickering
              this.props.relative + 2 <
                this.props.index * nScreens +
                  (this.props.index % 2 == 0
                    ? hIndex
                    : nScreens - 1 - hIndex) ? (
              <View key={this.props.side + "__" + hIndex} />
            ) : (
              <Image
                key={this.props.side + "__" + hIndex}
                style={{
                  position: "absolute",
                  height: 100 / nScreens + "%",
                  width: "100%",
                  left: 0,
                  bottom: hIndex * (100 / nScreens) + "%",
                  tintColor: borderColors[this.props.index],
                }}
                source={
                  Resources.tintedBorderResources[this.props.side][hIndex]
                }
              />
            );
          })}
        </View>
        <View {...this.props}>
          {Resources.borderResources.left.map((res, hIndex) => {
            return this.props.index * nScreens +
              ((this.props.index % 2 == 0 ? hIndex : nScreens - 1 - hIndex) +
                1) <
              this.props.relative || // note: we render 2 extra screens above to avoid flickering
              this.props.relative + 2 <
                this.props.index * nScreens +
                  (this.props.index % 2 == 0
                    ? hIndex
                    : nScreens - 1 - hIndex) ? (
              <View key={this.props.side + "_" + hIndex} />
            ) : (
              <Image
                key={this.props.side + "_" + hIndex}
                style={{
                  position: "absolute",
                  height: 100 / nScreens + "%",
                  width: "100%",
                  left: 0,
                  bottom: (hIndex * 100) / nScreens + "%",
                  tintColor: borderBorderColors[this.props.index],
                }}
                source={Resources.borderResources[this.props.side][hIndex]}
              />
            );
          })}
        </View>
      </View>
    );
  }
}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.scale = (Consts.mapScaleY * (Consts.worldH * nScreens)) / k4000;
    this.ticks = [];
    this.activeMap = 0;
    console.log(Consts.worldH / Consts.worldW);
    // 5 ticks per level
    let ticksPerLevel = Math.floor(nScreens / 2);
    for (let id = 0; id < Resources.mapResources.length; id++) {
      for (let i = 0; i < ticksPerLevel; i++) {
        this.ticks.push({
          h:
            id * (2 * ticksPerLevel) * Consts.worldH +
            (2 * i + (id == 0 && i == 0 ? 0.06 : i == 0 ? 0 : -0.01)) *
              Consts.worldH,
          backgroundColor: borderColors[id],
          borderColor: borderBorderColors[id],
          textColor: id == 3 ? darkYellowColor : yellowColor,
          messageType: i == 0 ? "message" : "height",
          message:
            i == 0 ? id : 2 * (id * ticksPerLevel + i) * 100 - 2000 + "m",
        });
      }
    }
  }

  state = {
    showMapName: true,
    mapNameOpacity: 1,
  };

  /*static getDerivedStateFromProps(props, state) {
    console.log("derived state: ", props, state);
    return null;
  }*/

  /*
  UNSAFE_componentWillReceiveProps(props) {
    return;
    console.log("props:", JSON.stringify(props));
    let newActiveMap = Math.floor(props.ph / Consts.worldH / nScreens);
    if (newActiveMap != this.activeMap) {
      this.activeMap = newActiveMap;
      this.setState({ showMapName: true, mapNameOpacity: 1 });
      this.scheduleCancelMapName();
    }
  }
  */

  showMapName() {
    console.log("show map name called");
    this.setState({ showMapName: true, mapNameOpacity: 1 });
  }

  scheduleCancelMapName() {
    console.log("schedule cancel map name called");
    setTimeout(this.maybeCancelMapName.bind(this), 2000);
    setTimeout(this.decreaseMapNameOpacity.bind(this), 1000);
  }

  decreaseMapNameOpacity() {
    if (!this.state.showMapName) return;
    this.setState({ mapNameOpacity: this.state.mapNameOpacity / 1.4 });
    setTimeout(this.decreaseMapNameOpacity.bind(this), 30);
  }

  maybeCancelMapName() {
    console.log("maybe cancel map name called");
    if (this.state.showMapName) {
      this.setState({ showMapName: false });
    }
  }

  // NOTE: optimization for react not to rerender the component every time!
  shouldComponentUpdate(nextProps /*nextState*/) {
    return nextProps.ph != this.props.ph || this.props.lang != nextProps.lang;
  }

  render() {
    return (
      <View style={Styles.worldStyle}>
        {Resources.mapResources.map((map, index) => {
          return nScreens * Consts.worldH * (index + 1) < this.props.ph ||
            ((nScreens - 1) / 2) * Consts.worldH * index > this.props.ph ? (
            <View key={"map_" + index} />
          ) : (
            <Image
              key={"map_" + index}
              //blurRadius={1}
              style={{
                position: "absolute",
                left: (-(Consts.worldH * 3) / 4 + Consts.worldW) / 2,
                bottom: 0,
                height: 2 * Consts.worldH,
                width: (Consts.worldH * 3) / 4,
                transform: Consts.isWeb
                  ? `translate(0px,${-(
                      Math.floor(-this.props.ph / (nScreens / 2)) +
                      2 * Consts.worldH * index
                    )}px)`
                  : [
                      {
                        translate: [
                          0,
                          -(
                            Math.floor(-this.props.ph / (nScreens / 2)) +
                            2 * Consts.worldH * index
                          ),
                        ],
                      },
                    ],
              }}
              source={map.bg}
            />
          );
        })}
        {this.ticks.map((tick, id) => {
          return tick.h - this.props.ph > Consts.worldH ||
            tick.h - this.props.ph < -Consts.worldH ? (
            <View key={"left_tick_" + id} />
          ) : (
            <View key={"left_tick_" + id} style={Styles.dummyStyle}>
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: Math.floor(-this.props.ph + tick.h),
                  width: "100%",
                  height: 2 * levelTextHeight,
                  backgroundColor: tick.backgroundColor,
                  borderWidth:
                    (levelTextHeight / ((nScreens - 1) / 2)) *
                    Consts.extraMapScaleX,
                  borderColor: tick.borderColor,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize:
                      levelTextHeight *
                      (Consts.worldH / Consts.worldW > 1.8 &&
                      this.props.type != "survival"
                        ? 0.8
                        : 1),
                    fontFamily: this.props.lang == "rus" ? "russo" : "slackey",
                    color: tick.textColor,
                    textAlign: "center",
                    textAlignVertical: "center",
                  }}
                >
                  {tick.messageType == "height"
                    ? tick.message
                    : this.props.lang == "rus"
                    ? this.props.type == "survival"
                      ? survivalMessageRus
                      : messagesRus[tick.message]
                    : this.props.type == "survival"
                    ? survivalMessage
                    : messages[tick.message]}
                </Text>
              </View>
            </View>
          );
        })}
        {Resources.mapResources.map((map, index) => {
          //console.log(index);
          return index + 1 == Consts.nGameLevels ||
            nScreens * Consts.worldH * (index + 1) < this.props.ph ||
            (nScreens - 1) * Consts.worldH * index > this.props.ph ? (
            <View key={"map_" + index} />
          ) : (
            <View key={"map_middleground_" + index} style={Styles.worldStyle}>
              <MyTintedBorder
                index={index}
                side="left"
                relative={this.props.ph / Consts.worldH}
                style={{
                  // NOTE: export from svg using "export as" and use "use artboards"
                  left: -20,
                  bottom: nScreens * index * Consts.worldH,
                  position: "absolute",
                  height: k4000,
                  width: k300,
                  transform: Consts.isWeb
                    ? `translate(${
                        ((this.scale * Consts.extraMapScaleX - 1) * k300) / 2
                      }px,${
                        this.props.ph - ((this.scale - 1) * k4000) / 2
                      }px) scale(${this.scale * Consts.extraMapScaleX}, ${
                        (index % 2 == 0 ? 1 : -1) * this.scale
                      })`
                    : [
                        {
                          translate: [
                            ((this.scale * Consts.extraMapScaleX - 1) * k300) /
                              2,
                            this.props.ph - ((this.scale - 1) * k4000) / 2,
                          ],
                        },
                        {
                          scaleX: this.scale * Consts.extraMapScaleX,
                        },
                        {
                          scaleY: (index % 2 == 0 ? 1 : -1) * this.scale,
                        },
                      ],
                }}
              />
              <MyTintedBorder
                index={index}
                side="right"
                relative={this.props.ph / Consts.worldH}
                style={{
                  // NOTE: export from svg using "export as" and use "use artboards"
                  right: -20,
                  bottom: nScreens * index * Consts.worldH,
                  position: "absolute",
                  height: k4000,
                  width: k300,
                  transform: Consts.isWeb
                    ? `translate(${
                        -((this.scale * Consts.extraMapScaleX - 1) * k300) / 2
                      }px,${
                        this.props.ph - ((this.scale - 1) * k4000) / 2
                      }px) scale(${this.scale * Consts.extraMapScaleX}, ${
                        (index % 2 == 0 ? 1 : -1) * this.scale
                      })`
                    : [
                        {
                          translate: [
                            -((this.scale * Consts.extraMapScaleX - 1) * k300) /
                              2,
                            this.props.ph - ((this.scale - 1) * k4000) / 2,
                          ],
                        },
                        {
                          scaleX: this.scale * Consts.extraMapScaleX,
                        },
                        {
                          scaleY: (index % 2 == 0 ? 1 : -1) * this.scale,
                        },
                      ],
                }}
              />
            </View>
          );
        })}
        <View
          style={{
            // NOTE: export from svg using "export as" and use "use artboards"
            left: 0,
            bottom: 0,
            position: "absolute",
            height: Consts.worldH, //"100%",
            width: Consts.borderWidth,
            backgroundColor: "rgb(100,100,100)",
          }}
        />
        <View
          style={{
            // NOTE: export from svg using "export as" and use "use artboards"
            right: 0,
            bottom: 0,
            position: "absolute",
            height: Consts.worldH, //"100%",
            width: Consts.borderWidth,
            backgroundColor: "rgb(100,100,100)",
          }}
        />
      </View>
    );
  }
}

export default Map;
