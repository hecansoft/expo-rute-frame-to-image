import ExpoModulesCore
import VisionCamera

public class ExpoFrameToImageModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoFrameToImage")

    AsyncFunction("convertFrameToBase64") { (frame: Frame, promise: Promise) in
      // Asegúrate de que el CMSampleBuffer esté disponible
      guard let buffer = frame.buffer else {
        promise.reject("NO_BUFFER", "No CMSampleBuffer available")
        return
      }

      // Extrae el CVPixelBuffer
      guard let imageBuffer = CMSampleBufferGetImageBuffer(buffer) else {
        promise.reject("NO_IMAGE_BUFFER", "Unable to get image buffer from CMSampleBuffer")
        return
      }

      // Crea CIImage desde el buffer
      let ciImage = CIImage(cvPixelBuffer: imageBuffer)

      // Opcional: escala o modifica la imagen aquí si deseas mejorar el rendimiento
      // let resized = ciImage.transformed(by: CGAffineTransform(scaleX: 0.5, y: 0.5))

      // Crea un contexto de CoreImage (hardware acelerado)
      let context = CIContext(options: [CIContextOption.useSoftwareRenderer: false])

      // Convierte a CGImage
      guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
        promise.reject("CGIMAGE_CREATION_FAILED", "Unable to create CGImage from CIImage")
        return
      }

      // Crea UIImage
      let uiImage = UIImage(cgImage: cgImage)

      // Convierte a datos JPEG (con calidad 0.9) o PNG como fallback
      if let imageData = uiImage.jpegData(compressionQuality: 0.9) ?? uiImage.pngData() {
        let base64 = imageData.base64EncodedString()
        // Opcional: incluir encabezado MIME si vas a mostrar en HTML o WebView
        // let base64 = "data:image/jpeg;base64,\(imageData.base64EncodedString())"
        promise.resolve(base64)
        return
      }

      // Fallback: conversión fallida
      promise.reject("CONVERSION_FAILED", "Unable to convert frame to base64")
    }
  }
}
