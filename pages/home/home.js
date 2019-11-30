//index.js
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp()

Page({
    data: {
        showLoading: false,
        loadingMessage: '',
        showToast: false,
        toastMessage: '',
        imgList: [],
        layoutList: [],
        layoutColumnSize: 3,
        previewing: false,
        previewIndex: 0,
        showingActionsSheet: false,
        inActionImgUrl: '',
        tags: [],
        navBtnSelectIdx: 0,
        page: 1,
        hasMore: true,
        scrollTop: 1,
        showLoadMore: false
    },
    showLoading (message) {
        this.setData({ showLoading: true, loadingMessage: message });
    },
    hideLoading () {
        this.setData({ showLoading: false, loadingMessage: '' });
    },
    showToast (toastMessage) {
        this.setData({ showToast: true, toastMessage });
    },
    hideToast () {
        this.setData({ showToast: false, toastMessage: '' });
    },
    renderImgList () {
        let layoutColumnSize = this.data.layoutColumnSize;
        let layoutList = [];
        if (this.data.imgList.length) {
            layoutList = util.matrixArr((this.data.imgList), layoutColumnSize);
            let lastRow = layoutList[layoutList.length - 1];
            if (lastRow.length < layoutColumnSize) {
                let supplement = Array(layoutColumnSize - lastRow.length).fill(0);
                lastRow.push(...supplement);
            }
        }
        this.setData({ layoutList });
    },
    fetchTags () {
        this.showLoading('loading...');
        return util.request(api.HomeGetTags)
    },
    fetchImgs (cid) {
        this.showLoading('loading...');
        var params = {
            cid: !util.isEmpty(cid) ? cid : "0",
            page: this.data.page,
        }
        return util.request(api.HomeGetGirls, params, "POST")
    },
    showPreview (event) {
        if (this.data.showActionsSheet) {
            return;
        }
        let index = event.target.dataset.index;
        if (index > this.data.imgList.length - 1) {
            return;
        }
        // let previewIndex = this.data.imgList[index];
        this.setData({ previewing: true, previewIndex: index });
    },
    dismissPreview () {
        if (this.data.showingActionsSheet) {
            return;
        }
        this.setData({ previewing: false, previewIndex: 0 });
    },
    dismissActionSheet () {
        this.setData({ showingActionsSheet: false, inActionImgUrl: '' });
    },
    showActionSheet (event) {
        this.setData({ showingActionsSheet: true, inActionImgUrl: event.target.dataset.large });
    },
    saveImage () {
        this.showLoading('saving image...');
        console.log('download_image_url', this.data.inActionImgUrl);

        wx.downloadFile({
            url: this.data.inActionImgUrl,
            type: 'image',
            success: (resp) => {
                wx.saveFile({
                    tempFilePath: resp.tempFilePath,
                    success: (resp) => {
                        this.showToast('save successfully...');
                    },
                    fail: (resp) => {
                        console.log('failed to save, try again...', resp);
                    },
                    complete: (resp) => {
                        console.log('complete', resp);
                        this.hideLoading();
                    },
                });
            },

            fail: (resp) => {
                console.log('fail', resp);
            },
        });
        this.setData({ showingActionsSheet: false, inActionImgUrl: '' });
    },
    scroll (e) {
        this.setData({ scrollTop: e.detail.scrollTop });
    },
    tagTap (e) {
        this.setData({
            scrollTop: -39,
        });
        let index = e.target.dataset.index;
        let cid = e.target.dataset.cid;
        if (index != this.navBtnSelectIdx) {
            this.setData({ navBtnSelectIdx: index, page: 1 });
            this.fetchImgs(cid).then(resp => {
                this.imgRespHandler(resp, true);
            });
        }
    },
    imgRespHandler (resp, flush) {
        this.hideLoading();
        if (util.isEmpty(resp.imgs)) {
            this.setData({ hasMore: false });
            this.showToast('all loaded...');
            this.setData({ page: this.data.page-- });
            return;
        }
        this.showToast('load successfully');
        for (var index in resp.imgs) {
            resp.imgs[index].large = util.imgUrlFix(resp.imgs[index].large);
            resp.imgs[index].thumb = util.imgUrlFix(resp.imgs[index].thumb);
            resp.imgs[index].small = util.imgUrlFix(resp.imgs[index].small);
        }
        this.setData({ 'imgList': flush ? resp.imgs : this.data.imgList.concat(resp.imgs) });
        this.renderImgList();
    },
    onPullDownRefresh () {
        this.loadImgData(true);
    },
    loadMoreEvent () {
        this.setData({
            showLoadMore: true,
            page: this.data.page + 1
        });
        this.loadImgData(false);
    },
    loadImgData (flush) {
        var cid;
        if (!util.isEmpty(this.data.tags)) {
            cid = this.data.tags[this.data.navBtnSelectIdx].cid;
        }
        this.fetchImgs(cid).then((resp) => {
            this.imgRespHandler(resp, flush);
        });
    },
    loadTagData () {
        this.fetchTags().then((resp) => {
            this.hideLoading();
            this.setData({ 'tags': resp.tags });
        });
    },
    onShow () {
        if (this.data.imgList.length == 0 && app.globalData.token) {
            console.log("fuck enter")
            this.renderImgList();
            this.loadTagData();
            this.loadImgData();
        } else {
            wx.switchTab({
                url: '/pages/settings/settings'
            });
            util.showErrorToast("请先登录")
        }
    }
})
