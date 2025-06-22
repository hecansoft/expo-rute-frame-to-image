const { withAndroidManifest, withInfoPlist } = require("@expo/config-plugins");

module.exports = function withExpoRuteFrameToImage(config) {
  config = withAndroidManifest(config, (config) => {
    const permissions = config.modResults.manifest["uses-permission"] || [];

    const cameraPermission = {
      $: { "android:name": "android.permission.CAMERA" },
    };

    // Agrega la permisión CAMERA si no existe
    if (!permissions.some((perm) => perm.$["android:name"] === "android.permission.CAMERA")) {
      config.modResults.manifest["uses-permission"] = [...permissions, cameraPermission];
    }

    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      config.modResults.NSCameraUsageDescription ||
      "This app uses the camera to capture frames.";
    return config;
  });

  return config;
};
