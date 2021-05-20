/* eslint-disable react/prop-types,react/no-direct-mutation-state*/
import React from "react";
import { Platform, View, Text, Image } from "react-native";
import Styles from "./Styles";
import Consts from "./Consts";
import Resources from "./Resources";
import Skeleton, { InitSkeleton, RecomputeSkeleton } from "./Skeleton";
import Spinner from "./Spinner";
import FetchFonts from "./Fonts";
import { ToRadians } from "./Geo";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

// Lottie cannot be blurred.....
//import LottieView from "lottie-react-native";
//import { BlurView } from "@react-native-community/blur";

// NOTE: DO NOT put non-state vars into props!!!! cause it leads to more refreshes than needed!!

const B = (props) => (
  <Text style={{ fontWeight: "bold" }}>{props.children}</Text>
);
const aboutTextRus = (
  <Text>
    <B>Н</B>
    {`е каждый может найти время для ведения\n`}
    <B>a</B>
    {`ктивного образа жизни. Эта игра поможет\n`}
    <B>в</B>
    {`ам не выходя из дома приобрести отменные\n`}
    <B>а</B>
    {`тлетические навыки, путем методического\n`}
    <B>л</B>
    {`ице-набивания. Только самые отважные воз\n`}
    <B>ь</B>
    {`мут верх и смогут стать настоящими звезд\n`}
    <B>н</B>
    {`ыми пиратами. Но даже с космической высот\n`}
    <B>ы</B>
    {` не забывайте: ходите в библиотеку, помога\n`}
    <B>й</B>
    {`те ближним, и ешьте йогурты по утрам.\n\n`}
    <B>У</B>
    {`спехов.               Делитесь спортом с друзьями.\n`}
    <B>Р</B>
    {`адости.                   Заходите на buzzuzu.com.\n`}
    <B>А</B>
    {`зарта.                      Все права не защищены.`}
  </Text>
);

const aboutText = (
  <Text>
    <B>N</B>
    {`ot everyone can find time and space for an\n`}
    <B>a</B>
    {`ctive lifestyle. This game will help you to greatly\n`}
    <B>v</B>
    {`amp up your athletic form without having to ever le\n`}
    <B>a</B>
    {`ve the house, by magic means of methodologica\n`}
    <B>l</B>
    {` face kicking. Only the bravest will get to the top a\n`}
    <B>n</B>
    {`d become true space pirates. But even with stars in\n`}
    <B>y</B>
    {`our hands remember to visit library and help elders.\n\n`}
    <B>H</B>
    {`onor.\n`}
    <B>E</B>
    {`xcitement.                         Share sports with friends.\n`}
    <B>R</B>
    {`espect.                                    Visit buzzuzu.com.\n`}
    <B>O</B>
    {`vation.                                     All rights reversed.`}
  </Text>
);

class Langs extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={this.props.style}>
        <Lang
          style={{
            position: "absolute",
            left: "-60%",
            top: this.props.lang == "rus" ? "50%" : 0,
            height: "50%",
            width: "200%",
          }}
          onClick={() =>
            this.props.onClick(this.props.lang == "rus" ? "eng" : "rus")
          }
          lang={this.props.lang == "rus" ? "eng" : "rus"}
          active={false}
        />
        <Lang
          style={{
            position: "absolute",
            left: "-60%",
            top: this.props.lang == "rus" ? 0 : "50%",
            height: "50%",
            width: "200%",
          }}
          onClick={() => this.props.onClick(this.props.lang)}
          lang={this.props.lang}
          active={true}
        />
      </View>
    );
  }
}

