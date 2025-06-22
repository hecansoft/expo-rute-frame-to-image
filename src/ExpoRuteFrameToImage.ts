import { NativeModule, requireNativeModule } from 'expo';

import { ExpoRuteFrameToImageProps } from './ExpoRuteFrameToImage.types';
import { Frame } from 'react-native-vision-camera';

declare class ExpoRuteFrameToImage extends NativeModule<ExpoRuteFrameToImageProps> {
  convertFrameToBase64(frame: Frame): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoRuteFrameToImage>('ExpoRuteFrameToImage');
