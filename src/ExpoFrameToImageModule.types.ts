import { Frame } from 'react-native-vision-camera';

export type ExpoFrameToImageModuleProps = {
  convertFrameToBase64(frame: Frame): Promise<string>;
};

