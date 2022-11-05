import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  GoogleAuthProvider,
  signInWithCredential,
  UserCredential,
  User,
} from "firebase/auth";
import { auth } from "../config";
import { Button, StyleSheet, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreenr() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Constants?.manifest?.extra?.webClientId,
  });
  const [user, setUser] = React.useState<User | null>(null);

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
      signInWithCredential(auth, credential).then((res) => setUser(res.user));
    }
  }, [response]);

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text>Signed in as {user.displayName}</Text>
          <Button
            title="Log Out"
            onPress={() => {
              auth.signOut();
              setUser(null);
            }}
          />
        </>
      ) : (
        <Button
          disabled={!request}
          title="Login with Google"
          onPress={() => {
            promptAsync();
          }}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
