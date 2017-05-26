var bind = document.getElementById('bind');

var nameinfo = document.getElementById('nameinfo');
var phoneinfo = document.getElementById('phoneinfo');
var info = document.getElementById('info');

var form = document.getElementById('loginform');
var close = document.getElementById('close');
var word = document.getElementById('word');
var reg = document.getElementById('reg');
var tem = "";
var flag1 = false;
var flag2 = false;
bind.addEventListener("click", habdler);
form.name.addEventListener("blur", function () {
  var regx1 = /^[\u4e00-\u9fa5]{2,16}$/
  if (!regx1.test(form.name.value)) {
    nameinfo.innerHTML = "用户名需为两位以上的中文汉字<br/>"
    flag1 = false;
    if (!form.name.value) {
      nameinfo.innerHTML = ""
      flag1 = false;
    }
  } else {
    nameinfo.innerHTML = ""
    flag1 = true;

  }
  if (flag1 && flag2) {
    bind.style.background = '#23B39D';
  }

});
reg.addEventListener("click", function () {
  document.querySelector("body").style.transform = 'translateY(-100%)'
});
close.addEventListener("click", function () {
  form.name.value = '';
  form.name.focus();
});
form.phone.addEventListener("blur", function () {
  var regx2 = /^[\d]{11}$/
  if (!regx2.test(form.phone.value)) {
    phoneinfo.innerHTML = "请输入正确手机号<br/>"
    flag2 = false;
    if (!form.phone.value) {
      nameinfo.innerHTML = ""
      flag2 = false;
    }
  } else {
    phoneinfo.innerHTML = ""
    flag2 = true;
  }
  if (flag1 && flag2) {
    bind.style.background = '#23B39D';
  }
});

function habdler(event) {
  console.log(form.url.value)

  if (flag1 && flag2) {
    ajax({
      'data': 'loginform',
      "url": form.url.value,
      "success": function (res) {
        // info.innerHTML="绑定成功"
        if (res == 'success') {
         document.querySelector("body").style.transform = 'translateY(-200%)'
        } else if (res == 'alreadyexit') {
          info.innerHTML = "账号已被使用"
        } else if (res == 'nameBeused') {
          info.innerHTML = "用户名已被使用"
        } else if (res == 'wechatneed') {
          info.innerHTML = "请在微信端注册"
        }
      },
      "fail": function (err) {
        console.log(err)
      }
    })
  }



}
function ajax(options) {
  options = options || {};
  options.type = (options.type || "GET").toUpperCase();
  options.dataType = options.dataType || "json";
  var params = formatParams(options.data);

  //创建 - 非IE6 - 第一步
  if (window.XMLHttpRequest) {
    var xhr = new XMLHttpRequest();
  } else { //IE6及其以下版本浏览器
    var xhr = new ActiveXObject('Microsoft.XMLHTTP');
  }

  //接收 - 第三步
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      var status = xhr.status;
      if (status >= 200 && status < 300) {
        options.success && options.success(xhr.responseText, xhr.responseXML);
      } else {
        options.fail && options.fail(status);
      }
    }
  }

  //连接 和 发送 - 第二步
  if (options.type == "GET") {
    xhr.open("GET", options.url + "?" + params, true);
    xhr.send(null);
  } else if (options.type == "POST") {
    xhr.open("POST", options.url, true);
    //设置表单提交时的内容类型
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(params);
  }
}
//格式化参数
function formatParams(formId) {
  var form = document.getElementById(formId);
  var tagElements = form.getElementsByTagName('input');
  var arr = [];
  for (var i = 0; i < tagElements.length; i++) {
    arr.push(encodeURIComponent(tagElements[i].name) + "=" + encodeURIComponent(tagElements[i].value));
  }
  arr.push(("v=" + Math.random()).replace(".", ""));
  return arr.join("&");
}

