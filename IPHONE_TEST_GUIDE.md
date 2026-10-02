# 《家》iPhone 测试状态

更新：2026-10-02。同一套 Expo / React Native 源码支持 iOS、Android 和网页。

## 已验证
- iOS 和 Android 的 JavaScript / 资源打包完成。
- 亲属称谓、父母关联、分支默认开启和保存失败重试、头像与相册持久化检查通过。执行命令：`npm run check:behavior`。
- iPhone 原生 Release 工程已完成编译，内置 `main.jsbundle`，无需开发服务器即可在 iPhone 模拟器启动。
- 已检查欢迎页截图与进程记录。首次成功运行：<https://github.com/wholove5202-arch/-jia-family/actions/runs/36967310193>。
- Android 实际安装及欢迎页、家庭入口、首页、家族树、分支设置、重新启动测试通过：<https://github.com/wholove5202-arch/-jia-family/actions/runs/36968777090>。

## 当前边界
模拟器运行成功不能替代 iPhone 真机测试，也不是可安装到用户手机的 IPA。本次尚未交付真机签名安装包。

旧的 `iphone-preview.yml` 只提供八分钟 Expo Go 隧道，不是长期测试地址。不得重复发送已过期的隧道并称其可用。

## 下一步
1. 接通可用的 iPhone 真机安装路径，完成所需签名或有效的 Expo Go 会话。
2. 在真实 iPhone 验证照片选取、头像拖动和保存、相机权限、自拍视频、录音和回放。
3. 验证保存内容打开、日期和查看人修改、关闭再启动后数据仍在。

账号服务、云端保存、跨账号家庭关联、服务端权限与 AI 接入仍需实现和验证，测试版不能声称这些已经接通。

## 接续工作位置
- 仓库：`wholove5202-arch/-jia-family`，分支：`main`。
- 原生 iPhone 检查：`.github/workflows/ios-smoke.yml`。
- Android 实际页面操作：`scripts/android-phone-smoke.py`，保留截图、UI XML、启动日志及来源构建编号。
- Android 测试包：<https://github.com/wholove5202-arch/-jia-family/releases/tag/android-test>。
- Android 系统栏安全间距修复：提交 `1ae27c37fda8a3c00ebfda24bda325c912e44d3b`。必须检查该提交构建后的截图，再宣称视觉问题已验证解决。
