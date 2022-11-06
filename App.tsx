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
  BannerContextProvider,
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
        <Tab.Navigator
          screenOptions={{ tabBarActiveTintColor: "#af52de" }}
          initialRouteName="Home"
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <MaterialIcon
                  size={32}
                  name="home"
                  color={focused ? "#af52de" : "black"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Upload"
            component={UploadScreen as any}
            options={{
              tabBarStyle: {
                display: "none",
              },
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcon
                  size={32}
                  name="camera"
                  color={focused ? "#af52de" : "black"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <MaterialIcon
                  size={32}
                  name="person"
                  color={focused ? "#af52de" : "black"}
                />
              ),
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
        <BannerContextProvider>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <MainNav />
          </KeyboardAvoidingView>
        </BannerContextProvider>
      </PostContextProvider>
    </AuthContextProvider>
  );
}
