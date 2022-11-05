import * as React from "react";
import { LoginScreen, HomeScreen, ProfileScreen } from "./screens";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext, AuthContextProvider } from "./context";

export type BottomTabParamList = {
  Home: undefined;
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
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthContextProvider>
      <MainNav />
    </AuthContextProvider>
  );
}
