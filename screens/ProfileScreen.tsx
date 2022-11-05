import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import { auth } from "../config";
import { Button, StyleSheet, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  AuthenticatedUserContext,
  AuthenticatedUserContextType,
} from "../context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileScreen = ({ route, navigation }: Props) => {
  const { user, setUser } = React.useContext(
    AuthenticatedUserContext
  ) as AuthenticatedUserContextType;

  return (
    <View style={styles.container}>
      {user && (
        <>
          <Text>Signed in as {user.displayName}</Text>
          <Button
            title="Log Out"
            onPress={() => {
              auth.signOut();
              setUser(null);
              navigation.navigate("Home");
            }}
          />
        </>
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

export default ProfileScreen;
