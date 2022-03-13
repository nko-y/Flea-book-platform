// custion-tab-bar/index.js
var app  = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    selected:0,
    list: [
      {
        pagePath: "/pages/recommend/recommend",
        text: "首页"
      },
      {
        pagePath: "/pages/transaction/transaction",
        text: "交易"
      },
      {
        pagePath: "/pages/share/share",
        text: "共享"
      },
      {
        pagePath: "/pages/mine/mine",
        text: "我的"
      }
    ],
    canThisShow: false
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    tab_bar_index(e) {
      if(app.globalData.lockIn==true) return
      if(!app.globalData.firstIn){
        const url = e.currentTarget.dataset.path
        wx.switchTab({ url })
      }
    },
  }
})
