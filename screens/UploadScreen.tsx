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
import { storage, db, } from "../config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { AuthContext, PostContext } from "../context";
import { Category } from "../types";
import { firebaseConfig } from "../config/firebase";

type Steps = "camera" | "preview" | "info";

const submitToGoogle = async (uri : string) => {
  try {
    let body = JSON.stringify({
      requests: [
        {
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 }
          ],
          image: {
            source: {
              imageUri: uri
            }
          }
        }
      ]
    })

    let response = await fetch(
      'https://vision.googleapis.com/v1/images:annotate?key=' +
      firebaseConfig.apiKey,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: body
      }
    )

    let responseJson = await response.json();
    console.log(responseJson)

    return responseJson
  } catch (error) {
    console.log(error);
  }
};


const UploadScreen = () => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = React.useState<Camera | null>(null);
  const [photo, setPhoto] = React.useState<CameraCapturedPicture | null>(null);
  const [step, setStep] = React.useState<Steps>("camera");
  const [nakki, setText] = React.useState<string>("");
  const authContext = React.useContext(AuthContext);
  const { user } = authContext.state;
  const { dispatch } = React.useContext(PostContext);

  React.useEffect(() => {
    requestPermission();
  }, []);

  const takePhoto = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setPhoto(photo);
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
        caption: "no caption",
        category: Category.Dinner,
        createdAt: new Date(),
      };
      const docRef = await addDoc(postsCollection, post);
      dispatch({
        type: "newPost",
        payload: { post: { ...post, id: docRef.id } },
      });
      setStep("camera");

      setText(JSON.stringify(await submitToGoogle(downloadURL)))
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
      {step === "info" && photo && (
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
          <Pressable onPress={post}>
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
