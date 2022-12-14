import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth, db } from "../config";
import { collection, setDoc, doc, increment, getDoc } from "firebase/firestore";
import { Text, Pressable, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { AuthContext } from "../context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Constants?.manifest?.extra?.webClientId,
    androidClientId: Constants?.manifest?.extra?.androidClientId,
  });
  const { dispatch } = React.useContext(AuthContext);
  const [loginInProgress, setLoginInProgress] = React.useState(false);

  React.useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  React.useEffect(() => {
    const login = async () => {
      setLoginInProgress(true);
      if (response?.type === "success") {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userRes = await signInWithCredential(auth, credential);
        const user = userRes.user;
        const userDoc = doc(db, "users", user.uid);
        const userStats = await getDoc(userDoc);
        await setDoc(userDoc, {
          displayName: user.displayName,
          photoUrl: user.photoURL,
          postCount: userStats?.data()?.postCount ?? 0,
          achievements: userStats?.data()?.achievements ?? [],
        });
        dispatch({ type: "login", payload: user });
        dispatch({ type: "setStats", payload: userStats.data() });
      }
      setLoginInProgress(false);
    };

    login();
  }, [response]);

  return (
    <View style={styles.container}>
      <Pressable
        style={{
          backgroundColor: loginInProgress ? "#4e365a" : "#af52de",
          padding: 10,
          borderRadius: 5,
          flexDirection: "row",
          alignItems: "center",
        }}
        disabled={!request || loginInProgress}
        onPress={() => {
          promptAsync();
        }}
      >
        <Text style={{ fontSize: 24, color: "#fff", fontWeight: "bold" }}>
          Login with Google
        </Text>
        <MaterialCommunityIcons
          style={{ paddingHorizontal: 5 }}
          name="google"
          size={24}
          color="white"
        />
      </Pressable>
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