class Lang extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View
        style={{
          ...this.props.style,
          transform: this.props.active
            ? Consts.isWeb
              ? "scale(1.2)"
              : [{ scale: 1.2 }]
            : undefined,
          borderRadius: (8 * Consts.worldH) / 1000,
          overflow: "hidden",
          opacity: this.props.active ? 1 : 0.8,
        }}
        onTouchStart={this.props.onClick}
        onClick={this.props.onClick}
      >
        <Image
          style={{
            position: "absolute",
            height: "100%",
            top: 0,
            width: "70%",
            right: 0,
          }}
          source={
            this.props.lang == "rus"
              ? Resources.menu.rusFlag
              : Resources.menu.engFlag
          }
        />
        <View
          style={{
            ...Styles.dummyStyle,
            borderWidth: ((this.props.active ? 4 : 4.5) * Consts.worldH) / 1000,
            borderColor: "rgba(80,60,30,1)",
            borderRadius: (8 * Consts.worldH) / 1000,
            overflow: "hidden",
          }}
        />
      </View>
    );
  }
}

const costumeFonts = {
  tuxedo: 25,
  karate: 25,
  dancer: 25,
  hockey: 32,
  pioner: 27,
  orange: 23,
  kgb: 35,
  babushka: 27,
  bear: 23,
  chicken: 27,
};
const costumeFontsRus = {
  tuxedo: 19,
  karate: 19,
  dancer: 20,
  hockey: 24,
  pioner: 23,
  orange: 19,
  kgb: 21,
  babushka: 23,
  bear: 20,
  chicken: 23,
};

const costumeNames = {
  tuxedo: `Trump Ties`,
  karate: "Karate Kid",
  dancer: "Tooth Fairy",
  hockey: "Goon",
  pioner: "Vovochka",
  orange: "Orange is\nthe new Red",
  kgb: "KGB",
  babushka: "Babushka",
  bear: `Masha and\nthe Bear`,
  chicken: `Chicken`,
};

const costumeNamesRus = {
  tuxedo: `Трамп Стайл`,
  karate: "Малыш Каратист",
  dancer: "Зубная Фея",
  hockey: "Вышибала",
  pioner: `Вовочка`,
  orange: `Оранжевое\nНастроение`,
  kgb: `Руссо\nШпионо`,
  babushka: "Бабулька",
  bear: `Маша\nи Медведь`,
  chicken: "Курица",
};

class Rockets extends React.Component {
  constructor(props) {
    super(props);
    this.active = this.props.active;
  }

  UNSAFE_componentWillReceiveProps(props) {
    //console.log("got props");
    if (this.active != props.active) {
      this.active = props.active;
      if (props.active) {
        this.resume();
      } else {
        this.pause();
      }
    }
  }

  /*static getDerivedStateFromProps(props, state) {
    console.log("derived state: ", props, state);
    return null;
  }*/

  componentDidUpdate() {
    //console.log("component did update");
  }

  componentWillUnmount() {}

  componentDidMount() {
    this.lastUpdate = GetTime();
    this.update();
  }

  pause() {
    console.log("pausing rockets");
    if (this.updateTimeout != undefined) {
      // NOTE: timeouts are not being cleared sometimes!!!
      //console.log(this.updateTimeout);
      clearTimeout(this.updateTimeout);
      //console.log(this.updateTimeout);
      this.updateTimeout = undefined;
    }
  }

  resume() {
    console.log("resuming rockets");
    this.lastUpdate = GetTime();
    this.update();
  }

  state = {
    rocket: {
      x:
        (((Consts.worldW / Consts.worldH) * 2048) / 2 - 447 / 2) / 2 -
        100 / 2 +
        1536 / 2 -
        ((Consts.worldW / Consts.worldH) * 2048) / 2,
      y: 0,
    }, // x: is half distance between left side and button (447*142)
    aliens: {
      x:
        (Consts.worldW / Consts.worldH) * 2048 -
        (((Consts.worldW / Consts.worldH) * 2048) / 2 - 447 / 2) / 2 -
        130 / 2 +
        1536 / 2 -
        ((Consts.worldW / Consts.worldH) * 2048) / 2,
      y: 4000,
      rot: 30,
    }, // x: is half distance between right side and button
    antenna: { rot: 0 },
  };

