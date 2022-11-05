import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import { auth } from "../config";
import { Button, StyleSheet, View, Text } from "react-native";
import { AuthContext } from "../context";

WebBrowser.maybeCompleteAuthSession();

const ProfileScreen = () => {
  const { state, dispatch } = React.useContext(AuthContext);

  return (
    <View style={styles.container}>
      {state.user && (
        <>
          <Text>Signed in as {state.user.displayName}</Text>
          <Button
            title="Log Out"
            onPress={() => {
              auth.signOut();
              dispatch({ type: "logout" });
            }}
          />
        </>
      )}
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
