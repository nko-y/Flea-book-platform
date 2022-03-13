// components/bookStack/bookStack.js
var app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item:{
      type: Object,
      value:{}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    turnToStackPage:function(){
      app.globalData.nowStackPage = this.data.item
      wx.navigateTo({
        url: `../../pages/sharePlatform/sharePlatform`,
      })
    }
  }
})
