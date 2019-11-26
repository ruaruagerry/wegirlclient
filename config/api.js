const ApiRootUrl = 'https://www.gerryluo.com/wegirl';

module.exports = {
    AuthLogin: ApiRootUrl + '/auth/login', //登录

    HomeGetTags: ApiRootUrl + '/home/tags',  //获取分类框
    HomeGetGirls: ApiRootUrl + '/home/girls' //获取女孩
};