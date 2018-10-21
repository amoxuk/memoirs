var config = require('../../config')
Page({
  data: {
    title: null,
    content: null,
    nickName: "",
    location: "",
    wordNum:"0",
    target: {
      hasNickName: false,
      hasLocation: false,
    }
  },
  onLoad: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              console.log(res.userInfo.nickName)
              that.setNickName(res.userInfo.nickName);
            }
          })
        }
      }
    });

    wx.authorize({
      scope: "scope.userLocation"
    });
    wx.chooseLocation({
      success: function(res) {
        if (!res.address) {
          console.log(res.address)
          wx.showToast({
            title: "选择失败 请重新选择",
            icon: "none"
          })
          return;
        }
        console.log(res)
        that.setLocation(res.address);
      },
      fail: function(res) {
        console.log(res)
        wx.showModal({
          confirmColor: '#ed6b9f',
          title: "地址获取失败，点击选择位置获取"
        })
      }
    })
  },
  showTopTips: function() {
    var tmpData = this.data;
    delete tmpData.target
    wx.request({
      url: `${config.service.memoirs}`, //仅为示例，并非真实的接口地址
      data: tmpData,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        if (res.data.code == 1) {
          wx.navigateTo({
            url: '/pages/index/index',
          })
          return
        }else{
          wx.showModal({
            title: "发布结果",
            content: res.data.msg,
            cancelText: '取消发布',
            confirmText: '修改发布',
            confirmColor: '#ed6b9f',
            success(res) {
              if (res.confirm) {
                console.log("close dialog")
              } else {
                wx.navigateTo({
                  url: '/pages/index/index',
                })
              }
            }
          })
        }
      }
    })
  },
  getLocation: function(e) {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        console.log(res.address)
        if (!res.address) {
          wx.showToast({
            title: "选择失败 请重新选择",
            icon: "none",
          })
          return;
        }
        that.setLocation(res.address);
      },
      fail: function(res) {
        console.log(res)
      },
      complete: function(res) {
        console.log(res)
      }
    })
  },
  onGotUserInfo: function(e) {
    //console.log(e.detail.errMsg)
    console.log(e.detail.userInfo.nickName)
    this.setNickName(e.detail.userInfo.nickName)
    //console.log(e.detail.rawData)
  },
  //=======================================
  //==========配置获取的用户信息============
  setNickName: function(nickname) {
    this.setData({
      nickName: nickname,
      'target.hasNickName': true
    });
  },

  setLocation: function(location) {
    this.setData({
      location: location,
      'target.hasLocation': true
    })
  },
  //=======================================
  contentInput: function(e) {
    this.setData({
      wordNum: e.detail.value.length,
      content: e.detail.value
    })
  },
  titleInput: function(e) {
    this.setData({
      title: e.detail.value
    });
  }
});