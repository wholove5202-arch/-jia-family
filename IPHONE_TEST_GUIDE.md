# 《家》V1.4 iPhone 真机测试准备

本版本已按 Expo 标准入口整理，可用于下一步 Expo Go / EAS 真机流程。

## 已处理
- package.json 增加 Expo 标准 main 入口和 start/ios/android scripts。
- iOS 照片库、相机权限说明。
- expo-image-picker 插件声明。
- 图片/视频选择改为 Expo 兼容的 MediaTypeOptions.All。
- App 顶层增加 Error Boundary，启动错误不会只显示白屏。
- PUBLIC / PRIVATE 本地持久化继续保留。

## 仍需真实设备验证
真正运行 Expo bundler 后才能确认 React Native/Expo 运行期错误；当前执行环境没有 iOS/Xcode 原生编译链，因此不能声称已生成 IPA。

## 下一开发步骤
1. 做依赖版本一致性检查。
2. 修复运行期导入/API差异。
3. 准备 EAS 配置。
4. 形成用户可按步骤在 iPhone 上测试的安装路径。
