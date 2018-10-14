//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
  globalData: {
    openid: null
  },
  onLaunch: function() {
    this.getuid()
  },
  getuid: function () {
    var that = this
    wx.login({
      success: function (res) {
        console.log(res)
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' +
            `${config.service.appid}` +
            '&secret=' + `${config.service.appSecret}` + '&js_code=' + res.code + '&grant_type=authorization_code',
          success(res) {
            console.log(res.data.openid, `${config.service.openid}`)
            if (res.data.openid == `${config.service.openid}`) {
              that.globalData.openid = res.data.openid
            }
            return res.data.openid
          },
        })
      }
    })
  },
})