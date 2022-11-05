import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import { PostContext } from "../context";
import { db } from "../config";
import { collection, getDocs } from "firebase/firestore";
import { Post } from "../types";

const HomeScreen = () => {
  const { state, dispatch } = React.useContext(PostContext);
  const { posts } = state;
  React.useEffect(() => {
    const fetchPosts = async () => {
      const postsRef = collection(db, "posts");
      const postsSnap = await getDocs(postsRef);
      const posts = postsSnap.docs.map(
        doc =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Post),
      );
      dispatch({ type: "initPosts", payload: { posts } });
    };
    fetchPosts();
  }, []);

  return (
    <View style={styles.container}>
      {posts.length > 0 ? (
        posts.map(post => (
          <View key={post.id}>
            <Text>{post.userId}</Text>
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
