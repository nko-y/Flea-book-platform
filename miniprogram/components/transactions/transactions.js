// components/transactions/transactions.js
var app=getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item:{
      type:Object,
      value:{}
    }
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
    switchPage: function (e) {
      app.globalData.urlContentId = this.data.item.contentId;
      wx.navigateTo({ url: `../transactionDetail/transactionDetail?theId=${this.data.item.contentId}` });

    }
  }
})
