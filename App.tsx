import * as React from "react";
import { LoginScreen } from "./screens";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthenticatedUserProvider } from "./context";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthenticatedUserProvider>
  );
}
