const ApiRootUrl = 'http://127.0.0.1:3002';

module.exports = {
    AuthLogin: ApiRootUrl + '/auth/login', //登录

    HomeGetTags: ApiRootUrl + '/home/tags',  //获取分类框
    HomeGetGirls: ApiRootUrl + '/home/girls' //获取女孩
};