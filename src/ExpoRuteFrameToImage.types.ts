import { Frame } from 'react-native-vision-camera';

export type ExpoRuteFrameToImageProps = {
  convertFrameToBase64(frame: Frame): Promise<string>;
};

