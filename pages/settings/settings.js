//index.js
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp()

Page({
    data: {
        userInfo: app.globalData.userinfo,
    },
    onLoad: function () {
        // 页面初始化 options为页面跳转所带来的参数
        if (!app.globalData.token) {
            util.getUserInfo().then((res) => {
                var e = { "detail": res }
                this.onWechatLogin(e)
            });
        }
    },
    onWechatLogin (e) {
        if (e.detail.errMsg !== 'getUserInfo:ok') {
            if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
                return false
            }
            wx.showToast({
                title: '微信登录失败',
            })
            return false
        }
        util.login().then((res) => {
            return util.request(api.AuthLogin, {
                code: res,
                encrypteddata: e.detail.encryptedData,
                iv: e.detail.iv
            }, 'POST');
        }).then((res) => {
            // 设置用户信息
            this.setData({
                userInfo: res.userinfo,
            });

            app.globalData.token = res.token
            app.globalData.userinfo = res.userinfo

        }).catch((err) => {
            console.log(err)
        })
    },
})
