// components/bookItem/bookItem.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item:{
      type: Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  lifetimes:{
    ready(){
      var cat = app.globalData.allCategory[this.data.item.book_category].content
      this.setData({category:cat})
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
