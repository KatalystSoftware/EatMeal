import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config";
import { Button, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { AuthContext } from "../context";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Constants?.manifest?.extra?.webClientId,
  });
  const { dispatch } = React.useContext(AuthContext);

  React.useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).then(res => {
        dispatch({ type: "login", payload: res.user });
      });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Button
        disabled={!request}
        title="Login with Google"
        onPress={() => {
          promptAsync();
        }}
      />
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

export default LoginScreen;
