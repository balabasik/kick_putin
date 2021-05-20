/* eslint-disable react/prop-types */
import React from "react";
import { Share, View, Text, Image } from "react-native";
import { Audio } from "expo-av";
import Styles from "./Styles";
import Consts from "./Consts";
import FetchFonts from "./Fonts";
import Resources from "./Resources";
import {
  Move,
  CheckLoss,
  GetCenter,
  Corners,
  CheckPointInside,
  RotateTransform,
} from "./Geo";
import Skeleton, {
  InitSkeleton,
  RecomputeSkeleton,
  SetSkeletonXY,
} from "./Skeleton";
import Map from "./Map";
import * as Haptics from "expo-haptics";

function winner(ph, type) {
  if (type == "survival") return false;
  return Math.floor(ph / Consts.worldH / 10) == Consts.nGameLevels - 1;
}

function GetTime() {
  return new Date().getTime();
}

const statuses = [
  "ROOKIE",
  "BACHELOR",
  "PARTISAN",
  "FIGURANT",
  "GLADIATOR",
  "CHAMPION!",
];
const statusesRus = [
  "НОВИЧОК",
  "БАКАЛАВР",
  "ПАРТИЗАН",
  "ФИГУРАНТ",
  "ГЛАДИАТОР",
  "ЧЕМПИОН!",
];
const statusColors = [
  "rgb(240,120,120)",
  "rgb(240,180,120)",
  "rgb(240,240,120)",
  "rgb(120,240,120)",
  "rgb(120,180,240)",
  "rgb(180,120,240)",
];

function GetStatus(gameScore, gameStatePh, gameMode, lang) {
  // around 16 kicks per map.
  // height is 10*Consts.worldH per level
  let id = Math.floor(gameStatePh / (10 * Consts.worldH));
  return lang == "rus" ? statusesRus[id] : statuses[id];
}

function GetStatusColor(gameStatePh) {
  // around 16 kicks per map.
  // height is 10*Consts.worldH per level
  let id = Math.floor(gameStatePh / (10 * Consts.worldH));
  return statusColors[id];
}

