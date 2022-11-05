import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import { PostContext } from "../context";
import { db } from "../config";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";
import { Post, PostWithUser, StrippedUser } from "../types";

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
      const postsWithUser = await Promise.all<PostWithUser>(
        posts.map(async post => {
          const userRef = doc(db, "users", post.userId);
          const userSnap = await getDoc(userRef);
          const user = userSnap.data() as StrippedUser;
          return {
            ...post,
            user,
          } as PostWithUser;
        }),
      );
      dispatch({ type: "initPosts", payload: { posts: postsWithUser } });
    };
    fetchPosts();
  }, []);

  return (
    <View style={styles.container}>
      {posts.length > 0 ? (
        posts.map(post => (
          <View key={post.id}>
            <Text>by {post.user.displayName}</Text>
            <Text>Insert image here</Text>
            {post.caption && <Text>{post.caption}</Text>}
            <View
              style={{
                borderBottomColor: "black",
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
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
