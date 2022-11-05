import * as React from "react";
import {
  LoginScreen,
  HomeScreen,
  ProfileScreen,
  UploadScreen,
} from "./screens";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  AuthContext,
  AuthContextProvider,
  PostContextProvider,
} from "./context";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { KeyboardAvoidingView, Platform } from "react-native";

export type BottomTabParamList = {
  Home: undefined;
  Upload: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export type LoginStackParamList = {
  Login: undefined;
};
const Stack = createNativeStackNavigator<LoginStackParamList>();

const MainNav = () => {
  const { state } = React.useContext(AuthContext);
  return (
    <NavigationContainer>
      {!state.user ? (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : (
        <Tab.Navigator initialRouteName="Home">
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: () => <MaterialIcon size={32} name="home" />,
            }}
          />
          <Tab.Screen
            name="Upload"
            component={UploadScreen}
            options={{
              tabBarIcon: () => (
                <MaterialCommunityIcon size={32} name="camera" />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: () => <MaterialIcon size={32} name="person" />,
            }}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthContextProvider>
      <PostContextProvider>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <MainNav />
        </KeyboardAvoidingView>
      </PostContextProvider>
    </AuthContextProvider>
  );
}