  update() {
    //console.log("update");
    // NOTE: Timeouts are not clearing for some reason in web.. so have this check manually
    if (!this.active) {
      return;
    }
    //console.log("update");
    let now = GetTime();
    let delta = now - this.lastUpdate;
    this.setState({
      rocket: {
        x: this.state.rocket.x,
        y: this.state.rocket.y > 2500 ? 0 : this.state.rocket.y + 0.2 * delta,
      },
      aliens: {
        x: this.state.aliens.x,
        y: this.state.aliens.y < 500 ? 4000 : this.state.aliens.y - 0.2 * delta,
        rot: 20 * Math.sin(2 * 3.1415 * now * 0.0002),
      },
      antenna: { rot: 60 * Math.sin(2 * 3.1415 * now * 0.0001) },
    });
    this.lastUpdate = now;
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    this.updateTimeout = setTimeout(() => this.update(), Consts.refreshTime);
  }

  render() {
    //  let now = GetTime();
    //console.log(now - this.latestTime);
    //this.latestTime = now;
    //console.log(this.state.rocket.x);
    let antennaX = 25 * Math.sin(ToRadians(this.state.antenna.rot));
    let antennaY = 25 - 25 * Math.cos(ToRadians(this.state.antenna.rot));
    return (
      <View
        style={{
          left: 0,
          top: 0,
          position: "absolute",
          height: 2048,
          width: 1536,
        }}
      >
        <Image
          style={{
            left: 0,
            top: 0,
            position: "absolute",
            height: 100,
            width: 100,
            opacity: 0.7,
            transform: Consts.isWeb
              ? `translate(${Math.floor(this.state.rocket.x)}px, ${Math.floor(
                  2048 - this.state.rocket.y
                )}px)`
              : [
                  {
                    translate: [
                      Math.floor(this.state.rocket.x),
                      Math.floor(2048 - this.state.rocket.y),
                    ],
                  },
                ],
          }}
          blurRadius={Platform.OS == "ios" ? 4 : 2}
          source={Resources.menu.rocket}
        />
        <Image
          style={{
            left: 0,
            top: 0,
            position: "absolute",
            height: 130,
            width: 130,
            opacity: 0.7,
            transform: Consts.isWeb
              ? `translate(${Math.floor(this.state.aliens.x)}px,${Math.floor(
                  2048 - this.state.aliens.y
                )}px) rotate(${Math.floor(this.state.aliens.rot)}deg)`
              : [
                  {
                    translate: [
                      Math.floor(this.state.aliens.x),
                      Math.floor(2048 - this.state.aliens.y),
                    ],
                  },
                  { rotate: "" + Math.floor(this.state.aliens.rot) + "deg" },
                ],
          }}
          blurRadius={Platform.OS == "ios" ? 4 : 2}
          source={Resources.menu.aliens}
        />
        <Image
          style={{
            left: 1100,
            top: 1300 - 1,
            position: "absolute",
            height: 200,
            width: 200,
            opacity: 1,
            transform: Consts.isWeb
              ? `translate(${Math.floor(antennaX)}px, ${Math.floor(
                  antennaY
                )}px) rotate(${Math.floor(this.state.antenna.rot)}deg)`
              : [
                  {
                    translate: [Math.floor(antennaX), Math.floor(antennaY)],
                  },
                  { rotate: "" + Math.floor(this.state.antenna.rot) + "deg" },
                ],
          }}
          source={Resources.menu.antennaHigh}
        />
        <Image
          style={{
            left: 1100,
            top: 1300,
            position: "absolute",
            height: 200,
            width: 200,
            opacity: 1,
          }}
          source={Resources.menu.antennaLow}
        />
      </View>
    );
  }
}

