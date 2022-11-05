import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, User } from "firebase/auth";
import { auth } from "../config";
import { Button, StyleSheet, View, Text } from "react-native";
import Constants from "expo-constants";
import { AuthContext } from "../context";
import { LoginStackParamList } from "../App";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<LoginStackParamList, "Login">;

const LoginScreen = ({ route, navigation }: Props) => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Constants?.manifest?.extra?.webClientId,
  });
  const { state, dispatch } = React.useContext(AuthContext);

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
      signInWithCredential(auth, credential).then((res) => {
        console.log("Signed in with Google! Setting user...");
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
