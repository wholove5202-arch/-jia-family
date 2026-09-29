# 《家》正式工程 V0.1

## 已正式开发（不依赖外部公司）
- React Native / Expo iOS + Android 工程骨架
- 今天确认的暖米白 / 奶茶棕视觉系统
- 首页、底部导航、家庭相册、家族树、家庭群、家庭记事、私密空间、逝者纪念入口
- 手机本地真实照片/视频选择
- 家庭相册与私密相册分离
- AsyncStorage 本地持久化
- 家庭群本地消息收发
- 家庭成员/逝者数据模型
- 私密空间与 AI 能力在产品层分离
- 老照片修复、AI回忆影片保留 provider 接口位置

## 下一批正式开发
- 多家庭创建/加入/切换完整 CRUD
- 家庭成员添加、认领、关系编辑、冲突确认
- 家族树自动关系推导与地图状布局
- 家庭相册：事件/人物/时间/地点基础分类
- 照片归档、去重哈希、上传来源
- 家庭群：图片/视频/语音消息、本地归档提示
- 人物档案、人生时间线、纪念页
- 私密记事本、想念TA及传承规则的本地加密数据结构
- 设置、导出、删除数据

## 后续第三方接口（暂不绑定）
AuthProvider: 手机短信登录
StorageProvider: 对象存储
AIOrganizerProvider: 人物/事件/质量/重复识别
PhotoRestoreProvider: 老照片修复
VideoGenerationProvider: AI回忆影片
PaymentProvider: 家庭会员/单次影片支付
PushProvider: 消息推送

私密空间永远不传入 AIOrganizerProvider / PhotoRestoreProvider / VideoGenerationProvider。


## V0.3 本地领域模块
`src/legacyRules.js`
- createDeathCase / confirmDeath / objectDeath
- createLegacySettings / releasableGrants
- createAnnualAvatarSuggestion / confirmAnnualAvatar

这些规则独立于短信、云服务器、AI、支付供应商，可直接迁移到后端领域层。
