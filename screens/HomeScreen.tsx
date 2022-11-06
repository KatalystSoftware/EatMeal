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
  ScrollView,
} from "react-native";
import { AuthContext, BannerContext, PostContext } from "../context";
import { db } from "../config";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Category, Post, PostWithUser, StrippedUser } from "../types";
import { Chip, Banner } from "react-native-paper";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";

const HomeScreen = () => {
  const { state, dispatch } = React.useContext(PostContext);
  const { posts } = state;
  const userContext = React.useContext(AuthContext);
  const { user, stats } = userContext.state;
  const [refreshing, setRefreshing] = React.useState(false);
  const bannerContext = React.useContext(BannerContext);

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

  React.useEffect(() => {
    if (stats?.postCount == 1) {
      bannerContext.dispatch({
        type: "setBanner",
        payload: {
          type: "postCount",
          count: 1,
          title: "Getting Started",
          description: "Make your first post.",
        },
      });
    }
  }, [stats]);

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
    <>
      <Banner
        visible={bannerContext.state.banner !== null}
        icon={() => <MaterialCommunityIcon size={32} name="trophy" />}
        actions={[
          {
            label: "Dismiss",
            onPress: () => bannerContext.dispatch({ type: "dismissBanner" }),
          },
        ]}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          {bannerContext.state.banner
            ? bannerContext.state.banner.title + "!"
            : "Achievement"}
        </Text>
        {"\n"}
        <Text>
          {bannerContext.state.banner
            ? bannerContext.state.banner.description
            : "Description"}
        </Text>
      </Banner>
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
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.authorText}>
                    {Category[item.category]} by {item.user.displayName}
                  </Text>
                  <Text style={styles.dateText}>
                    at {item.createdAt.toDate().toLocaleTimeString("en-US")}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Image
                    style={styles.postImage}
                    source={{ uri: item.imageUrl }}
                  />
                  <ScrollView
                    horizontal={true}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                    }}
                  >
                    {item.labels &&
                      [...new Set(item.labels)].map(label => (
                        <Chip
                          key={label}
                          style={{ margin: 2, backgroundColor: "#af52de" }}
                        >
                          <Text style={{ color: "#fff" }}>{label}</Text>
                        </Chip>
                      ))}
                  </ScrollView>
                </View>
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captionText: { fontSize: 16, paddingHorizontal: 8, paddingVertical: 4 },
  authorText: {
    paddingHorizontal: 8,
    fontSize: 24,
    fontWeight: "bold",
  },
  dateText: {
    paddingHorizontal: 8,
    fontSize: 16,
  },
  postImage: { width: "100%", height: 420 },
  divider: {
    borderBottomColor: "black",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 20,
  },
  list: { width: "100%" },
});

export default HomeScreen;