class UpperShelf extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          width: Consts.worldW,
          height: "10%",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            left: ((-25 * Consts.worldH) / Consts.worldW / 4) * 3 + "%",
            top: "-100%",
            width: ((50 * Consts.worldH) / Consts.worldW / 4) * 3 + "%",
            height: "200%",
            backgroundColor: "rgba(0,0,0,0.75)",
            borderColor: "rgb(100,100,100)",
            borderWidth: (6 * Consts.worldH) / 1000,
            borderRadius: (15 * Consts.worldH) / 1000,
          }}
        >
          <View
            style={{
              position: "absolute",
              width: "50%",
              height: "50%",
              bottom: 0,
              right: 0,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: (60 * Consts.worldH) / 1000,
                color: "rgb(170,240,65)",
                fontFamily: "denkone",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {this.props.clicks}
            </Text>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            right: ((-25 * Consts.worldH) / Consts.worldW / 4) * 3 + "%",
            top: "-100%",
            width: ((50 * Consts.worldH) / Consts.worldW / 4) * 3 + "%",
            height: "200%",
            backgroundColor: "rgba(0,0,0,0.75)",
            borderColor: "rgb(100,100,100)",
            borderWidth: (6 * Consts.worldH) / 1000,
            borderRadius: (15 * Consts.worldH) / 1000,
          }}
        >
          <View
            style={{
              position: "absolute",
              width: "50%",
              height: "50%",
              bottom: 0,
              left: 0,
            }}
          >
            <Image
              style={{
                position: "absolute",
                width: (45 * Consts.worldH) / 1000,
                height: (45 * Consts.worldH) / 1000,
                top: "29%",
                left: "12%",
                opacity: this.props.lives >= 1 ? 1 : 0.5,
                tintColor: this.props.lives >= 1 ? "rgb(251,62,53)" : undefined,
              }}
              source={Resources.heart}
            />
            <Image
              style={{
                position: "absolute",
                width: (45 * Consts.worldH) / 1000,
                height: (45 * Consts.worldH) / 1000,
                opacity: this.props.lives >= 2 ? 1 : 0.5,
                tintColor: this.props.lives >= 2 ? "rgb(251,62,53)" : undefined,
                top: "29%",
                left: "40%",
              }}
              source={Resources.heart}
            />
            <Image
              style={{
                position: "absolute",
                width: (45 * Consts.worldH) / 1000,
                height: (45 * Consts.worldH) / 1000,
                top: "29%",
                left: "68%",
                opacity: this.props.lives >= 3 ? 1 : 0.5,
                tintColor: this.props.lives >= 3 ? "rgb(251,62,53)" : undefined,
              }}
              source={Resources.heart}
            />
          </View>
        </View>
      </View>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.propsActive = props.top != "menu";
    this.gameType = "survival";
    this.active = false;
    this.sounds = new Array(Resources.sounds.length);
    this.firstkicksound = true;
    this.lifelostSoundFirstTime = true;
    Audio.Sound.createAsync(Resources.kickSound).then((sound) => {
      this.kickSound = sound;
    });
    Audio.Sound.createAsync(Resources.rim1Sound).then((sound) => {
      this.rocketSound = sound;
      this.rocketSound.sound.setVolumeAsync(0.5);
    });
    Audio.Sound.createAsync(Resources.rim2Sound).then((sound) => {
      this.rocketKickSound = sound;
      this.rocketKickSound.sound.setVolumeAsync(0.3);
    });
    Audio.Sound.createAsync(Resources.snareSound).then((sound) => {
      this.lifelostSound = sound;
      this.lifelostSound.sound.setVolumeAsync(0.37);
    });
    for (let i = 0; i < Resources.sounds.length; i++) {
      Audio.Sound.createAsync(Resources.sounds[i]).then((sound) => {
        this.sounds[i] = sound;
        this.sounds[i].sound.setVolumeAsync(0.35);
      });
    }
    this.componentMount = false;
    if (Consts.jumpOnStart) {
      setTimeout(this.clickHead.bind(this, { x: 100, y: 100 }), 1000);
    }
    this.resetPerLifeCbs = [];
    this.activateCbs = [];
    this.menuClicked = false;
    this.shareClicked = false;
  }

  UNSAFE_componentWillReceiveProps(props) {
    let active = props.top != "menu";
    this.gameType = props.top == "game_start" ? "story" : "survival";
    if (this.propsActive != active) {
      this.propsActive = active;
      if (active) {
        this.resetPerGame();
      } else {
        this.pause();
      }
    }
  }

  pause() {
    if (this.moveTimeout != undefined) {
      clearTimeout(this.moveTimeout);
      this.moveTimeout = undefined;
    }
    if (this.refreshTimeout != undefined) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = undefined;
    }
  }

  resume() {
    if (!this.gameOver) {
      this.moveWrapper();
    }
    if (this.componentMount) {
      console.log("ersume");
      this.refreshRender();
    }
  }

  resetPerLife() {
    let xy = { x: Consts.worldW / 2, y: Consts.worldH / 4 };
    this.skeleton = InitSkeleton(Resources.svgs[this.props.activeId], xy, 1);
    this.head = this.skeleton[0]; // this is reference for simplicity
    if (this.componentMount) {
      this.setState({ head: this.head, skeleton: this.skeleton });
    }
    this.active = false;
    this.now = GetTime();
    if (this.propsActive) {
      this.resume();
    }
    for (let cb of this.resetPerLifeCbs) {
      cb();
    }
  }

  resetRocket() {
    this.setState({
      rocket: { x: Consts.worldW / 2, y: Consts.worldH + Consts.worldH * 0.18 },
    });
    this.boot = { x: 0, y: 0, angle: -130, rot: -0.1 };
  }

  resetPerGame() {
    this.resetRocket();
    this.gameOver = false;
    this.isWinner = false;
    this.clicks = 0; //120;
    this.lives = this.gameType == "survival" ? 1 : 3;
    this.gameStatePh = 0; //12800 * 5; // to test winner page uncomment
    this.resetPerLife();
  }

  activateWinner() {
    // NOTE: this is not good to modify a const, but its easier this way.
    Consts.enableFloor = true;
    this.lastRocketRefresh = GetTime();
    setTimeout(this.moveHeadToCenter.bind(this), 10000);
    setTimeout(this.moveRocket.bind(this), 5000);
  }

  activateHeadKick() {
    let center = GetCenter(this.state.head);
    let coord = { x: center.x + this.head.renderSize.w, y: 0.9 * center.y };
    this.clickHead(coord, true, 1.4);
    Consts.enableFloor = false; // return to original state
    setTimeout(this.handleGameOver.bind(this), 1000);
  }

  activateRocketKick() {
    if (this.boot.angle >= (((Consts.worldH / Consts.worldW) * 3) / 4) * -25) {
      this.activateHeadKick();
      return;
    }
    let now = GetTime();
    if (this.lastRocketKick == undefined) this.lastRocketKick = now;
    let dt = now - this.lastRocketKick;
    let rota = 0.003;
    this.boot.angle += dt * this.boot.rot;
    this.boot.rot += dt * rota;
    this.boot.rot = Math.min(this.boot.rot, 3);
    this.lastRocketKick = now;
    this.rocketKickSound.sound.replayAsync();
    setTimeout(this.activateRocketKick.bind(this), 30);
  }

  moveRocket() {
    //console.log(this.state.rocket);
    if (this.gameOver) return;
    if (!this.active) return;
    let now = GetTime();
    if (this.state.rocket.y <= -Consts.worldH * 0.1) {
      this.lastRocketKick = undefined;
      setTimeout(this.activateRocketKick.bind(this), 1000);
      return;
    }
    let dt = now - this.lastRocketRefresh;
    this.setState({
      rocket: {
        x: this.state.rocket.x,
        y: this.state.rocket.y - Consts.worldH * 0.0001 * dt,
      },
    });
    this.lastRocketRefresh = now;
    this.rocketSound.sound.replayAsync();
    if (!Consts.isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimeout(this.moveRocket.bind(this), 30);
  }

  moveHeadToCenter() {
    if (this.gameOver) return;
    if (!this.active) return;

    let newx = Consts.worldW / 2;
    let newy = this.skeleton[0].geo.y;

    if (Math.abs(this.skeleton[0].geo.x - newx) < Consts.worldH * 0.001) return;
    // nove 10% at a time
    newx = 0.95 * this.skeleton[0].geo.x + 0.05 * newx;

    SetSkeletonXY(this.skeleton, {
      x: newx,
      y: newy,
    });
    this.setState({
      skeleton: this.skeleton,
    });
    setTimeout(this.moveHeadToCenter.bind(this), 30);
  }

  componentDidMount() {
    FetchFonts(() => {
      console.log("fonts loaded");
      this.setState({ fontsLoaded: true });
    });
    this.componentMount = true;
    if (this.propsActive) {
      console.log("started rendering");
      this.resetPerGame();
      this.refreshRender();
    }
  }

  bounce() {
    if (this.state.bounced) return;
    this.setState({ bounced: true });
    setTimeout(() => {
      this.setState({ bounced: false });
    }, 300);
  }

  state = {
    fontsLoaded: false,
    started: false,
    bounced: false,
    // NOTE: cna't have nested objects inside!!! otherwise many copies will fail
    head: undefined,
    skeleton: [],
    gameOver: false,
    gameScore: 0,
    gameStatePh: 0, // ph is height
    rocket: { x: 0, y: 0 },
    boot: { x: 0, y: 0, angle: 0 },
  };

  moveWrapper() {
    if (!this.propsActive) {
      return;
    }
    let now = GetTime();
    let delta = now - this.now;
    this.now = now;

    let lost = false;
    let newgeo = undefined;

    if (this.active) {
      newgeo = Move(this.head, delta);
      let deltaY = newgeo.y - this.head.geo.y;
      lost = !this.isWinner && CheckLoss(newgeo);
      this.head.geo = newgeo;
      // if moving down we also move map up
      if (!this.isWinner) {
        this.gameStatePh +=
          (deltaY < 0 ? -Consts.phConst : Consts.phConst) * deltaY;
        this.gameStatePh = Math.min(
          this.gameStatePh,
          (Consts.nGameLevels - 1) * 10 * Consts.worldH
        );
        if (winner(this.gameStatePh, this.gameType)) {
          this.isWinner = true;
          this.activateWinner();
        }
      }
    }

    RecomputeSkeleton(this.skeleton, delta);

    if (lost) {
      this.handleLifeLost();
    } else {
      if (this.moveTimeout) {
        clearTimeout(this.moveTimeout);
      }
      this.moveTimeout = setTimeout(
        this.moveWrapper.bind(this),
        Consts.stepTime
      );
    }
  }

  handleLifeLost() {
    this.lives -= 1;

    if (this.lifelostSound != undefined) {
      this.lifelostSound.sound.replayAsync();
      if (this.lifelostSoundFirstTime) {
        this.lifelostSound.sound.replayAsync();
      }
    }

    if (!Consts.isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (this.lives <= 0) {
      this.handleGameOver();
    } else {
      this.resetPerLife();
    }
  }

  handleGameOver() {
    console.log("GAME OVER!!!!!");
    SetSkeletonXY(this.skeleton, {
      x: Consts.worldW / 2,
      y: Consts.worldH * 0.74,
    });
    this.gameOver = true;
    this.active = false;
    if (this.moveTimeout != undefined) {
      clearTimeout(this.moveTimeout);
    }
    this.setState({
      gameOver: true,
      gameScore: this.clicks,
      skeleton: this.skeleton,
    });
    // small delay
    setTimeout(() => this.props.onGameMessage("game_over"), 100);
  }

  clickMenu() {
    //console.log("menu clicked");
    this.menuClicked = true;
    this.props.onGameMessage("game_quit");
    setTimeout(() => {
      this.menuClicked = false;
    }, 200);
  }

  clickShare() {
    this.shareClicked = true;
    setTimeout(() => {
      this.shareClicked = false;
    }, 200);
    // NOTE: Share is crashing on web
    if (!Consts.isWeb) {
      try {
        Share.share({
          message: Consts.isAndroid
            ? "https://play.google.com/store/apps/details?id=kick_putin.apk"
            : "https://apps.apple.com/us/app/kick-putin-out-of-the-bunker/id1566490226",
        });
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  refreshRender() {
    //let now = GetTime();
    //console.log(now - this.latestTime);
    //this.latestTime = now;
    //console.log("refresh");
    if (!this.propsActive) {
      return;
    }
    this.setState({
      head: this.head,
      skeleton: this.skeleton,
    });
    if (this.gameStatePh != this.state.gameStatePh) {
      //console.log("here");
      this.setState({ gameStatePh: this.gameStatePh });
    }
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.refreshTimeout = setTimeout(
      this.refreshRender.bind(this),
      Consts.refreshTime
    );
  }

  playSound() {
    //console.log(this.clickSound);
    if (this.skeleton.name != "chicken" && this.clicks % 10 == 5) {
      setTimeout(() => {
        let soundId = Math.floor(Math.random() * this.sounds.length);
        this.sounds[soundId].sound.replayAsync();
      }, 300);
    }
    if (this.kickSound != undefined) {
      this.kickSound.sound.replayAsync();
      if (this.firstkicksound) {
        // NOTE: For some reason the very first sound fails,
        // and returns that its already being playing...
        // so we have to launch it 2 times
        this.firstkicksound = false;
        this.kickSound.sound.replayAsync();
      }
    }
    if (!Consts.isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  clickHead(coord, bypassWinner, winnerMult) {
    if (this.state.gameOver) return;
    if (bypassWinner == undefined && winner(this.gameStatePh, this.gameType))
      return;

    // NOTE: user clicks against visible state and not against actual state, so we use state here.
    // ignore touch if it was too high
    // NOTE: user clicks against image center not center of mass
    let center = GetCenter(this.state.head);
    // NOTE: uncomment this if game is too easy, it will make people click only on lower part of the head
    //if (coord.y > center.y) {
    //  console.log("touch too high");
    //  return;
    //}

    this.playSound();

    this.clicks += 1;
    // its quite hard to get into the middle, so we allow a bit of damping
    let tangentX = (center.x - coord.x) / 2;
    // doesn't matter where we hit as long as it is below middle
    let tangentY = this.head.renderSize.h / 2; // this.state.head.geo.y - coord.y;
    let tangent = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
    let v = Consts.kickV * (winnerMult == undefined ? 1 : winnerMult);

    this.head.geo.vx = (v * tangentX) / tangent;
    this.head.geo.vy = (v * tangentY) / tangent;
    // we mupliply rotation based on the tangent
    // if rotation is clockwise and tangentX < 0 we slow it down, else we speed up
    if (
      (this.head.geo.vrot > 0 && tangentX < 0) ||
      (this.head.geo.vrot < 0 && tangentX > 0)
    ) {
      this.head.geo.vrot /= 2;
    } else {
      this.head.geo.vrot *= 1.5;
    }
    // add small jitter
    this.head.geo.vrot += Math.random() * 50 - 25;

    // also give bounce to skeleton
    for (let i = 1; i < this.skeleton.length; i++) {
      this.skeleton[i].geo.vrot += Math.random() * 500 - 250;
    }

    if (!this.active) {
      this.active = true;
      for (let cb of this.activateCbs) {
        cb();
      }
    }

    this.setState({ bounced: true });
    if (this.bounceTimeout != undefined) {
      clearTimeout(this.bounceTimeout);
    }
    this.bounceTimeout = setTimeout(() => {
      this.setState({ bounced: false });
    }, 200);
  }

  click(evt) {
    //console.log(evt);
    if (this.state.gameOver && !this.menuClicked && !this.shareClicked) {
      this.resetPerGame();
      this.setState({ gameOver: false });
      return;
    } else if (this.state.gameOver && this.menuClicked) {
      setTimeout(() => this.click(evt), 300);
    }
    // check if coordinates are inside flying image
    //let touchX = evt.nativeEvent.locationX;
    //let touchY = Consts.worldH - evt.nativeEvent.locationY;

    // NOTE: locationX and locationY give weird coordinates when touched
    // on top of image
    // Hence we need to use pageX, pageY, and calculate world coordinates manually

    let touchX = evt.pageX - (Consts.screenW - Consts.worldW) / 2;
    let touchY =
      Consts.screenH - evt.pageY - (Consts.screenH - Consts.worldH) / 2;

    // NOTE: user clicks against visible state and not against actual state, so we use state here.
    // NOTE2: we allow a bit of leeway to tap, so we shift corners away from CM 10%
    //console.log(this.head.geo);
    let corners = Corners(this.head);
    corners = corners.map((corner) => {
      return {
        x:
          this.head.geo.x +
          (corner.x - this.head.geo.x) * Consts.clickAreaScale,
        y:
          this.head.geo.y +
          (corner.y - this.head.geo.y) * Consts.clickAreaScale,
      };
    });
    if (CheckPointInside(corners, { x: touchX, y: touchY }))
      this.clickHead({ x: touchX, y: touchY });
  }

  render() {
    //console.log(GetTime());
    let lines = [];
    if (Consts.renderLines) {
      let corners =
        this.state.head == undefined ? [] : Corners(this.state.head.geo);
      //console.log(corners);
      for (let i = 0; i < corners.length; i++) {
        lines.push([
          { x: corners[i].x, y: corners[i].y },
          {
            x: corners[(i + 1) % corners.length].x,
            y: corners[(i + 1) % corners.length].y,
          },
        ]);
      }
    }

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
            style={{
              ...Styles.dummyStyle,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                ...Styles.worldStyle,
                top: (Consts.screenH - Consts.worldH) / 2,
              }}
              onTouchStart={(e) => this.click(e.nativeEvent)}
              onClick={(e) => this.click(e)}
            >
              <Map
                lang={this.props.lang}
                type={this.gameType}
                ph={
                  this.gameType == "survival"
                    ? (Consts.nGameLevels - 1) * 10 * Consts.worldH
                    : this.state.gameStatePh
                }
              />
              {this.isWinner ? (
                <View
                  style={{
                    position: "absolute",
                    height: Consts.worldH * 0.36,
                    width: Consts.worldH * 0.36,
                    left: Consts.worldW / 2 - Consts.worldH * 0.18,
                    bottom: this.state.rocket.y + Consts.worldH * 0.36,
                  }}
                >
                  <Image
                    style={{
                      position: "absolute",
                      height: "67%",
                      width: "67%",
                      left: "23%",
                      top: "83%",
                      transform: RotateTransform(
                        { x: 50, y: 100 },
                        this.boot.angle,
                        {
                          x: 0.67 * Consts.worldH * 0.36,
                          y: 0.67 * Consts.worldH * 0.36,
                        }
                      ),
                    }}
                    source={Resources.boot}
                  />
                  <Image
                    style={{
                      position: "absolute",
                      height: "100%",
                      width: "100%",
                      left: 0,
                      top: 0,
                    }}
                    source={Resources.rocket}
                  />
                </View>
              ) : (
                <View />
              )}
              {this.state.gameOver ? (
                <View />
              ) : (
                <Skeleton
                  skeleton={this.state.skeleton}
                  bounced={this.state.bounced}
                />
              )}
              {Consts.renderCM ? (
                <View
                  style={{
                    backgroundColor: "black",
                    position: "absolute",
                    width: 8,
                    height: 8,
                    left:
                      Math.floor(
                        this.state.head == undefined ? 0 : this.state.head.geo.x
                      ) - 4,
                    bottom:
                      Math.floor(
                        this.state.head == undefined ? 0 : this.state.head.geo.y
                      ) - 4,
                  }}
                />
              ) : (
                <View />
              )}
            </View>
            <UpperShelf clicks={this.clicks} lives={this.lives} />
          </View>
        )}
        {this.state.gameOver ? (
          <View
            style={{
              ...Styles.dummyStyle,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                ...Styles.worldStyle,
                backgroundColor: "black",
                opacity: 0.7,
              }}
            />
            <View
              style={Styles.worldStyle}
              onTouchStart={(e) => this.click(e.nativeEvent)}
              onClick={(e) => this.click(e)}
            >
              <View
                style={{
                  position: "absolute",
                  left: Consts.worldH / Consts.worldW > 1.7 ? "25%" : "30%",
                  top: "10%",
                  width: Consts.worldH / Consts.worldW > 1.7 ? "50%" : "40%",
                  height: "30%",
                  backgroundColor: "rgb(15,10,5)",
                  overflow: "hidden",
                  borderWidth: (5 * Consts.worldH) / 1000,
                  borderRadius: (8 * Consts.worldH) / 1000,
                }}
              >
                <Image
                  style={{ ...Styles.dummyStyle, top: "-12%" }}
                  source={Resources.heroLight}
                />
                <View
                  style={{
                    position: "absolute",
                    left: "20%",
                    bottom: "-3%",
                    width: "60%",
                    height: "7%",
                    backgroundColor: "rgba(140,120,100,0.7)",
                    borderRadius: (8 * Consts.worldH) / 1000,
                  }}
                />
              </View>
              <View
                style={{
                  position: "absolute",
                  left: Consts.worldH / Consts.worldW > 1.7 ? "25%" : "30%",
                  top: "10%",
                  width: Consts.worldH / Consts.worldW > 1.7 ? "50%" : "40%",
                  height: "30%",
                  borderWidth: (5 * Consts.worldH) / 1000,
                  borderRadius: (8 * Consts.worldH) / 1000,
                  borderColor: "rgb(100,100,100)",
                }}
              />
              <Skeleton
                skeleton={this.state.skeleton}
                bounced={this.state.bounced}
              />
              <Text
                style={{
                  position: "absolute",
                  width: Consts.worldW,
                  top: Math.floor(Consts.worldH * 0.43),
                  fontSize: ((this.isWinner ? 47 : 50) * Consts.worldH) / 1000,
                  color: "rgb(230,230,230)",
                  textAlign: "center",
                  textAlignVertical: "center",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  fontFamily: this.props.lang == "rus" ? "russo" : "slackey",
                }}
                numberOfLines={1}
              >
                {this.props.lang == "rus"
                  ? this.isWinner
                    ? "ВОВА ГЕЙМ ОВА"
                    : "ГЕЙМ ОВА"
                  : this.isWinner
                  ? "VOVA GAME OVA"
                  : `GAME OVER`}
              </Text>
              <Text
                style={{
                  position: "absolute",
                  width: Consts.worldW,
                  bottom: Math.floor(Consts.worldH * 0.43),
                  fontSize: ((this.isWinner ? 47 : 50) * Consts.worldH) / 1000,
                  color: "rgb(230,230,230)",
                  textAlign: "center",
                  textAlignVertical: "center",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  fontFamily: this.props.lang == "rus" ? "russo" : "slackey",
                }}
              >
                {(this.props.lang == "rus" ? "СЧЁТ: " : "SCORE: ") +
                  this.state.gameScore}
              </Text>
              <View
                style={{
                  position: "absolute",
                  left: "13%",
                  bottom: "20%",
                  width: "74%",
                  height: "20%",
                  backgroundColor: "rgb(0,0,0)",
                  overflow: "hidden",
                  borderWidth: (5 * Consts.worldH) / 1000,
                  borderRadius: (8 * Consts.worldH) / 1000,
                  borderColor: "rgb(100,100,100)",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: (49 * Consts.worldH) / 1000,
                    color: GetStatusColor(this.state.gameStatePh),
                    textAlign: "center",
                    textAlignVertical: "center",
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    fontFamily: this.props.lang == "rus" ? "russo" : "slackey",
                  }}
                >
                  {(this.props.lang == "rus" ? `СТАТУС:\n` : `STATUS:\n`) +
                    GetStatus(
                      this.state.gameScore,
                      this.state.gameStatePh,
                      this.props.gameMode,
                      this.props.lang
                    )}
                </Text>
              </View>
              <View
                style={{
                  position: "absolute",
                  left: "-20%",
                  bottom: "5%",
                  height: "7%",
                  width: "40%",
                  borderWidth: (5 * Consts.worldH) / 1000,
                  borderColor: "rgb(100,100,100)",
                  borderRadius: (8 * Consts.worldH) / 1000,
                  backgroundColor: "rgb(30,30,30)",
                  overflow: "hidden",
                }}
                onTouchStart={(e) => this.clickMenu(e.nativeEvent)}
                onClick={(e) => this.clickMenu(e)}
              >
                <View
                  style={{
                    position: "absolute",
                    width: "50%",
                    height: "100%",
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize:
                        ((Consts.worldH / Consts.worldW > 1.7 &&
                        this.props.lang == "rus"
                          ? 24
                          : 30) *
                          Consts.worldH) /
                        1000,
                      color: "rgb(255,225,135)",
                      textAlign: "center",
                      textAlignVertical: "center",
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                      fontFamily:
                        this.props.lang == "rus" ? "russo" : "denkone",
                    }}
                  >
                    {this.props.lang == "rus" ? "МЕНЮ" : "MENU"}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  position: "absolute",
                  right: "-20%",
                  bottom: "5%",
                  height: "7%",
                  width: "40%",
                  borderWidth: (5 * Consts.worldH) / 1000,
                  borderColor: "rgb(100,100,100)",
                  borderRadius: (8 * Consts.worldH) / 1000,
                  backgroundColor: "rgb(30,30,30)",
                  overflow: "hidden",
                }}
                onTouchStart={(e) => this.clickShare(e.nativeEvent)}
                onClick={(e) => this.clickShare(e)}
              >
                <View
                  style={{
                    position: "absolute",
                    width: "50%",
                    height: "100%",
                    left: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  <Image
                    style={{
                      position: "absolute",
                      resizeMode: "contain",
                      width: "70%",
                      height: "70%",
                      top: "15%",
                      left: "15%",
                      tintColor: "rgb(255,225,135)",
                    }}
                    source={Resources.shareButton}
                  />
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View />
        )}
      </View>
    );
  }
}

export default Game;
