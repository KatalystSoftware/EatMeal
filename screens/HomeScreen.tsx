import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import { PostContext } from "../context";

const HomeScreen = () => {
  const { state } = React.useContext(PostContext);
  const { posts } = state;

  return (
    <View style={styles.container}>
      {posts.length > 0 ? (
        posts.map(post => (
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
