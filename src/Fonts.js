/* eslint-disable react/prop-types */
import * as Font from "expo-font";

const FetchFonts = async (cb) => {
  await Font.loadAsync({
    audiowide: require("./../assets/fonts/Audiowide-Regular.ttf"),
    denkone: require("./../assets/fonts/DenkOne-Regular.ttf"),
    jotione: require("./../assets/fonts/JotiOne-Regular.ttf"),
    passerone: require("./../assets/fonts/PasseroOne-Regular.ttf"),
    acme: require("./../assets/fonts/Acme-Regular.ttf"),
    slackey: require("./../assets/fonts/Slackey-Regular.ttf"),
    iceland: require("./../assets/fonts/Iceland-Regular.ttf"),
    russo: require("./../assets/fonts/RussoOne-Regular.ttf"),
    robotocondensed: require("./../assets/fonts/RobotoCondensed-Regular.ttf"),
  });
  cb();
};

export default FetchFonts;
