import { Camera, Frame, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import ExpoRuteFrameToImage from 'expo-rute-frame-to-image';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useCallback, useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

export default function App() {
  const device = useCameraDevice('back'); // o 'front' si prefieres la frontal
  const lastFrameTime = useRef(0);

  if (device == null) {
    return <Text>Cargando cámara...</Text>; // o null, un loader, etc.
  }

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status !== 'granted') {
        // manejar permiso denegado
      }
    })();
  }, []);

  const processFrame = useCallback(async (frame: Frame) => {
    try {
      const base64Image = await ExpoRuteFrameToImage.convertFrameToBase64(frame);
      console.log(base64Image);
    } catch (e) {
      console.error('Error converting frame:', e);
    }
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const now = Date.now();
    if (now - lastFrameTime.current < 66) return; // ~15 fps
    lastFrameTime.current = now;

    runOnJS(processFrame)(frame);
  }, [processFrame]);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>

        <Group name="Functions">
          <Text>Captura de imagen</Text>
        </Group>
        <Group name="Async functions">
          <Button
            title="Set value"
            onPress={async () => {

            }}
          />
        </Group>
        <Group name="Events">
          <Text></Text>
        </Group>
        <Camera
          style={{ width: windowWidth, height: windowWidth }}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  view: {
    flex: 1,
    height: 200,
  },
};
