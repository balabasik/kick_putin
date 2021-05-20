/* eslint-disable react/prop-types */
import React from "react";
import { View } from "react-native";
import Consts from "./Consts";

function GetTime() {
  return new Date().getTime();
}

function GetScale(pos, id, nFaces, totalLength, unitLength) {
  if (
    pos == undefined ||
    id == undefined ||
    nFaces == undefined ||
    totalLength == 0 ||
    totalLength == undefined ||
    unitLength == undefined
  )
    return 1;
  let realActiveId = ((pos + totalLength) % totalLength) / unitLength;
  let distanceFromActive = Math.abs(id - realActiveId);
  distanceFromActive = Math.min(
    distanceFromActive,
    nFaces - distanceFromActive
  );
  let maxScale = 1.02;
  let minScale = 0.98;
  let scaleFactor =
    distanceFromActive < 0.25
      ? maxScale
      : distanceFromActive > 1
      ? minScale
      : minScale +
        ((maxScale - minScale) * Math.pow(1 - distanceFromActive, 5)) /
          Math.pow(1 - 0.25, 5); // used 0.15 instead of 0.2 for a small snap
  //console.log(scaleFactor);
  return scaleFactor;
}

function GetTranslate(id, pos, unitLength, totalLength) {
  let translate = id * unitLength - pos;
  //console.log(id, translate);
  if (translate > totalLength / 2) {
    translate -= totalLength;
  }
  if (translate < -totalLength / 2) {
    translate += totalLength;
  }
  //console.log(id, translate, totalLength);
  translate += Consts.worldW / 2 - unitLength / 2;
  return Math.floor(translate);
}

class Spinner extends React.Component {
  constructor(props) {
    super(props);
    this.propsActive = props.active;
    this.now = GetTime();
    this.activeId = 0;
    this.active = true;
    this.pos = 0;
    this.posv = 0;
    this.lastNotifiedPosV = this.posv;
    this.lastNotifiedPos = this.pos;
    this.touched = false;
    props.onSpinSpeedChange(this.lastNotifiedPosV);
    props.onSpinPositionChange(this.lastNotifiedPos);
    this.initProps(props);
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.initProps(props);
    if (this.propsActive != props.active) {
      this.propsActive = props.active;
      if (props.active) {
        this.resume();
      } else {
        this.pause();
      }
    }
  }

  initProps(props) {
    this.unitLength = props.geo.unitW;
    this.nFaces = props.faces.length;
    this.totalLength = this.unitLength * this.nFaces;
  }

  pause() {
    console.log("pausing spinner");
    if (this.moveTimeout != undefined) {
      // NOTE: timeouts are not being cleared sometimes!!!
      clearTimeout(this.moveTimeout);
      this.moveTimeout = undefined;
    }
  }

  resume() {
    console.log("resuming spinner");
    this.now = GetTime();
    this.moveWrapper();
  }

  componentDidMount() {
    if (this.propsActive) {
      this.resume();
    }
  }

  state = {
    pos: 0,
  };

