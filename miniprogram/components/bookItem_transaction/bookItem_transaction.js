// components/bookItem_transition/bookitem_transition.js
var app = getApp();
var db = wx.cloud.database();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    category:""
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
  //   switchPage: function (e) {
  //     app.globalData.urlcontentId = this.data.item.contentId;
  //     wx.navigateTo({ url: `../transactionDetail/transactionDetail?thecontentId=${this.data.item.contentId}` });
  // }

  //检查该本书是否在库，如果不在则给出提示并删除
  checkIn: async function(){
    var that = this
    db.collection("book").doc(this.data.item._id).get().then(res =>{
      if(res.data.book_state==1 || res.data.book_state==-1){
          //如果该书处于可以交易的状态，那么就直接点进去
          var temp = {}
          temp.doc = this.data.item._id
          temp.state = 1; //1代表进入
          app.globalData.nowItemForDetailInfo = this.data.item
          that.triggerEvent('isIn',temp)
      }
      else if(res.data.book_state==0){
        wx.showToast({
          title: '此书已于刚刚被置为已交易状态',
          icon:'none',
          duration:2000
        })
        var temp = {}
        temp.doc = this.data.item._id
        temp.state = 0; //0代表不进入 
        that.triggerEvent('isIn',temp)       
      }
      else if(res.data.book_state==-2){
        wx.showToast({
          title: '此书已于刚刚被置为已共享状态',
          icon:'none',
          duration:2000
        })
        var temp = {}
        temp.doc = this.data.item._id
        temp.state = 0; //0代表不进入  
        that.triggerEvent('isIn',temp)          
      }
      else{
        wx.showToast({
          title: '此书已于刚刚被发布者删除',
          icon:'none',
          duration:2000
        })
        var temp = {}
        temp.doc = this.data.item._id
        temp.state = 0; //0代表不进入  
        that.triggerEvent('isIn',temp)    
      }
    })
  }
},
})
