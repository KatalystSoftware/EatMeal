import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, User } from "firebase/auth";
import { auth } from "../config";
import { Button, StyleSheet, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import {
  AuthenticatedUserContext,
  AuthenticatedUserContextType,
} from "../context";
import { RootStackParamList } from "../App";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ route, navigation }: Props) => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Constants?.manifest?.extra?.webClientId,
  });
  const { user, setUser } = React.useContext(
    AuthenticatedUserContext
  ) as AuthenticatedUserContextType;

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
        setUser(res.user);
        navigation.navigate("Home");
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

export default LoginScreen;
