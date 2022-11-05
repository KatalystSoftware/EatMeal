import * as React from "react";
import { StyleSheet, View, Text, Image, FlatList } from "react-native";
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
        <FlatList
          style={styles.list}
          data={posts}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <View key={item.id}>
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text style={styles.authorText}>
                  by {item.user.displayName}
                </Text>
                <Text style={styles.authorText}>
                  at {item.createdAt.toDate().toLocaleTimeString("en-US")}
                </Text>
              </View>
              <Image style={styles.postImage} source={{ uri: item.imageUrl }} />
              <Text style={styles.captionText}>In This Image: {item.labels ? item.labels.join(', ') : 'no food found'}</Text>
              {item.caption && (
                <Text style={styles.captionText}>{item.caption}</Text>
              )}
            </View>
          )}
          keyExtractor={item => item.id}
        />
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
  captionText: { fontSize: 16, paddingHorizontal: 8 },
  authorText: {
    paddingHorizontal: 8,
    fontSize: 20,
    fontWeight: "bold",
  },
  postImage: { width: "100%", height: 420 },
  divider: {
    borderBottomColor: "black",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  list: { width: "100%" },
});

export default HomeScreen;
