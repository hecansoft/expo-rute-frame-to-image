package com.hecansoft.tools

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.media.Image
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.frameprocessors.Frame
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer

class ExpoFrameToImageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoFrameToImage")

    AsyncFunction("convertFrameToBase64") { frame: Frame, promise: Promise ->
      val image = frame.image
      if (image == null || image.format != ImageFormat.YUV_420_888) {
        promise.reject("INVALID_IMAGE", "Image is null or format is not YUV_420_888")
        return@AsyncFunction
      }

      try {
        val nv21 = yuv420ToNv21(image)
        val yuvImage = android.graphics.YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)

        val out = ByteArrayOutputStream()
        val quality = 90 // JPEG quality (0–100)
        yuvImage.compressToJpeg(android.graphics.Rect(0, 0, image.width, image.height), quality, out)
        val imageBytes = out.toByteArray()
        val base64 = Base64.encodeToString(imageBytes, Base64.NO_WRAP)

        promise.resolve(base64)
      } catch (e: Exception) {
        promise.reject("CONVERSION_FAILED", "Failed to convert frame to base64: ${e.message}")
      }
    }
  }

  private fun yuv420ToNv21(image: Image): ByteArray {
    val width = image.width
    val height = image.height

    val ySize = width * height
    val uvSize = width * height / 4

    val nv21 = ByteArray(ySize + uvSize * 2)

    val yBuffer = image.planes[0].buffer
    val uBuffer = image.planes[1].buffer
    val vBuffer = image.planes[2].buffer

    yBuffer.get(nv21, 0, ySize)

    val chromaRowStride = image.planes[1].rowStride
    val chromaPixelStride = image.planes[1].pixelStride

    var offset = ySize
    for (row in 0 until height / 2) {
      for (col in 0 until width / 2) {
        val uIndex = row * chromaRowStride + col * chromaPixelStride
        val vIndex = row * chromaRowStride + col * chromaPixelStride

        nv21[offset++] = vBuffer.get(vIndex)
        nv21[offset++] = uBuffer.get(uIndex)
      }
    }

    return nv21
  }
}
