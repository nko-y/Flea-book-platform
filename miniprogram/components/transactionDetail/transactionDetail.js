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
    cate:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {


    
  },

  lifetimes:{
    ready: function(){
      this.setData({cate:app.globalData.allCategory})
    }
  }
})
