import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Camera, CameraCapturedPicture, CameraType } from "expo-camera";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { storage, db } from "../config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { AuthContext, PostContext } from "../context";
import { Category } from "../types";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Picker } from "@react-native-picker/picker";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useIsFocused, CommonActions } from "@react-navigation/native";
import { firebaseConfig } from "../config/firebase";

type Steps = "camera" | "preview" | "info" | "uploading";

const UploadScreen = ({ navigation }: BottomTabBarProps) => {
  const getLabelsFromImage = async (uri: string): Promise<string[] | null> => {
    try {
      console.log("Requesting object labels and rectangles for uri ", uri);
      let response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=" +
          firebaseConfig.apiKey,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            requests: [
              {
                features: [{ type: "OBJECT_LOCALIZATION", maxResults: 10 }],
                image: {
                  source: {
                    imageUri: uri,
                  },
                },
              },
            ],
          }),
        },
      );

      let responseJson = await response.json();
      console.log("google responded", JSON.stringify(responseJson));

      if (
        responseJson.responses &&
        responseJson.responses[0] &&
        responseJson.responses[0].localizedObjectAnnotations
      ) {
        // get all labels
        const labels = responseJson.responses[0].localizedObjectAnnotations.map(
          (label: any) => label.name,
        );

        console.log("labels", labels);

        return labels;
      } else {
        console.log("No object labels found");
      }
    } catch (error) {
      console.log(error);
    }

    return null;
  };

  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = React.useState<Camera | null>(null);
  const [photo, setPhoto] = React.useState<CameraCapturedPicture | null>(null);
  const [step, setStep] = React.useState<Steps>("camera");
  const [caption, setCaption] = React.useState("");
  const [category, setCategory] = React.useState<Category>(Category.Breakfast);
  const authContext = React.useContext(AuthContext);
  const { user } = authContext.state;
  const { dispatch } = React.useContext(PostContext);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    requestPermission();
  }, []);

  const takePhoto = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      const compressedPhoto = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 500 } }],
        { compress: 0.5, format: SaveFormat.JPEG },
      );
      setPhoto(compressedPhoto);
      setStep("preview");
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setCaption("");
    setStep("camera");
  };

  const submitPhoto = () => {
    setStep("info");
  };

  const goBack = () => {
    setPhoto(null);
    setCaption("");
    setStep("camera");
    navigation.dispatch(CommonActions.goBack());
  };

  const post = async () => {
    if (photo && user) {
      setStep("uploading");
      // convert image URI to blob with XMLHTTP
      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", photo.uri, true);
        xhr.send(null);
      });
      if (!blob) {
        console.error("blob is null");
        setStep("camera");
        return;
      }
      const filename = photo.uri.split("/").pop();
      const photoRef = ref(storage, `${user.uid}/images/${filename}`);
      const uploadRes = await uploadBytes(photoRef, blob);
      const downloadURL = await getDownloadURL(uploadRes.ref);
      const postsCollection = collection(db, "posts");
      const post = {
        userId: user.uid,
        imageUrl: downloadURL,
        caption: caption,
        category: category,
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(postsCollection, post);
      dispatch({
        type: "newPost",
        payload: {
          post: {
            ...post,
            id: docRef.id,
            user: { displayName: user.displayName!, photoUrl: user.photoURL! },
          },
        },
      });
      setCaption("");
      setStep("camera");
      navigation.dispatch(CommonActions.navigate("Home"));

      getLabelsFromImage(downloadURL).then(labels =>
        updateDoc(doc(db, "posts", docRef.id), {
          labels: labels,
        }),
      );
    }
  };

  if (!permission || !permission.granted) {
    return <Text>No access to camera</Text>;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {step === "camera" && isFocused && (
          <Camera
            ref={ref => setCamera(ref)}
            style={styles.camera}
            type={CameraType.back}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Pressable onPress={takePhoto}>
                <View style={styles.photoButtonContainer}>
                  <MaterialIcon size={56} color="#fff" name="camera" />
                </View>
              </Pressable>
              <Pressable
                style={{
                  position: "absolute",
                  transform: [{ translateX: 65 }],
                }}
                onPress={goBack}
              >
                <View style={styles.cancelButtonContainer}>
                  <MaterialIcon size={36} color="#f00" name="cancel" />
                </View>
              </Pressable>
            </View>
          </Camera>
        )}
        {step === "preview" && photo && (
          <View style={styles.preview}>
            <View style={styles.previewTopContainer}>
              <ImageBackground
                resizeMethod="scale"
                style={{ flex: 1, width: "100%" }}
                source={{ uri: photo && photo.uri }}
              >
                <Pressable onPress={retakePhoto}>
                  <View style={styles.cancelButtonContainer}>
                    <MaterialIcon size={36} color="#f00" name="cancel" />
                  </View>
                </Pressable>
              </ImageBackground>
            </View>
            <View style={styles.previewBottomContainer}>
              <Pressable onPress={submitPhoto}>
                <View style={styles.postButtonContainer}>
                  <Text style={styles.buttonText}>Continue</Text>
                  <MaterialIcon size={36} color="#fff" name="arrow-right" />
                </View>
              </Pressable>
            </View>
          </View>
        )}
        {(step === "info" || step === "uploading") && photo && (
          <View style={styles.preview}>
            <View style={styles.previewTopContainer}>
              <ImageBackground
                style={styles.preview}
                source={{ uri: photo && photo.uri }}
              >
                <Pressable onPress={retakePhoto}>
                  <View style={styles.cancelButtonContainer}>
                    <MaterialIcon size={36} color="#f00" name="cancel" />
                  </View>
                </Pressable>
              </ImageBackground>
            </View>
            <View style={styles.previewBottomContainer}>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder="Write a caption..."
                  maxLength={120}
                  style={{
                    padding: 10,
                    fontSize: 18,
                    width: "50%",
                    textAlign: "center",
                    backgroundColor: "#ddd",
                  }}
                  onChangeText={t => setCaption(t)}
                  value={caption}
                />
                <Picker
                  style={{
                    width: "50%",
                    backgroundColor: "#ddd",
                  }}
                  prompt="Select Category"
                  selectedValue={category}
                  onValueChange={(value, _) => setCategory(value)}
                >
                  <Picker.Item label="Breakfast" value={Category.Breakfast} />
                  <Picker.Item label="Lunch" value={Category.Lunch} />
                  <Picker.Item label="Dinner" value={Category.Dinner} />
                  <Picker.Item label="Snack" value={Category.Snack} />
                </Picker>
              </View>

              <Pressable disabled={step === "uploading"} onPress={post}>
                <View style={styles.postButtonContainer}>
                  <Text style={styles.buttonText}>Post your RealMeal!</Text>
                  <MaterialIcon size={32} color="#000" name="send" />
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  preview: {
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
  },
  previewTopContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  previewBottomContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  postButtonContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#af52de",
    borderRadius: 25,
    marginBottom: 5,
  },
  photoButtonContainer: {
    alignItems: "center",
    backgroundColor: "#af52de",
    padding: 4,
    margin: 8,
    borderRadius: 50,
  },
  buttonText: { fontSize: 25, fontWeight: "bold", color: "#fff" },

  takeButtonText: {},
});

export default UploadScreen;
