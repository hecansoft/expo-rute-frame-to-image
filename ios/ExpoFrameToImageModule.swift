import ExpoModulesCore
import VisionCamera

public class ExpoFrameToImageModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoFrameToImageModule")

    AsyncFunction("convertFrameToBase64") { (frame: Frame, promise: Promise) in
      guard let buffer = frame.buffer else {
        promise.reject("NO_BUFFER", "No CMSampleBuffer available")
        return
      }

      if let imageBuffer = CMSampleBufferGetImageBuffer(buffer) {
        let ciImage = CIImage(cvPixelBuffer: imageBuffer)
        let context = CIContext()
        if let cgImage = context.createCGImage(ciImage, from: ciImage.extent) {
          let uiImage = UIImage(cgImage: cgImage)
          if let imageData = uiImage.jpegData(compressionQuality: 0.9) {
            let base64 = imageData.base64EncodedString()
            promise.resolve(base64)
            return
          }
        }
      }

      promise.reject("CONVERSION_FAILED", "Unable to convert frame to base64")
    }
  }
}
