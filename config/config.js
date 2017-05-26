var config = {
  'dev': {
    "wechat": {
      "appID": "wxadd60b36f84b1125",
      "appSecret": "23da8b5ab1c71876b78484d711ad6568",
      "prefix": "https://api.weixin.qq.com/cgi-bin/",
      "token": "access_token",
      'Website': "http://w16866w571.iask.in/",
      'template_id': 'ziub7EDsmBpVluXE-JemFWBjkoG3PEBPhnMcbzEnJ10',

    },
    db: 'mongodb://localhost/devdb',
    password: 'password',
    'AllowOrigin': "http://localhost:4200",
    'uploadDir': './uploads/',
    'ajaxurl': 'http://w16866w571.iask.in/users/bind',
  },

  'prod': {
    "wechat": {
      "appID": "wxadd60b36f84b1125",
      "appSecret": "23da8b5ab1c71876b78484d711ad6568",
      "prefix": "https://api.weixin.qq.com/cgi-bin/",
      "token": "access_token",
      'Website': "http://www.byshglyxgs.com/",
      'template_id': 'ziub7EDsmBpVluXE-JemFWBjkoG3PEBPhnMcbzEnJ10',
    },
    db: 'mongodb://localhost/devdb',
    password: 'password',
    'AllowOrigin': "http://www.byshglyxgs.com/",
    'uploadDir': './uploads/',
    'ajaxurl': 'http://www.byshglyxgs.com/users/bind',
  },
  'test': {
    "wechat": {
      "appID": "wx81230a7546313c08",
      "appSecret": "553515ac8e2ea45387caa15688a6c8a5",
      "prefix": "https://api.weixin.qq.com/cgi-bin/",
      "token": "access_token",
       'Website': "http://www.byshglyxgs.com/",
      'template_id': 'vbMlf8pTOY2Myh66m99CNPvu7xj_RTVSsOv4cc3Edps',
    },
    db: 'mongodb://localhost/devdb',
    password: 'password',
    'AllowOrigin': "http://www.notifysystem.trade",
    'uploadDir': './uploads/',
    'ajaxurl': 'http://www.notifysystem.trade/users/bind',
  }
  /*
  'prod': {
    "wechat": {
      "appID": "wx81230a7546313c08",
      "appSecret": "553515ac8e2ea45387caa15688a6c8a5",
      "prefix": "https://api.weixin.qq.com/cgi-bin/",
      "token": "access_token",
      'Website': "http://www.notifysystem.trade/"
    },
    db: 'mongodb://localhost/devdb',
    password: 'password',
    'AllowOrigin': "http://www.notifysystem.trade",
    'uploadDir': './uploads/',
    'ajaxurl':'http://www.notifysystem.trade/users/bind',
  }*/
};
let env = process.env.NODE_ENV;

if (env == 'dev') {
  module.exports = config.dev;
  console.log("running in dev mode ")
} else if (env == 'test') {
  module.exports = config.test;
  console.log("running in test mode ")
} else {
  module.exports = config.prod;
  console.log("running in prod mode ")
}