class MyImageButton extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  resetAnimation = () => {
    this.animation.reset();
    this.animation.play();
  };

  render() {
    let height = (Consts.worldH / 2048) * 142; // 447*142
    let width = (Consts.worldH / 2048) * 447;
    let buttonStyle = {
      position: "absolute",
      height: "100%",
      width: "100%",
    };
    return (
      <View
        style={{
          ...this.props.style,
          position: "absolute",
          width: width,
          height: height,
          marginLeft: -width / 2,
          marginTop: -height / 2,
        }}
      >
        <Image
          style={buttonStyle}
          resizeMode="contain"
          source={Resources.menu.buttons[this.props.id]}
          onTouchStart={this.props.active ? this.props.onClick : () => {}}
          onClick={this.props.active ? this.props.onClick : () => {}}
        />
        {this.props.active ? (
          <View />
        ) : (
          <Image
            style={{ ...buttonStyle, tintColor: "grey", opacity: 0.6 }}
            resizeMode="contain"
            source={Resources.menu.buttons[this.props.id]}
          />
        )}
      </View>
    );
  }
}

function GetTime() {
  return new Date().getTime();
}

const unitW = (Consts.worldH / 640) * 120; // width of the face
const unitH = (Consts.worldH / 640) * 130; // height of the face

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.wheelClicks = 0;
    this.chickenActivated = false;
    this.propsTop = this.props.top;
    this.active = this.propsTop == "menu";
    this.now = GetTime();

    this.hihatsoundfirstplay = true;
    Audio.Sound.createAsync(Resources.hihatSound).then((sound) => {
      this.hihatSound = sound;
      this.hihatSound.sound.setVolumeAsync(0.8);
    });

    Audio.Sound.createAsync(Resources.menuSound, { isLooping: true }).then(
      (sound) => {
        this.menuSound = sound;
        this.menuSound.sound.setVolumeAsync(0.35);
      }
    );

    this.deselectedTime = this.now;
    this.skeletons = [];
    this.faces = [];
    let nFaces = Resources.svgs.length;
    this.spinning = false;
    this.spinningSpeed = 0;
    this.totalW = nFaces * unitW;
    for (let i = 0; i < nFaces; i++) {
      let xy = { x: unitW / 2, y: unitH / 2 + 5 };
      let skeleton = InitSkeleton(
        Resources.svgs[i],
        xy,
        (0.8 * 1000) / Consts.worldH
      );
      RecomputeSkeleton(skeleton, 0);
      this.skeletons.push(skeleton);
    }
    this.activeId = this.chickenActivated ? 0 : 1;
  }

  UNSAFE_componentWillReceiveProps(props) {
    //console.log("props: ", props);
    if (props.top != this.propsTop) {
      this.propsTop = props.top;
      if (props.top != "menu") {
        this.pause();
      } else {
        this.resume();
      }
    }
  }

  startMenuSound() {
    if (this.menuSound != undefined) {
      this.menuSound.sound.setPositionAsync(0);
      this.menuSound.sound.playAsync();
    } else {
      setTimeout(this.startMenuSound.bind(this), 100);
    }
  }

  stopMenuSound() {
    if (this.menuSound != undefined) this.menuSound.sound.stopAsync();
    else {
      setTimeout(this.stopMenuSound.bind(this), 100);
    }
  }

  componentDidMount() {
    FetchFonts(() => {
      console.log("fonts loaded.");
      this.setState({ fontsLoaded: true });
    });
    if (this.propsTop == "menu") {
      this.resume();
    }
  }

  state = {
    faceSelected: false,
    fontsLoaded: false,
    faces: [],
    active: false,
    gameScore: 0,
    wheelAngle: 0,
    bigFace: <View />,
    showAbout: false,
  };

  executeFeedback() {
    if (this.hihatSound != undefined) {
      this.hihatSound.sound.replayAsync();
      // NOTE: for some reason the first playback fails with "isPlaying=true"...
      if (this.hihatsoundfirstplay) {
        this.hihatsoundfirstplay = false;
        this.hihatSound.sound.replayAsync();
      }
    }
    if (!Consts.isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  onFaceClick(index) {
    console.log("click");
    let now = GetTime();
    if (
      index == this.activeId &&
      !this.spinning &&
      Math.abs(now - this.deselectedTime) > 500
    ) {
      console.log("face selected", index);
      this.executeFeedback();
      this.setFaces(true);
    }
  }

  setFaces(faceSelected) {
    let faces = [];
    let isSelected = (index) => {
      return faceSelected && index == this.activeId;
    };
    this.skeletons.map((skeleton, index) => {
      if (!this.chickenActivated && index == 0) {
        return;
      }

      let scale = 1;
      let translate = [0, 0];
      if (isSelected(index)) {
        //console.log("selected");
        scale = 2;
        translate = [0, Math.floor(-unitH / 4)];
        //console.log(translate);
      }
      faces.push(
        <View
          style={{
            ...Styles.dummyStyle,
            transform: Consts.isWeb
              ? `scale(${scale}) translate(${translate[0]}px, ${translate[1]}px)`
              : [
                  {
                    scale,
                  },
                  { translate },
                ],
          }}
        >
          <View
            style={{
              position: "absolute",
              width: isSelected(index) ? "70%" : "94%",
              height: "100%",
              left: isSelected(index) ? "15%" : "3%",
              top: 0,
              backgroundColor: "rgba(188, 188, 188, 1)",
              borderRadius: (10 * Consts.worldH) / 1000,
              borderWidth: (3 * Consts.worldH) / 1000,
              borderColor: isSelected(index)
                ? "rgba(60, 60, 60,1)"
                : "rgba(20, 10, 5,0.8)",
              shadowOffset: { width: 2, height: 2 },
              shadowColor: isSelected(index)
                ? "rgba(80, 60, 30,0)"
                : "rgba(80, 60, 30,0.5)",
              shadowRadius: 2,
              overflow: "hidden",
            }}
          />
          <View
            style={{
              ...Styles.dummyStyle,
              top: isSelected(index) ? "15%" : "0%",
              transform: Consts.isWeb
                ? `scale(${
                    (Consts.worldH / 1050) * (isSelected(index) ? 0.8 : 1.2)
                  })`
                : [
                    {
                      scale:
                        (Consts.worldH / 1050) *
                        (isSelected(index) ? 0.8 : 1.2),
                    },
                  ],
            }}
            onClick={this.onFaceClick.bind(this, index)}
            onTouchEnd={this.onFaceClick.bind(this, index)}
          >
            <Skeleton skeleton={skeleton} />
          </View>
          {isSelected(index) ? (
            <View style={Styles.dummyStyle}>
              <View
                style={{
                  width: "63%",
                  height: "24%",
                  position: "absolute",
                  left: "18.5%",
                  top: "3.1%",
                  backgroundColor: "rgb(100,100,100)",
                  borderRadius: (8 * Consts.worldH) / 1000, // NOTE: border radius doesnt work on text in ios>
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize:
                      (this.props.lang == "rus"
                        ? costumeFontsRus[skeleton.name]
                        : costumeFonts[skeleton.name]) *
                      (Consts.worldH / 1200),
                    color: "rgb(250, 220, 140)",
                    textAlign: "center",
                    textAlignVertical: "center",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: this.props.lang == "rus" ? "russo" : "denkone",
                  }}
                >
                  {this.props.lang == "rus"
                    ? costumeNamesRus[skeleton.name]
                    : costumeNames[skeleton.name]}
                </Text>
              </View>
              {
                <View
                  style={{
                    position: "absolute",
                    height: (3 * Consts.worldH) / 1000,
                    width: "70%",
                    left: "15%",
                    top: "29%",
                    backgroundColor: "rgba(60, 60, 60,1)",
                  }}
                />
              }
            </View>
          ) : (
            <View />
          )}
        </View>
      );
    });
    this.setState({ faces, faceSelected });
  }

  moveWrapper() {
    // NOTE: timeout is not being cleared well in react native, so have this manual check
    //console.log("here");
    if (!this.state.active) {
      return;
    }
    let now = GetTime();
    let delta = now - this.now;
    this.now = now;

    // uncomment to allow costume moving in MENU
    /*
    if (false) {
      //this.state.faceSelected) {
      //}!this.spinning && this.activeId != -1) {
      RecomputeSkeleton(this.skeletons[this.activeId], delta);
      this.setFaces(this.state.faceSelected);
    }
    */

    this.setState({
      wheelAngle: this.state.wheelAngle + delta * this.spinningSpeed * 0.0004,
    });
    this.updateTimeout = setTimeout(
      this.moveWrapper.bind(this),
      Consts.stepTime
    );
  }

  handleSoundsClick() {
    let str = this.props.sounds ? "off" : "on";
    this.props.onGameMessage("menu_setsound_" + str);
  }

  onClick(id) {
    console.log("clicked", id);
    if (id == "about") {
      this.setState({ showAbout: true });
    } else {
      this.props.onGameMessage("menu_" + id);
    }
  }

  onActiveChange(activeId) {
    if (!this.chickenActivated) activeId += 1;
    this.activeId = activeId;
    this.props.onActiveIdChange(activeId);
  }

  onSpinSpeedChange(speed) {
    this.spinning = Math.abs(speed) > 100;
    this.spinningSpeed = speed;
  }

  onSpinPositionChange(pos) {
    let delta = unitW / 5;
    if (this.spinpos == undefined || Math.abs(this.spinpos - pos) > delta) {
      this.executeFeedback();
      this.spinpos = pos;
    }
  }

  pause() {
    console.log("pausing");
    this.stopMenuSound();
    // this.state= false;
    this.setState({ active: false });
    if (this.updateTimeout != undefined) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = undefined;
    }
  }

  resume() {
    console.log("resuming");
    this.startMenuSound();
    // NOTE: state takes some time to laod, and movewrapper doesn't get it!
    this.state.active = true;
    this.now = GetTime();
    this.moveWrapper();
    this.setFaces(this.state.faceSelected);
  }

  maybeDeselectFace() {
    // NOTE: this is used also to remove the ABOUT view
    if (this.state.faceSelected) {
      this.executeFeedback();
      this.setFaces(false);
      this.deselectedTime = GetTime();
    }
    if (this.state.showAbout) {
      this.setState({ showAbout: false });
    }
  }

  handleWheelClick() {
    this.wheelClicks += 1;
    if (this.wheelClicks >= 3 && !this.chickenActivated) {
      this.chickenActivated = true;
      this.activeId -= 1;
      this.props.onActiveIdChange(this.activeId);
      this.setFaces(false);
    }
  }

  render() {
    //let now = GetTime();
    //console.log(now - this.latestTime);
    //this.latestTime = now;
    return (
      <View style={Styles.appStyle}>
        {!this.state.fontsLoaded ? (
          <View
            style={{
              ...Styles.worldStyle,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                width: Consts.worldH * 0.04,
                height: Consts.worldH * 0.1,
                borderRadius: (5 * Consts.worldH) / 1000,
                backgroundColor: "rgb(100,100,100)",
              }}
            />
            <View
              style={{
                position: "absolute",
                width: Consts.worldH * 0.1,
                height: Consts.worldH * 0.04,
                borderRadius: (5 * Consts.worldH) / 1000,
                backgroundColor: "rgb(100,100,100)",
              }}
            />
          </View>
        ) : (
          <View
            style={Styles.worldStyle}
            onClick={this.maybeDeselectFace.bind(this)}
            onTouchStart={this.maybeDeselectFace.bind(this)}
          >
            <View style={Styles.dummyStyle}>
              <View
                style={{
                  ...Styles.dummyStyle,
                  transform: Consts.isWeb
                    ? `scale(${Consts.worldH / 2048}) translate(${Math.floor(
                        ((-1 + Consts.worldH / 2048) * 1536) / 2 +
                          (Consts.worldW - (Consts.worldH / 2048) * 1536) / 2
                      )}px,
                                      ${Math.floor(
                                        ((-1 + Consts.worldH / 2048) * 2048) / 2
                                      )}px)`
                    : [
                        // NOTE: This does not work for web....
                        { scale: Consts.worldH / 2048 },
                        {
                          translate: [
                            ((-1 + Consts.worldH / 2048) * 1536) / 2 +
                              (Consts.worldW - (Consts.worldH / 2048) * 1536) /
                                2,
                            ((-1 + Consts.worldH / 2048) * 2048) / 2,
                          ],
                        },
                      ],
                }}
              >
                <Image
                  style={{
                    left: 0,
                    top: 0,
                    position: "absolute",
                    height: 2048,
                    width: 1536,
                  }}
                  source={Resources.menu.sky}
                />
                <Rockets active={this.state.active} />
                <Image
                  style={{
                    left: 0,
                    top: 0,
                    position: "absolute",
                    height: 2048,
                    width: 1536,
                  }}
                  source={
                    this.props.lang == "rus"
                      ? Resources.menu.titleTopRus
                      : Resources.menu.titleTop
                  }
                />
                <Image
                  style={{
                    left: 0,
                    top: 0,
                    position: "absolute",
                    height: 2048,
                    width: 1536,
                  }}
                  source={
                    this.props.lang == "rus"
                      ? Resources.menu.titleBottomRus
                      : Resources.menu.titleBottom
                  }
                />
                <Image
                  style={{
                    left: 0,
                    top: 0,
                    position: "absolute",
                    height: 2048,
                    width: 1536,
                  }}
                  source={Resources.menu.ground}
                />
                <Image
                  style={{
                    left: 0,
                    top: 0,
                    position: "absolute",
                    height: 2048,
                    width: 1536,
                  }}
                  source={Resources.menu.bunker}
                />
                <Image
                  style={{
                    left: 0,
                    top: 0,
                    position: "absolute",
                    height: 2048,
                    width: 1536,
                  }}
                  source={Resources.menu.grass}
                />
                <Image
                  style={{
                    left: 1536 / 2 - 205 / 2,
                    top: 1300,
                    position: "absolute",
                    height: 205,
                    width: 205,
                    // NOTE: it is very weird but touchable events are not working
                    // when scaling larger view (on android).... so we have to hack
                    transform: Consts.isWeb
                      ? `rotate(${Math.floor(this.state.wheelAngle)}deg)`
                      : [
                          {
                            rotate:
                              "" + Math.floor(this.state.wheelAngle) + "deg",
                          },
                        ],
                  }}
                  source={Resources.menu.wheel}
                />
              </View>
            </View>
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "25%",
                left: 0,
                top: "78%",
              }}
            >
              <Spinner
                active={this.state.active && !this.state.faceSelected}
                faces={this.state.faces}
                faceSelected={this.state.faceSelected}
                geo={{
                  w: Consts.worldW,
                  h: unitH,
                  unitW: unitW,
                }}
                onActiveChange={this.onActiveChange.bind(this)}
                onSpinPositionChange={this.onSpinPositionChange.bind(this)}
                onSpinSpeedChange={this.onSpinSpeedChange.bind(this)}
              />
            </View>
            <MyImageButton
              id={this.props.lang == "rus" ? "startRus" : "start"}
              style={{
                left: Consts.worldW / 2,
                top: (Consts.worldH / 640) * 150,
              }}
              active={true}
              value="START"
              onClick={this.onClick.bind(this, "start")}
            />
            <MyImageButton
              id={this.props.lang == "rus" ? "survivalRus" : "survival"}
              style={{
                left: Consts.worldW / 2,
                top: (Consts.worldH / 640) * 210,
              }}
              active={true}
              value="SURVIVAL"
              onClick={this.onClick.bind(this, "survival")}
            />
            <MyImageButton
              id={this.props.lang == "rus" ? "aboutRus" : "about"}
              active={true}
              style={{
                left: Consts.worldW / 2,
                top: (Consts.worldH / 640) * 270,
              }}
              value="ABOUT"
              onClick={this.onClick.bind(this, "about")}
            />
            <Langs
              style={{
                position: "absolute",
                left: 0,
                top: "30%",
                height: "15%",
                width: "10%",
              }}
              onClick={(lang) => {
                this.onClick("setlang_" + lang);
              }}
              lang={this.props.lang}
            />
            <View
              style={{
                position: "absolute",
                right: "-12%",
                top: "19.8%",
                height: "7%",
                width: "24%",
                borderWidth: (5 * Consts.worldH) / 1000,
                borderColor: "rgba(80,60,30,1)",
                borderRadius: (8 * Consts.worldH) / 1000,
                backgroundColor: "rgba(250,250,250,0.8)",
                overflow: "hidden",
              }}
              onClick={this.handleWheelClick.bind(this)}
              onTouchStart={this.handleWheelClick.bind(this)}
            >
              <View
                style={{
                  position: "absolute",
                  width: "50%",
                  height: "100%",
                  left: 0,
                  bottom: 0,
                  justifyContent: "center", // vertical alignmnet
                }}
              >
                <Text
                  style={{
                    fontSize: (20 * Consts.worldH) / 1000,
                    color: "black",
                    textAlign: "center", // works on web,Android,iOS
                    textAlignVertical: "center", // android only
                    display: "flex",
                    flexDirection: "row", // horizontal allignment
                    alignItems: "center",
                    fontFamily: "denkone",
                    justifyContent: "center", // horizontal allignment
                  }}
                >
                  {"v 1.0"}
                </Text>
              </View>
            </View>
            {this.state.showAbout ? (
              <View
                style={{
                  ...Styles.dummyStyle,
                  flexDirection: "row", // center horizontally
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    top: Consts.isWeb ? "19.8%" : "50%", // in web this is rendered properly, but on android the position is wrong
                    paddingLeft: "5%",
                    paddingRight: "5%",
                    paddingTop: "5%",
                    paddingBottom: "5%",
                    borderWidth: (5 * Consts.worldH) / 1000,
                    borderColor: "rgba(80,60,30,1)",
                    borderRadius: (8 * Consts.worldH) / 1000,
                    backgroundColor: "rgb(220,220,220)",
                    //overflow: "hidden",
                    alignSelf: "flex-start",
                    //alignItems: "center", // vertical alignment
                    //flexDirection: "row", // NOTE: text can't be centered this way,
                    // because we don't know text width upfront
                    //justifyContent: "center", // horizontal alignment
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      left: Consts.worldH * 0.57 * 0.025,
                      right: Consts.worldH * 0.57 * 0.025,
                      top: Consts.worldH * 0.57 * 0.025,
                      bottom: Consts.worldH * 0.57 * 0.025,
                      backgroundColor: "rgb(240,245,235)",
                      borderRadius: (5 * Consts.worldH) / 1000,
                    }}
                  />
                  <Text
                    style={{
                      position: "relative",
                      fontSize: (18 * Consts.worldH) / 1000,
                      color: "black",
                      fontFamily: "robotocondensed",
                      lineHeight: (30 * Consts.worldH) / 1000,
                      justifyContent: "space-around",
                      //includeFontPadding: false, // this is to account for font size in vertical
                    }}
                  >
                    {this.props.lang == "rus" ? aboutTextRus : aboutText}
                  </Text>
                </View>
              </View>
            ) : (
              <View />
            )}
          </View>
        )}
      </View>
    );
  }
}

export default Menu;