  moveWrapper() {
    if (!this.propsActive) {
      return;
    }
    //console.log("move spinner");
    let now = GetTime();
    if (now - this.lastTouchTime > 5000) {
      this.touched = false;
    }
    let delta = now - this.now;
    this.now = now;
    let sticky = false;

    if (this.active && this.nFaces > 0) {
      // update position
      this.pos =
        (this.pos - (this.posv * delta) / 1000 + this.totalLength) %
        this.totalLength;
      let newPos =
        ((this.pos + this.totalLength) % this.totalLength) / this.unitLength;
      //console.log(newPos);
      let newPosFrac = newPos % 1;
      let newPosId = Math.round(newPos);
      if (newPosFrac < 0.03 || newPosFrac > 0.97) {
        this.pos = (newPosId * this.unitLength) % this.totalLength;
        sticky = true;
      }

      this.setState({ pos: this.pos });

      let newActiveId =
        Math.round(
          ((this.pos + this.totalLength) % this.totalLength) / this.unitLength
        ) % this.nFaces;
      if (this.activeId != newActiveId) {
        this.activeId = newActiveId;
        this.props.onActiveChange(this.activeId);
      }

      // update speed
      if (this.touched) {
        let deltaX = this.touchX - this.lastTouchX;
        this.posv = (deltaX / (delta + 1)) * 700;
        this.lastTouchX = this.touchX;
        //console.log(this.posv);
      } else {
        // distance to the nearest pole
        let posFrac =
          (((this.pos + this.totalLength) % this.totalLength) /
            this.unitLength) %
          1;
        // force applied to the right, with a slowdown factor
        let k = 5;
        let slow = 0.5;
        let rightFactor = this.posv > 0 ? slow : 1;
        let leftFactor = this.posv > 0 ? 1 : slow;
        let force = -k * posFrac * leftFactor + (1 - posFrac) * k * rightFactor;
        this.posv = 0.98 * (this.posv + (force * delta) / 1000);
        //console.log(this.posv, newPosId);
        if (sticky) {
          this.posv *= 0.9;
          if (Math.abs(this.posv) < 20) {
            this.posv = 0;
            this.active = false;
          }
        }
        //console.log(this.pos);
      }
    }

    if (this.posv != this.lastNotifiedPosV) {
      this.props.onSpinSpeedChange(this.posv);
      this.lastNotifiedPosV = this.posv;
    }
    if (this.pos != this.lastNotifiedPos) {
      this.props.onSpinPositionChange(this.pos);
      this.lastNotifiedPos = this.pos;
    }
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
    }
    this.moveTimeout = setTimeout(
      this.moveWrapper.bind(this),
      Consts.refreshTime
    );
  }

  click() {}

  renderFace(face, id) {
    let scale = GetScale(
      this.pos,
      id,
      this.nFaces,
      this.totalLength,
      this.unitLength
    );
    let translate = [0, 0];
    return (
      <View
        key={"face" + id}
        style={{
          position: "absolute",
          width: this.unitLength,
          height: this.props.geo.h,
          left: GetTranslate(
            id,
            this.state.pos,
            this.unitLength,
            this.totalLength
          ),
          top: 0,
          //opacity: scale < 1 ? 0.8 : 1,
          transform: Consts.isWeb
            ? `scale(${scale}) translate(${translate[0]}px,${translate[1]}px)`
            : [
                {
                  scale: scale,
                },
                { translate: translate },
              ],
        }}
      >
        {face}
      </View>
    );
  }

  onTouchStart(evt) {
    this.active = true;
    this.touched = true;
    this.touchX = evt.pageX;
    this.lastTouchX = this.touchX;
    this.lastTouchTime = GetTime();
    //console.log("start", this.touchX);
  }

  onTouchMove(evt) {
    if (!this.touched) return;
    this.active = true;
    this.touchX = evt.pageX;
    this.lastTouchTime = GetTime();
    //console.log("move", this.touchX);
  }

  onTouchEnd() {
    this.active = true;
    this.touched = false;
    //console.log("end", this.touchX);
  }

  render() {
    //let now = GetTime();
    //console.log(now - this.latestTime);
    //this.latestTime = now;
    //console.log("rerender");
    return (
      <View
        style={{
          position: "absolute",
          width: this.props.geo.w,
          height: this.props.geo.h,
          left: 0,
          top: 0,
          //backgroundColor: "grey",
        }}
        onTouchStart={(e) => this.onTouchStart(e.nativeEvent)}
        onTouchEnd={this.onTouchEnd.bind(this)}
        onTouchMove={(e) => this.onTouchMove(e.nativeEvent)}
        onMouseDown={(e) => this.onTouchStart(e)}
        onMouseUp={(e) => this.onTouchEnd(e)}
        onMouseMove={(e) => this.onTouchMove(e)}
      >
        {this.props.faces.map((face, id) => {
          if (this.props.faceSelected && id == this.activeId)
            return <View key={"face_" + id} />;
          return this.renderFace(face, id);
        })}
        <View
          style={{
            position: "absolute",
            width: this.props.geo.w / 2 - this.unitLength / 2 + 20,
            height: this.props.geo.h + 20,
            left: -20,
            top: -10,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 10,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: this.props.geo.w / 2 - this.unitLength / 2 + 20,
            height: this.props.geo.h + 20,
            right: -20,
            top: -10,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 10,
          }}
        />
        {this.props.faceSelected ? (
          this.renderFace(this.props.faces[this.activeId], this.activeId)
        ) : (
          <View key={"face2_" + this.activeId} />
        )}
      </View>
    );
  }
}

export default Spinner;
