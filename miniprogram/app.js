//app.js
App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: "release-xs32f",
        traceUser: true,
      })
    }
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

  },
  globalData: {
    lockIn:true,                  //第一次加载数据前需要锁住

    firstIn: true,
    userDocId:"",                  //代表用户的唯一id
    userBookStackId: "",

    userInfo: null,
    urlContentId:1,

    hasRegister: true,           //代表用户是否授予信息

    //用于记录用户的暂时个人信息
    temp_user_wechat:"",
    temp_user_QQ:"",
    temp_user_email:"",
    temp_user_address:"",
    temp_user_notes:"",
    tempConfirm: false,

    //表示这一次我想购买的书本
    myOrderBook:{},
    myOrderNumber: 1,

    //用于区分图书的类别
    allCategory: [
      {"id": 1, "content":"新闻传播·公关·写作类"},
      {"id": 2, "content": "文史类"},
      {"id": 3, "content": "艺术类"},
      {"id": 4, "content": "政治法律类"},
      {"id": 5, "content": "心理学·教育学类"},
      {"id": 6, "content": "经济·管理·贸易·金融"},
      {"id": 7, "content": "外语类"},
      { "id": 8, "content": "计算机类" },
      { "id": 9, "content": "电力电子类" },
      { "id": 10, "content": "自动控制类" },
      { "id": 11, "content": "机械类" },
      { "id": 12, "content": "土木地质类" },
      { "id": 13, "content": "光电信息技术类" },
      { "id": 14, "content": "数学类" },
      { "id": 15, "content": "物理·力学类" },
      { "id": 16, "content": "化学化工·材料环境科学类" },
      { "id": 17, "content": "生命科学·医学类" },
      { "id": 18, "content": "农林生物类" }      
    ],

    //用于详情的交易页面数据的显示
    detailInfo:[],
    nowItemForDetailInfo:{},

    //用于返回创建成功
    isShowSendingEmail: false,

    //用于记录转移到了哪个stackPage页面
    nowStackPage: []
  },
})