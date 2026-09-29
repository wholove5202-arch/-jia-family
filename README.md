# 「家」App — V2.2 启动修复工程

第一阶段本地体验项目，使用 Expo SDK 54。

## 目录与启动

`App.js`、`package.json`、`app.json` 在仓库根目录；31 个业务源码文件统一放在 `src/`，检查脚本放在 `scripts/`。不要把 `src/` 内文件平铺上传到仓库根目录。

```sh
npm ci
npm run start
```

用 Expo Go 扫描开发服务提供的二维码测试；开发服务需要保持运行并能被手机访问。电脑网页体验使用 `npm run web`。

## 已验证

2026-09-30 已通过 32 个 JS/JSX 文件的语法与引用检查、现有业务自测，以及 iOS、Android、Web 的 Expo 代码导出。依赖版本检查使用 Expo 随包兼容性数据离线完成。

修复缺少 `babel-preset-expo`、React Native 与 Expo 版本不匹配、Web 依赖缺失，并加入 `package-lock.json` 和 GitHub 自动检查。

## 当前边界

代码导出不是签名 IPA/APK，也不是上架完成；尚未做本轮真机验收。当前家庭、聊天和私密内容是本地数据，尚未对接真实登录、云端同步或服务器权限。示例中的切换确认人功能用于本地演示，不能当作真实身份确认。老照片修复、AI 影片等仍是预留入口。

已有 EAS 项目绑定保留。GitHub 上传目前受仓库访问授权阻塞，本次没有改动远程仓库。
