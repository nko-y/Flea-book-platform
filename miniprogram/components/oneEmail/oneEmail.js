// components/oneEmail/oneEmail.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item:{
      type: Object,
      value:{}
    },
    isOperating:{
      type:Boolean,
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
    dE: async function(){
      if(this.data.isOperating==true) return
      var that = this
      var tempItem = this.data.item;
      wx.showModal({
        title: '提示',
        content: '确认要删除此封邮件?',
        success: function(res){
          that.triggerEvent('deleteTheEmail',that.data.item);
        }
      })
    }
  }
})
