import * as React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { BottomTabParamList } from "../App";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<BottomTabParamList, "Home">;

const UploadScreen = ({ route, navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text>Post Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default UploadScreen;
