// components/myReleases/myReleases.js
var util = require('../../utils/util.js');
var db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
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
    //将待交易更改为已交易
    finished:async function(){
      if(this.data.isOperating) return
      var that = this;
      var tempItem = this.data.item;
      that.triggerEvent('startOperation');
      wx.showModal({
        title: "提示",
        content: "确认要更改状态为已交易吗?",
        success: function (res) {
          if (res.confirm) {
            tempItem.book_state = 0;
            that.setData({item:tempItem});
            var finTime = util.formatDate(new Date());
            var findetailTime = util.formatDetail(new Date());
            db.collection("book").doc(that.data.item._id).update({
              data:{
                book_state:0,
                book_createTime:finTime,
                book_detailTime:findetailTime
              }
            })
            .then(res => {
              that.triggerEvent('finished', tempItem);
            })
          }
          else{
            that.triggerEvent('endOperation')
          }
        }
      })
    },
    
    //将已交易撤回为待交易
    back:async function () {
      if(this.data.isOperating) return
      var that = this;
      var tempItem = this.data.item;
      that.triggerEvent('startOperation');
      wx.showModal({
        title: "提示",
        content: "确认要更改状态为待交易吗?",
        success: function (res) {
          if (res.confirm) {
            tempItem.book_state = 1;
            that.setData({ item: tempItem });
            var finTime = util.formatDate(new Date());
            var findetailTime = util.formatDetail(new Date());
            db.collection("book").doc(that.data.item._id).update({
              data:{
                book_state:1,
                book_createTime:finTime,
                book_detailTime:findetailTime
              }
            }).then(res=>{
              that.triggerEvent('back', tempItem);
            })
          }
          else{
            that.triggerEvent('endOperation')
          }
        }
      })
    },

    //删除该条记录
    deleteOne: async function(){
      if(this.data.isOperating) return
      var that = this;
      var tempItem = this.data.item;
      that.triggerEvent('startOperation');
      wx.showModal({
        title: '提示',
        content: '确认要删除该条记录吗?',
        success: function(res){
          if(res.confirm){
            db.collection("book").doc(that.data.item._id).remove({
              success:function(res){
                wx.cloud.deleteFile({
                  fileList:that.data.item.ori,
                  success:function(res){
                    that.triggerEvent('deleteOB',tempItem);
                  }
                })
              }
            })
          }
          else{
            that.triggerEvent('endOperation')
          }
        }
      })
    },
  }
})
