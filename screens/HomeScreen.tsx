import * as React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RootStackParamList } from "../App";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  AuthenticatedUserContext,
  AuthenticatedUserContextType,
} from "../context";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen = ({ route, navigation }: Props) => {
  const { user } = React.useContext(
    AuthenticatedUserContext
  ) as AuthenticatedUserContextType;

  return (
    <View style={styles.container}>
      <Text>Main Screen</Text>
      {user ? (
        <Button
          title="Go to Profile"
          onPress={() => {
            navigation.navigate("Profile");
          }}
        />
      ) : (
        <Button
          title="Go to Login"
          onPress={() => {
            navigation.navigate("Login");
          }}
        />
      )}

      <StatusBar style="auto" />
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

export default HomeScreen;
