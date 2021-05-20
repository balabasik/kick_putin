/* eslint-disable react/prop-types */
import React from "react";
import Game from "./src/Game";
import Menu from "./src/Menu";
import Styles from "./src/Styles";
import { View } from "react-native";
import Consts from "./src/Consts";
import * as Localization from "expo-localization";

function GetLocale() {
  if (Consts.isWeb) return "eng";
  let locale = Localization.locale;
  console.log(locale);
  //console.log(locale.substring(0, 2));
  if (
    locale == undefined ||
    typeof locale != "string" ||
    !locale.startsWith("ru")
  )
    return "eng";
  return "rus";
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    top: "menu",
    activeId: 1,
    lang: GetLocale(),
    sounds: false,
  };

  setLang(lang) {
    if (lang == this.state.lang) return;
    if (lang == "rus") this.setState({ lang: "rus" });
    else this.setState({ lang: "eng" });
  }

  setSounds(sounds) {
    if (sounds == this.state.sounds) return;
    this.setState({ sounds });
  }

  onGameMessage(message) {
    if (message == "menu_start") {
      this.setState({ top: "game_start" });
    } else if (message == "menu_survival") {
      this.setState({ top: "game_survival" });
    } else if (message == "game_quit") {
      this.setState({ top: "menu" });
    } else if (message == "menu_setlang_rus") {
      this.setLang("rus");
    } else if (message == "menu_setlang_eng") {
      this.setLang("eng");
    } else if (message == "menu_setsound_on") {
      this.setSounds(true);
    } else if (message == "menu_setsound_off") {
      this.setSounds(false);
    }
  }

  onActiveIdChange(activeId) {
    this.setState({ activeId });
  }

  handleCanvas = (canvas) => {
    console.log(canvas);
    //const ctx = canvas.getContext("2d");
    //ctx.fillStyle = "purple";
    //ctx.fillRect(0, 0, 100, 100);
  };

  render() {
    // Both menu and game will be active, but we change their relative order,
    let menu = (
      <Menu
        key="menu"
        lang={this.state.lang}
        top={this.state.top}
        sounds={this.state.sounds}
        onActiveIdChange={this.onActiveIdChange.bind(this)}
        onGameMessage={this.onGameMessage.bind(this)}
      />
    );
    let game = (
      <Game
        key="game"
        top={this.state.top}
        lang={this.state.lang}
        sounds={this.state.sounds}
        onGameMessage={this.onGameMessage.bind(this)}
        activeId={this.state.activeId}
      />
    );
    let all = this.state.top == "menu" ? [game, menu] : [menu, game];
    return <View style={Styles.dummyStyle}>{all.map((el) => el)}</View>;
  }
}

export default App;
