import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { db } from "./config";
import { collection, getDocs, setDoc, doc } from "@firebase/firestore";

export default function App() {
  const [text, setText] = React.useState("");
  useEffect(() => {
    const getData = async () => {
      const testCol = collection(db, "/test");
      const testSnapshot = await getDocs(testCol);
      const testList = testSnapshot.docs.map((doc) => doc.data());
      setText(testList[testList.length - 1].name);
    };
    const setData = async () => {
      const testCol = collection(db, "/test");
      await setDoc(doc(testCol, "test"), {
        name: "test",
      });
    };
    setData();
    getData();
  }, []);

  return (
    <View style={styles.container}>
      <Text>{text}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
