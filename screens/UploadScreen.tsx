import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Pressable,
} from "react-native";
import { Camera, CameraCapturedPicture, CameraType } from "expo-camera";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { storage, db } from "../config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { AuthContext, PostContext } from "../context";
import { Category } from "../types";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

type Steps = "camera" | "preview" | "info" | "uploading";

const UploadScreen = () => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = React.useState<Camera | null>(null);
  const [photo, setPhoto] = React.useState<CameraCapturedPicture | null>(null);
  const [step, setStep] = React.useState<Steps>("camera");
  const authContext = React.useContext(AuthContext);
  const { user } = authContext.state;
  const { dispatch } = React.useContext(PostContext);

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
    setStep("camera");
  };

  const submitPhoto = () => {
    setStep("info");
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
        caption: "",
        category: Category.Dinner,
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
      setStep("camera");
    }
  };

  if (!permission || !permission.granted) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {step === "camera" && (
        <Camera
          ref={ref => setCamera(ref)}
          style={styles.camera}
          type={CameraType.back}
        >
          <Pressable onPress={takePhoto}>
            <View style={styles.photoButtonContainer}>
              <MaterialIcon size={56} color="#fff" name="camera" />
            </View>
          </Pressable>
        </Camera>
      )}
      {step === "preview" && photo && (
        <ImageBackground
          style={styles.preview}
          source={{ uri: photo && photo.uri }}
        >
          <Pressable onPress={retakePhoto}>
            <View style={styles.cancelButtonContainer}>
              <Text style={styles.buttonText}>Retake</Text>
              <MaterialIcon size={36} color="#f00" name="cancel" />
            </View>
          </Pressable>
          <Pressable onPress={submitPhoto}>
            <View style={styles.postButtonContainer}>
              <Text style={styles.buttonText}>Continue</Text>
              <MaterialIcon size={36} color="#000" name="arrow-right" />
            </View>
          </Pressable>
        </ImageBackground>
      )}
      {(step === "info" || step === "uploading") && photo && (
        <ImageBackground
          style={styles.preview}
          source={{ uri: photo && photo.uri }}
        >
          {/* Here we would add captions etc */}
          <Pressable onPress={retakePhoto}>
            <View style={styles.cancelButtonContainer}>
              <Text style={styles.buttonText}>Retake</Text>
              <MaterialIcon size={36} color="#f00" name="cancel" />
            </View>
          </Pressable>
          <Pressable disabled={step === "uploading"} onPress={post}>
            <View style={styles.postButtonContainer}>
              <Text style={styles.buttonText}>Post</Text>
              <MaterialIcon size={36} color="#000" name="send" />
            </View>
          </Pressable>
        </ImageBackground>
      )}
    </View>
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
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelButtonContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  postButtonContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
  },
  photoButtonContainer: {
    alignItems: "center",
  },
  buttonText: { fontSize: 25, fontWeight: "bold" },

  takeButtonText: {},
});

export default UploadScreen;
