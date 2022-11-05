import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { AuthContext, PostContext } from "../context";
import { db } from "../config";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Category, Post, PostWithUser, StrippedUser } from "../types";

const HomeScreen = () => {
  const { state, dispatch } = React.useContext(PostContext);
  const { posts } = state;
  const userContext = React.useContext(AuthContext);
  const { user } = userContext.state;
  const [refreshing, setRefreshing] = React.useState(false);

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

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = (post: PostWithUser) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          // delete post by id from firebase
          const postsRef = collection(db, "posts");
          const postRef = doc(postsRef, post.id);
          await deleteDoc(postRef);
          dispatch({ type: "deletePost", payload: { post } });
        },
      },
    ]);
  };

  const openPostMenu = (post: PostWithUser) => {
    Alert.alert(
      "Post Menu",
      "What would you like to do?",
      [
        {
          text: "Edit Post",
          onPress: () => console.log("editing..."),
          style: "default",
        },
        {
          text: "Delete Post",
          onPress: () => deletePost(post),
          style: "destructive",
        },
        {
          text: "Cancel",
          onPress: () => console.log("canceled..."),
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss: () => console.log("dismissed..."),
      },
    );
  };

  return (
    <View style={styles.container}>
      {posts.length > 0 ? (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} />
          }
          style={styles.list}
          data={posts}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              disabled={item.userId !== user?.uid}
              key={item.id}
              onPress={() => openPostMenu(item)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text style={styles.authorText}>
                  {Category[item.category]} by {item.user.displayName}
                </Text>
                <Text style={styles.authorText}>
                  at {item.createdAt.toDate().toLocaleTimeString("en-US")}
                </Text>
              </View>
              <Image style={styles.postImage} source={{ uri: item.imageUrl }} />
              <Text style={styles.captionText}>
                In This Image:{" "}
                {item.labels ? item.labels.join(", ") : "no food found"}
              </Text>
              {item.caption && (
                <Text style={styles.captionText}>{item.caption}</Text>
              )}
            </TouchableOpacity>
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
