import * as React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { BottomTabParamList } from "../App";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PostContext } from "../context";

type Props = NativeStackScreenProps<BottomTabParamList, "Home">;

const HomeScreen = ({ route, navigation }: Props) => {
  const { state } = React.useContext(PostContext);
  const { posts } = state;

  return (
    <View style={styles.container}>
      {posts.length > 0 ? (
        posts.map((post) => (
          <View key={post.id}>
            <Text>{post.user.displayName}</Text>
            <Text>Insert image here</Text>
            <Text>{post.caption}</Text>
          </View>
        ))
      ) : (
        <Text>No posts yet</Text>
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

export default HomeScreen;
