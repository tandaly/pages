var Public = Public || {};
var Business = Business || {};
Public.isIE6 = !window.XMLHttpRequest;	//ie6

$(function(){
	//菜单按钮
	$('.ui-btn-menu .menu-btn').on('click.menuEvent',function(e){
		if($(this).hasClass("ui-btn-dis")) {
			return false;
		}
		$(this).parent().toggleClass('ui-btn-menu-cur');
		$(this).blur();
		e.preventDefault();
	});
	$(document).on('click.menu',function(e){
		var target  = e.target || e.srcElement;
		$('.ui-btn-menu').each(function(){
			var menu = $(this);
			if($(target).closest(menu).length == 0 && $('.con',menu).is(':visible')){
				 menu.removeClass('ui-btn-menu-cur');
			}
		})
	});
});

//设置表格宽高
Public.setGrid = function(adjustH, adjustW){
	var adjustH = adjustH || 65;
	var adjustW = adjustW || 20;
	var gridW = $(window).width() - adjustW, gridH = $(window).height() - $(".grid-wrap").offset().top - adjustH;
	return {
		w : gridW,
		h : gridH
	}
};
//重设表格宽高
Public.resizeGrid = function(adjustH, adjustW){
	var grid = $("#grid");
	var gridWH = Public.setGrid(adjustH, adjustW);
	grid.jqGrid('setGridHeight', gridWH.h);
	grid.jqGrid('setGridWidth', gridWH.w);
};
//自定义报表宽度初始化以及自适应
Public.initCustomGrid = function(tableObj){
	//去除报表原始定义的宽度
	$(tableObj).css("width") && $(tableObj).attr("width","auto");
	//获取报表宽度当做最小宽度
	var _minWidth = $(tableObj).outerWidth();
	$(tableObj).css("min-width",_minWidth+"px");
	//获取当前window对象的宽度作为报表原始的宽度
	$(tableObj).width($(window).width() - 74);
	//设置resize事件
	var _throttle = function(method,context){
		clearTimeout(method.tid);
		method.tid = setTimeout(function(){
			method.call(context);
		},100)
	};
	var _resize = function(){
		$(tableObj).width($(window).width() - 74);
	};
	$(window).resize(function() {
		_throttle(_resize);
	});
}

//操作项格式化，适用于有“修改、删除”操作的表格
Public.operFmatter = function (val, opt, row) {
	var html_con = '<div class="operating" data-id="' + row.id + '"><span class="ui-icon ui-icon-pencil" title="修改"></span><span class="ui-icon ui-icon-trash" title="删除"></span></div>';
	return html_con;
};

Public.billsOper = function (val, opt, row) {
	var html_con = '<div class="operating" data-id="' + opt.rowId + '"><span class="ui-icon ui-icon-plus" title="新增行"></span><span class="ui-icon ui-icon-trash" title="删除行"></span></div>';
	return html_con;
};

Public.dateCheck = function(){
	$('.ui-datepicker-input').bind('focus', function(e){
		$(this).data('original', $(this).val());
	}).bind('blur', function(e){
		var reg = /((^((1[8-9]\d{2})|([2-9]\d{3}))(-)(10|12|0?[13578])(-)(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(11|0?[469])(-)(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(0?2)(-)(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)(-)(0?2)(-)(29)$)|(^([3579][26]00)(-)(0?2)(-)(29)$)|(^([1][89][0][48])(-)(0?2)(-)(29)$)|(^([2-9][0-9][0][48])(-)(0?2)(-)(29)$)|(^([1][89][2468][048])(-)(0?2)(-)(29)$)|(^([2-9][0-9][2468][048])(-)(0?2)(-)(29)$)|(^([1][89][13579][26])(-)(0?2)(-)(29)$)|(^([2-9][0-9][13579][26])(-)(0?2)(-)(29)$))/;
		var _self = $(this);
		setTimeout(function(){
			if(!reg.test(_self.val())) {
				parent.Public.tips({type:1, content : '日期格式有误！如：2013-08-08。'});
				_self.val(_self.data('original'));
			};
		}, 10)

	});
}

//根据之前的编码生成下一个编码
Public.getSuggestNum = function(prevNum){
	if (prevNum == '' || !prevNum) {
		return '';
	}
	var reg = /^([a-zA-Z0-9\-_]*[a-zA-Z\-_]+)?(\d+)$/;
	var match = prevNum.match(reg);
	if (match) {
		var prefix = match[1] || '';
		var prevNum = match[2];
		var num = parseInt(prevNum, 10) + 1;
		var delta = prevNum.toString().length - num.toString().length;
		if (delta > 0) {
			for (var i = 0; i < delta; i++) {
				num = '0' + num;
			}
		}
		return prefix + num;
	} else {
		return '';
	}
};

Public.bindEnterSkip = function(obj, func){
	var args = arguments;
	$(obj).on('keydown', 'input:visible:not(:disabled)', function(e){
		if (e.keyCode == '13') {
			var inputs = $(obj).find('input:visible:not(:disabled)');
			var idx = inputs.index($(this));
			idx = idx + 1;
			if (idx >= inputs.length) {
				if (typeof func == 'function') {
					var _args = Array.prototype.slice.call(args, 2 );
					func.apply(null,_args);
				}
			} else {
				inputs.eq(idx).focus();
			}
		}
	});
};

/*获取URL参数值*/
Public.getRequest = Public.urlParam = function() {
   var param, url = location.search, theRequest = {};
   if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      strs = str.split("&");
      for(var i = 0, len = strs.length; i < len; i ++) {
		 param = strs[i].split("=");
         theRequest[param[0]]=decodeURIComponent(param[1]);
      }
   }
   return theRequest;
};
/*
  通用post请求，返回json
  url:请求地址， params：传递的参数{...}， callback：请求成功回调
*/ 
Public.ajaxPost = function(url, params, callback){    
	$.ajax({  
	   type: "POST",
	   url: url,
	   data: params, 
	   dataType: "json",  
	   success: function(data, status){  
		   callback(data);  
	   },  
	   error: function(err){  
			parent.Public.tips({type: 1, content : '操作失败了哦，请检查您的网络链接！'});
	   }  
	});  
};  
Public.ajaxGet = function(url, params, callback){    
	$.ajax({  
	   type: "GET",
	   url: url,
	   dataType: "json",  
	   data: params,    
	   success: function(data, status){  
		   callback(data);  
	   },   
	   error: function(err){  
			parent.Public.tips({type: 1, content : '操作失败了哦，请检查您的网络链接！'});
	   }  
	});  
};
/*操作提示*/
Public.tips = function(options){ return new Public.Tips(options); }
Public.Tips = function(options){
	var defaults = {
		renderTo: 'body',
		type : 0,
		autoClose : true,
		removeOthers : true,
		time : undefined,
		top : 15,
		onClose : null,
		onShow : null
	}
	this.options = $.extend({},defaults,options);
	this._init();
	
	!Public.Tips._collection ?  Public.Tips._collection = [this] : Public.Tips._collection.push(this);
	
}

Public.Tips.removeAll = function(){
	try {
		for(var i=Public.Tips._collection.length-1; i>=0; i--){
			Public.Tips._collection[i].remove();
		}
	}catch(e){}
}

Public.Tips.prototype = {
	_init : function(){
		var self = this,opts = this.options,time;
		if(opts.removeOthers){
			Public.Tips.removeAll();
		}

		this._create();

		this.closeBtn.bind('click',function(){
			self.remove();
		});

		if(opts.autoClose){
			time = opts.time || opts.type == 1 ? 5000 : 3000;
			window.setTimeout(function(){
				self.remove();
			},time);
		}

	},
	
	_create : function(){
		var opts = this.options;
		this.obj = $('<div class="ui-tips"><i></i><span class="close"></span></div>').append(opts.content);
		this.closeBtn = this.obj.find('.close');
		
		switch(opts.type){
			case 0 : 
				this.obj.addClass('ui-tips-success');
				break ;
			case 1 : 
				this.obj.addClass('ui-tips-error');
				break ;
			case 2 : 
				this.obj.addClass('ui-tips-warning');
				break ;
			default :
				this.obj.addClass('ui-tips-success');
				break ;
		}
		
		this.obj.appendTo('body').hide();
		this._setPos();
		if(opts.onShow){
				opts.onShow();
		}

	},

	_setPos : function(){
		var self = this, opts = this.options;
		if(opts.width){
			this.obj.css('width',opts.width);
		}
		var h =  this.obj.outerHeight(),winH = $(window).height(),scrollTop = $(window).scrollTop();
		//var top = parseInt(opts.top) ? (parseInt(opts.top) + scrollTop) : (winH > h ? scrollTop+(winH - h)/2 : scrollTop);
		var top = parseInt(opts.top) + scrollTop;
		this.obj.css({
			position : Public.isIE6 ? 'absolute' : 'fixed',
			left : '50%',
			top : top,
			zIndex : '9999',
			marginLeft : -self.obj.outerWidth()/2	
		});

		window.setTimeout(function(){
			self.obj.show().css({
				marginLeft : -self.obj.outerWidth()/2
			});
		},150);

		if(Public.isIE6){
			$(window).bind('resize scroll',function(){
				var top = $(window).scrollTop() + parseInt(opts.top);
				self.obj.css('top',top);
			})
		}
	},

	remove : function(){
		var opts = this.options;
		this.obj.fadeOut(200,function(){
			$(this).remove();
			if(opts.onClose){
				opts.onClose();
			}
		});
	}
};
//数值显示格式转化
Public.numToCurrency = function(val, dec) {
	val = parseFloat(val);	
	dec = dec || 2;	//小数位
	if(val === 0 || isNaN(val)){
		return '';
	}
	val = val.toFixed(dec).split('.');
	var reg = /(\d{1,3})(?=(\d{3})+(?:$|\D))/g;
	return val[0].replace(reg, "$1,") + '.' + val[1];
};
//数值显示
Public.currencyToNum = function(val){
	var val = String(val);
	if ($.trim(val) == '') {
		return 0;
	}
	val = val.replace(/,/g, '');
	val = parseFloat(val);
	return isNaN(val) ? 0 : val;
};
//只允许输入数字
Public.numerical = function(e){
	var allowed = '0123456789.-', allowedReg;
	allowed = allowed.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	allowedReg = new RegExp('[' + allowed + ']');
	var charCode = typeof e.charCode != 'undefined' ? e.charCode : e.keyCode; 
	var keyChar = String.fromCharCode(charCode);
	if(!e.ctrlKey && charCode != 0 && ! allowedReg.test(keyChar)){
		e.preventDefault();
	};
};

//限制只能输入允许的字符，不支持中文的控制
Public.limitInput = function(obj, allowedReg){
    var ctrlKey = null;
    obj.css('ime-mode', 'disabled').on('keydown',function(e){
        ctrlKey = e.ctrlKey;
    }).on('keypress',function(e){
        allowedReg = typeof allowedReg == 'string' ? new RegExp(allowedReg) : allowedReg;
        var charCode = typeof e.charCode != 'undefined' ? e.charCode : e.keyCode; 
        var keyChar = $.trim(String.fromCharCode(charCode));
        if(!ctrlKey && charCode != 0 && charCode != 13 && !allowedReg.test(keyChar)){
            e.preventDefault();
        } 
    });
};
//限制输入的字符长度
Public.limitLength = function(obj, count){
	obj.on('keyup',function(e){
        if(count < obj.val().length){
        	e.preventDefault();
        	obj.val(obj.val().substr(0,count));
        }
    });
};
/*批量绑定页签打开*/
Public.pageTab = function() {
	$(document).on('click', '[rel=pageTab]', function(e){
		e.preventDefault();
		var right = $(this).data('right');
		if (right && !Business.verifyRight(right)) {
			return false;
		};
		var tabid = $(this).attr('tabid'), url = $(this).attr('href'), showClose = $(this).attr('showClose'), text = $(this).attr('tabTxt') || $(this).text(),parentOpen = $(this).attr('parentOpen');
		if(parentOpen){
			parent.tab.addTabItem({tabid: tabid, text: text, url: url, showClose: showClose});
		} else {
			tab.addTabItem({tabid: tabid, text: text, url: url, showClose: showClose});
		}
	});
};

$.fn.artTab = function(options) {
  var defaults = {};
  var opts = $.extend({}, defaults, options);
  var callback = opts.callback || function () {};
  this.each(function(){
	  var $tab_a =$("dt>a",this);
	  var $this = $(this);
	  $tab_a.bind("click", function(){
		  var target = $(this);
		  target.siblings().removeClass("cur").end().addClass("cur");
		  var index = $tab_a.index(this);
		  var showContent = $("dd>div", $this).eq(index);
		  showContent.siblings().hide().end().show();
		  callback(target, showContent, opts);
	  });
	  if(opts.tab)
		  $tab_a.eq(opts.tab).trigger("click");
	  if(location.hash) {
		  var tabs = location.hash.substr(1);
		  $tab_a.eq(tabs).trigger("click");
	  }
  });	  
};

//文本列表滚动
Public.txtSlide = function(opt){
	var def = {
		notice: '#notices > ul',
		size: 1, //显示出来的条数
		pause_time: 5000, //每次滚动后停留的时间
		speed: 'normal', //滚动动画执行的时间
		stop: true //鼠标移到列表时停止动画
	};
	opt = opt || {};
	opt = $.extend({}, def, opt);

	var $list = $(opt.notice),
		$lis = $list.children(),
		height = $lis.eq(0).outerHeight() * opt.size,
		interval_id;
	if($lis.length <= opt.size) return;
	interval_id = setInterval(begin, opt.pause_time);

	opt.stop && $list.on({
		'mouseover': function(){
			clearInterval(interval_id);
			$list.stop(true,true);
		},
		'mouseleave': function(){
			interval_id = setInterval(begin, opt.pause_time);
		}
	});

	function begin(){
		$list.stop(true, true).animate({marginTop: -height}, opt.speed, function(){
			for(var i=0; i<opt.size; i++){
				$list.append($list.find('li:first'));
			}
			$list.css('margin-top', 0);
		});
	}
};

$.fn.enterKey = function() {
	this.each(function() {
		$(this).keydown(function(e) {
			if (e.which == 13) {
				var ref = $(this).data("ref");
				if (ref) {
					$('#' + ref).select().focus().click();
				}
				else {
					eval($(this).data("enterKeyHandler"));
				}
			}
		});
	});
};


//input占位符
$.fn.placeholder = function(){
	this.each(function() {
		$(this).focus(function(){
			if($.trim(this.value) == this.defaultValue){
				this.value = '';
			}
			$(this).removeClass('ui-input-ph');
		}).blur(function(){
			var val = $.trim(this.value);
			if(val == '' || val == this.defaultValue){
				$(this).addClass('ui-input-ph');
			}
			val == '' && $(this).val(this.defaultValue);
		});
	});
};

//单选框插件
$.fn.cssRadio = function(opts){
	var opts = $.extend({}, opts);
	var $_radio = $('label.radio', this), $_this = this;
	$_radio.each(function() {
		var self = $(this);
		if (self.find("input")[0].checked) {
			self.addClass("checked");
		};

	}).hover(function() {
		$(this).addClass("over");
	}, function() {
		$(this).removeClass("over");
	}).click(function(event) {
		$_radio.find("input").removeAttr("checked");
		$_radio.removeClass("checked");
		$(this).find("input").attr("checked", "checked");
		$(this).addClass("checked");
		opts.callback($(this));
	});
	return {
		getValue: function() {
			return $_radio.find("input[checked]").val();
		},
		setValue: function(index) {
			return $_radio.eq(index).click();
		}
	}
};
//复选框插件
$.fn.cssCheckbox = function() {
	var $_chk = $(".chk", this);
	$_chk.each(function() {
		if ($(this).find("input")[0].checked) {
			$(this).addClass("checked");
		};
		if ($(this).find("input")[0].disabled) {
			$(this).addClass("dis_check");
		};
	}).hover(function() {
		$(this).addClass("over")
	}, function() {
		$(this).removeClass("over")
	}).click(function(event) {
		if ($(this).find("input")[0].disabled) {
			return;
		};
		$(this).toggleClass("checked");
		$(this).find("input")[0].checked = !$(this).find("input")[0].checked;
		event.preventDefault();
	});
	
	return {
		chkAll:function(){
			$_chk.addClass("checked");
			$_chk.find("input").attr("checked","checked");
		},	
		chkNot:function(){
			$_chk.removeClass("checked");
			$_chk.find("input").removeAttr("checked");
		},
		chkVal:function(){
			var val = [];
			$_chk.find("input:checked").each(function() {
            	val.push($(this).val());
        	});
			return val;
		}
	}
};

Public.getDefaultPage = function(){
	var win = window.self;
	do{
		if (win.CONFIG) {
			return win;
		}
		win = win.parent;
	} while(true);
};

//权限验证
Business.verifyRight = function(right){
	var system = Public.getDefaultPage().SYSTEM;
	var isAdmin = system.isAdmin;
	var siExperied = system.siExpired;
	var rights = system.rights;
	if (isAdmin && !siExperied) {
		return true;
	};

	if(siExperied) {
		if(rights[right]) {
			return true;
		} else {
			var html = [
				'<div class="ui-dialog-tips">',
				'<h4 class="tit">您购买的服务已过期哦！</h4>',
				'<p>请联系400-830-0755进行续费。</p>',
				'</div>'
			].join('');
			$.dialog({
				width: 240,
				title: '系统提示',
				icon: 'alert.gif',
				fixed: true,
				lock: true,
				resize: false,
				ok: true,
				content: html
			});
			return false;
		}
	} else {
		if (rights[right]) {
			return true;
		} else {
			var html = [
				'<div class="ui-dialog-tips">',
				'<h4 class="tit">您没有该功能的使用权限哦！</h4>',
				'<p>请联系管理员为您授权！</p>',
				'</div>'
			].join('');
			$.dialog({
				width: 240,
				title: '系统提示',
				icon: 'alert.gif',
				fixed: true,
				lock: true,
				resize: false,
				ok: true,
				content: html
			});
			return false;
		}
	};
};

//获取文件
Business.getFile = function(url, args, isNewWinOpen){
	if (typeof url != 'string') {
		return ;
	}
	var url = url.indexOf('?') == -1 ? url += '?' : url;
	url += '&random=' + new Date().getTime();
	var downloadForm = $('form#downloadForm');
	if (downloadForm.length == 0) {
		downloadForm = $('<form method="post" />').attr('id', 'downloadForm').hide().appendTo('body');
	} else {
		downloadForm.empty();
	}
	downloadForm.attr('action', url);
	for( k in args){
		$('<input type="hidden" />').attr({name: k, value: args[k]}).appendTo(downloadForm);
	}
	if (isNewWinOpen) {
		downloadForm.attr('target', '_blank');
	} else{
		var downloadIframe = $('iframe#downloadIframe');
		if (downloadIframe.length == 0) {
			downloadIframe = $('<iframe />').attr('id', 'downloadIframe').hide().appendTo('body');
		}
		downloadForm.attr('target', 'downloadIframe');
	}
	downloadForm.trigger('submit');
};

Business.customerCombo = function($_obj, opts){
	if ($_obj.length == 0) { return };
	var opts = $.extend(true, {
		data: function(){
			return parent.SYSTEM.customerInfo;
		},
		ajaxOptions: {
			formatData: function(data){
				parent.SYSTEM.customerInfo = data.data.items;	//更新
				return data.data.items;
			}	
		},
		width: 200,
		height: 300,
		formatText: function(row){
			return row.number + ' ' + row.name;
		},
		//formatResult: 'name',
		text: 'name',
		value: 'id',
		defaultSelected: 0,
		defaultFlag: false,
		cache: false,
		editable: true,
		callback: {
			onChange: function(data){
			}
		},
		extraListHtml: '<a href="javascript:void(0);" id="quickAddCustomer" class="quick-add-link"><i class="ui-icon-add"></i>新增客户</a>'
	}, opts);
	
	var customerCombo = $_obj.combo(opts).getCombo();	
	//新增客户
	$('#quickAddCustomer').on('click', function(e){
		e.preventDefault();
		if (!Business.verifyRight('BU_ADD')) {
			return ;
		};
		$.dialog({
			title : '新增客户',
			content : 'url:/settings/customer-manage.jsp',
			data: {oper: 'add', callback: function(data, oper, dialogWin){
				//parent.getCustomer();
				//_self.customerCombo.selectByValue(data.id, false);
				customerCombo.loadData('/basedata/contact.do?action=list', ['id', data.id]);
				dialogWin && dialogWin.api.close();
			}},
			width : 640,
			height : 456,
			max : false,
			min : false,
			cache : false,
			lock: true
		});
	});
	return customerCombo;
};

Business.supplierCombo = function($_obj, opts){
	if ($_obj.length == 0) { return };
	var opts = $.extend(true, {
		data: function(){
			return parent.SYSTEM.supplierInfo;;
		},
		ajaxOptions: {
			formatData: function(data){
				parent.SYSTEM.supplierInfo = data.data.items;	//更新
				return data.data.items;
			}	
		},
		width: 200,
		height: 300,
		formatText: function(row){
			return row.number + ' ' + row.name;
		},
		//formatResult: 'name',
		text: 'name',
		value: 'id',
		defaultSelected: 0,
		defaultFlag: false,
		cache: false,
		editable: true,
		callback: {
			onChange: function(data){
			}
		},
		extraListHtml: '<a href="javascript:void(0);" id="quickAddVendor" class="quick-add-link"><i class="ui-icon-add"></i>新增供应商</a>'
	}, opts);
	
	var supplierCombo = $_obj.combo(opts).getCombo();	
	//新增供应商
	$('#quickAddVendor').on('click', function(e){
		e.preventDefault();
		if (!Business.verifyRight('PUR_ADD')) {
			return ;
		};
		$.dialog({
			title : '新增供应商',
			content : 'url:/settings/vendor-manage.jsp',
			data: {oper: 'add', callback: function(data, oper, dialogWin){
				//parent.getCustomer();
				//_self.customerCombo.selectByValue(data.id, false);
				supplierCombo.loadData('/basedata/contact.do?type=10&action=list', ['id', data.id]);
				dialogWin && dialogWin.api.close();
			}},
			width : 640,
			height : 496,
			max : false,
			min : false,
			cache : false,
			lock: true
		});
	});
	return supplierCombo;
};
//结算账户下拉框初始化
Business.settlementAccountCombo = function($_obj, opts){
	if ($_obj.length == 0) { return };
	var getInfo=(function(){
		Public.ajaxGet('/basedata/settAcctList.json', {}, function(data){
			if(data.status === 200) {
				parent.SYSTEM.settlementAccountInfo = data.data.items;
			} else if (data.status === 250){
				parent.SYSTEM.settlementAccountInfo = [];
			} else {
				Public.tips({type: 1, content : data.msg});
			}
		});
	})();
	var opts = $.extend(true, {
		data: function(){
			return parent.SYSTEM.settlementAccountInfo || [];
		},
		ajaxOptions: {
			formatData: function(data){
				parent.SYSTEM.settlementAccountInfo = data.data.items;	//更新
				return data.data.items;
			}	
		},
		width: 200,
		height: 300,
/*			formatText: function(row){
			return row.number + ' ' + row.name;
		},*/
		//formatResult: 'name',
		text: 'name',
		value: 'id',
		defaultSelected: -1,
		defaultFlag: false,
		cache: false,
		editable: true,
		callback: {
			onChange: function(data){
			}
		},
		extraListHtml: '<a href="javascript:void(0);" id="quickAddVendor" class="quick-add-link"><i class="ui-icon-add"></i>新增结算账户</a>'
	}, opts);
	
	var settlementAccountCombo = $_obj.combo(opts).getCombo();	
	//新增结算账户
	$('#quickAddVendor').on('click', function(e){
		e.preventDefault();
		if (!Business.verifyRight('SettAcct_ADD')) {
			return ;
		};
		$.dialog({
			title : '新增结算账户',
			content : 'url:/settings/settlementAccount-manage.jsp',
			data: {oper: 'add', callback: function(data, oper, dialogWin){
				parent.SYSTEM.settlementAccountInfo.push(data);
				settlementAccountCombo.loadData('/basedata/settAcct.do?action=query', ['id', data.id]);
				dialogWin && dialogWin.api.close();
			}},
			width : 640,
			height : 205,
			max : false,
			min : false,
			cache : false,
			lock: true
		});
	});
	return settlementAccountCombo;
};

Business.goodsCombo = function($_obj, opts){
	if ($_obj.length == 0) { return };
	var opts = $.extend(true, {
		data: function(){
			if(parent.SYSTEM.goodsInfo) {
				return parent.SYSTEM.goodsInfo;
			} else {
				return '/basedata/inventoryList.json';
			}
		},
		ajaxOptions: {
			formatData: function(data){
				parent.SYSTEM.goodsInfo = data.data.items;	//更新
				return data.data.items;
			}	
		},
		formatText: function(data){
			if(data.spec === '') {
				return data.number + ' ' + data.name;
			} else {
				return data.number + ' ' + data.name + '_' + data.spec;
			}
		},
		value: 'id',
		defaultSelected: -1,
		editable: true,
		extraListHtml: '<a href="javascript:void(0);" id="quickAddGoods" class="quick-add-link"><i class="ui-icon-add"></i>新增商品</a>',
		maxListWidth: 500,
		cache: false,
		forceSelection: true,
		maxFilter: 10,
		trigger: false,
		listHeight: 182,
		listWrapCls: 'ui-droplist-wrap',
		callback: {
			onChange: function(data){
				var parentTr = this.input.parents('tr');
				if(data) {
					parentTr.data('goodsInfo', data);
					parentTr.data('storageInfo', { id: data.locationId, name: data.localtionName});
				}
			},
			onListClick: function(){

			}
		},
		queryDelay: 0,
		inputCls: 'edit_subject',
		wrapCls: 'edit_subject_wrap',
		focusCls: '',
		disabledCls: '',
		activeCls: ''
	}, opts);
	
	var goodsCombo = $_obj.combo(opts).getCombo();
	
	//新增商品
	$('#quickAddGoods').on('click', function(e){
		e.preventDefault();
		if (!Business.verifyRight('INVENTORY_ADD')) {
			return ;
		};
		$.dialog({
			title : '新增商品',
			content : 'url:/settings/goods-manage.jsp',
			data: {oper: 'add', callback: function(data, oper, dialogWin){
				var goodID = data.id;
				//_self.goodsCombo.getAllRawData().push(data);
				parent.SYSTEM.goodsInfo.push(data);
				dialogWin && dialogWin.api.close();
				//var allRawData = _self.goodsCombo.getAllRawData();
				goodsCombo.loadData(parent.SYSTEM.goodsInfo, '-1', false);
				setTimeout( function() {
					 //$("#grid").jqGrid("editCell", editRow, 2, true)
					 goodsCombo.selectByValue(goodID, true);
					 $_obj.focus();
				}, 10);
				
			}},
			width : 640,
			height : 530,
			max : false,
			min : false,
			cache : false,
			lock: true
		});
	});
	return goodsCombo;
};

Business.forSearch = function(id, text){
	if(id) {
		$.dialog({
			width: 472,
			height: 400,
			title: '即时库存',
			content: 'url:/inventory.jsp',
			data: { id: id, text: text},
			cancel: true,
			//lock: true,
			cancelVal: '关闭'
			
		});
		//goodsCombo.removeSelected(false);
	} else {
		parent.Public.tips({type: 2, content : '请先选择一个商品！'});
	};
};

Business.storageCombo = function($_obj, opts){
	if ($_obj.length == 0) { return };
	var opts = $.extend(true, {
			//data: parent.SYSTEM.storageInfo/*'/basedata/invlocation.do?action=list&isEnable=1'*/,
			data: function(){
				return (parent.SYSTEM || opts.userData.system).storageInfo;
			},
/*			ajaxOptions: {
				formatData: function(data){
					return data.data.items;
				}	
			},*/
			text: 'name',
			value: 'id',
			defaultSelected: 0,
			cache: false,
			editable: false,
			trigger: false,
			defaultFlag: false,
			callback: {
				onChange: function(data){
					var parentTr = this.input.parents('tr');
					//var storageInfo = parentTr.data('storageInfo');
					//console.log(parentTr.data('storageInfo'))
/*					if(!storageInfo) {
						storageInfo = {};
					};*/
					if(data) {
						parentTr.data('storageInfo', {id: data.id, name: data.name});
						//storageInfo.id = data.id;
						//storageInfo.name = data.name;
					}
				}
			}
		}, opts);
	
	var storageCombo = $_obj.combo(opts).getCombo();
	return storageCombo;
};

Business.accountCombo = function($_obj, opts){
	if ($_obj.length == 0) { return };
	var opts = $.extend(true, {
		data: function(){
			if(SYSTEM.accountInfo) {
				return SYSTEM.accountInfo;
			} else {
				return '/basedata/settAcctList.json';
			}
		},
		ajaxOptions: {
			formatData: function(data){
				SYSTEM.accountInfo = data.data.items;	//更新
				return data.data.items;
			}	
		},
		formatText: function(data){
			return data.number + ' ' + data.name;
		},
		value: 'id',
		defaultSelected: 0,
		defaultFlag: false,
		cache: false,
		editable: true
	}, opts);	
	var accountCombo = $_obj.combo(opts).getCombo();
	return accountCombo;
};

Business.paymentCombo = function($_obj, opts){
	if ($_obj.length == 0) { return };
	var opts = $.extend(true, {
		data: function(){
			if(SYSTEM.paymentInfo) {
				return SYSTEM.paymentInfo;
			} else {
				return '/basedata/assist.do?action=list&typeNumber=PayMethod&isDelete=2';
			}
		},
		ajaxOptions: {
			formatData: function(data){
				SYSTEM.paymentInfo = data.data.items;	//更新缓存
				return data.data.items;
			}	
		},
		emptyOptions: true,
		text: 'name',
		value: 'id',
		defaultSelected: 0,
		cache: false,
		editable: false,
		trigger: false,
		defaultFlag: false
		
	}, opts);
	var paymentCombo = $_obj.combo(opts).getCombo();	
	return paymentCombo;
};

Business.billsEvent = function(obj, type, flag){
	var _self = obj;
	//新增分录
	$('.grid-wrap').on('click', '.ui-icon-plus', function(e){
		var rowId = $(this).parent().data('id');
		var newId = $('#grid tbody tr').length;
		var datarow = { id: _self.newId };
		var su = $("#grid").jqGrid('addRowData', _self.newId, datarow, 'before', rowId);
		if(su) {
			$(this).parents('td').removeAttr('class');
			$(this).parents('tr').removeClass('selected-row ui-state-hover');
			$("#grid").jqGrid('resetSelection');
			_self.newId++;
		}
	});
	//删除分录
	$('.grid-wrap').on('click', '.ui-icon-trash', function(e){
		if($('#grid tbody tr').length === 2) {
			parent.Public.tips({type: 2, content: '至少保留一条分录！'});
			return false;
		}
		var rowId = $(this).parent().data('id');
		var su = $("#grid").jqGrid('delRowData', rowId);
		if(su) {
			_self.calTotal();
		};
	});
	//批量添加
	$('.grid-wrap').on('click', '.ui-icon-ellipsis', function(e){
		var $_input = $(this).prev('input');
		$.dialog({
			width: 620,
			height: 500,
			title: '选择商品',
			content: 'url:/settings/goods-batch.jsp',
			data: {
				curID: _self.curID,
				callback: function(row){
					if(row > 8) {
						$("#grid").jqGrid('addRowData', row + 1, {}, 'last');
						_self.newId = row + 2;
					};
					setTimeout( function() { $("#grid").jqGrid("editCell", row, 2, true) }, 10);
					_self.calTotal();
				}
			},
			lock: true,
			ok: function(){
				this.content.callback(type);
				//return false;
			},
			cancel: true
		});
	});
	//取消分录编辑状态
	$(document).bind('click.cancel', function(e){
		if(!$(e.target).closest(".ui-jqgrid-bdiv").length > 0 && curRow !== null && curCol !== null){
		   $("#grid").jqGrid("saveCell", curRow, curCol);
		   curRow = null;
		   curCol = null;
		};
	});
	
/*	initStorage();
	
	function initStorage() {
		var data = parent.SYSTEM.storageInfo;
		var list = '<ul>';
		for(var i = 0, len = data.length; i < data.length; i++) {
			list += '<li data-id="' + data[i].id + '" data-name="' + data[i].name + '" >' + data[i].locationNo + ' ' +data[i].name + '</li>';
		};
		list += '</ul>';
		$("#storageBox").html(list);
	};
*/
	if(type === 'transfers') {
		return;
	};
	
	$("#batchStorage").powerFloat({
		eventType: "click",
		hoverHold: false,
		reverseSharp: true,
		target: function(){
			if(curRow !== null && curCol !== null){
			   $("#grid").jqGrid("saveCell", curRow, curCol);
			   curRow = null;
			   curCol = null;
			};
			return $("#storageBox");
		}
	});

	$('.wrapper').on('click', '#storageBox li', function(e){
		var stoId = $(this).data('id');
		var stoName = $(this).data('name');
		var ids = $("#grid").jqGrid('getDataIDs');
		var batName = 'locationName';
		var batInfo = 'storageInfo';
		for(var i = 0, len = ids.length; i < len; i++){
			var id = ids[i], itemData;
			var row = $("#grid").jqGrid('getRowData',id);
			var $_id = $('#' + id);
			if(row.goods === '' || $_id.data('goodsInfo') === undefined) {
				continue;	//跳过无效分录
			};
			var setData = {};
			setData[batName] = stoName;
			$("#grid").jqGrid('setRowData', id, setData);
			$('#' + id).data(batInfo, { id: stoId, name: stoName });
		};
		$.powerFloat.hide();
	});

};

Business.filterCustomer = function(){
	Business.customerCombo($('#customerAuto'), {
		width: '',
		formatText: function(data){
			return data.number + ' ' + data.name;
		},
		trigger: false,
		forceSelection: false,
		noDataText: '',
		extraListHtmlCls: '',
		extraListHtml: '', 
		callback: {
			onChange: function(data){
				if(data) {
					//this.input.data('ids', data.id);
					this.input.val(data.number);
				}
			}
		}
	});
	
	//客户
	$('#filter-customer .ui-icon-ellipsis').on('click', function(){
		var $input = $(this).prev('input');
		$.dialog({
			width: 570,
			height: 500,
			title: '选择客户',
			content: 'url:/settings/customer-batch.jsp',
			lock: true,
			ok: function(){
				Business.setFilterData(this.content, $input);
			},
			cancel: function(){
				return true;
			}
		});
	});
};

Business.filterSupplier = function(){
	Business.supplierCombo($('#supplierAuto'), {
		width: '',
		formatText: function(data){
			return data.number + ' ' + data.name;
		},
		trigger: false,
		forceSelection: false,
		noDataText: '',
		extraListHtmlCls: '',
		extraListHtml: '', 
		callback: {
			onChange: function(data){
				if(data) {
					//this.input.data('ids', data.id);
					this.input.val(data.number);
				}
			}
		}
	});
	
	//客户
	$('#filter-customer .ui-icon-ellipsis').on('click', function(){
		var $input = $(this).prev('input');
		$.dialog({
			width: 570,
			height: 500,
			title: '选择供应商',
			content: 'url:/settings/supplier-batch.jsp',
			lock: true,
			ok: function(){
				Business.setFilterData(this.content, $input);
			},
			cancel: function(){
				return true;
			}
		});
	});
};
//结算账户查询区域下拉框初始化
Business.filterSettlementAccount = function(){
	Business.settlementAccountCombo($('#settlementAccountAuto'), {
		width: '',
		formatText: function(data){
			return data.number + ' ' + data.name;
		},
		trigger: false,
		forceSelection: false,
		noDataText: '',
		extraListHtmlCls: '',
		extraListHtml: '', 
		callback: {
			onChange: function(data){
				if(data) {
					//this.input.data('ids', data.id);
					this.input.val(data.number);
				}
			}
		}
	});
	
	//结算账户
	$('#filter-settlementAccount .ui-icon-ellipsis').on('click', function(){
		var $input = $(this).prev('input');
		$.dialog({
			width: 470,
			height: 500,
			title: '选择结算账户',
			content: 'url:/settings/settlementAccount-batch.jsp',
			lock: true,
			ok: function(){
				Business.setFilterData(this.content, $input);
			},
			cancel: function(){
				return true;
			}
		});
	});
};

Business.filterGoods = function(){
	Business.goodsCombo($('#goodsAuto'), { 
		forceSelection: false,
		noDataText: '',
		extraListHtmlCls: '',
		extraListHtml: '', 
		forceSelection: false,
		callback: {
			onChange: function(data){
				if(data) {
					this.input.data('ids', data.number);
					this.input.val(data.number);
				}
			}
		}
	});
	//商品	
	$('#filter-goods .ui-icon-ellipsis').on('click', function(){
		var $input = $(this).prev('input');
		$.dialog({
			width: 620,
			height: 500,
			title: '选择商品',
			content: 'url:/settings/goods-batch.jsp',
			lock: true,
			ok: function(){
				Business.setFilterGoods(this.content, $input);
			},
			cancel: function(){
				return true;
			}
		});
	});
};
Business.filterStorage = function(){
	Business.storageCombo($('#storageAuto'), {
		data: function(){
			return parent.SYSTEM.allStorageInfo;
		},
		formatText: function(data){
			return data.locationNo + ' ' + data.name;
		},
		editable: true,
		forceSelection: false,
		callback: {
			onChange: function(data){
				if(data) {
					//this.input.data('ids', data.id);
					this.input.val(data.locationNo);
				}
			}
		}
	});
	//仓库
	$('#filter-storage .ui-icon-ellipsis').on('click', function(){
		var $input = $(this).prev('input');
		$.dialog({
			width: 510,
			height: 500,
			title: '选择仓库',
			content: 'url:/settings/storage-batch.jsp',
			lock: true,
			ok: function(){
				Business.setFilterData(this.content, $input);
			},
			cancel: function(){
				return true;
			}
		});
	});
};

//将弹窗中返回的数据记录到相应的input中
Business.setFilterData = function(dialogCtn, $input){
	var ids = dialogCtn.$("#grid").jqGrid('getGridParam', 'selarrrow'), 
		len = ids.length,
		numbers = [];
	if(len > 0){
		$.each(ids, function(idx, val){
			var row = dialogCtn.$("#grid").jqGrid('getRowData', val);
			numbers.push(row.number || row.locationNo);
		});
		$input.data('ids', ids.join(',')).val(numbers.join(','));
	}
};

Business.setFilterGoods = function(dialogCtn, $input){
	var ids = dialogCtn.$("#grid").jqGrid('getGridParam', 'selarrrow'), 
		len = ids.length,
		numbers = [];
	if($.trim($input.val()) !== '') {
		numbers.push($input.val());
	};
	if(len > 0){
		$.each(ids, function(idx, val){
			var row = dialogCtn.$("#grid").jqGrid('getRowData', val);
			numbers.push(row.number);
		});
		$input.data('ids', numbers.join(',')).val(numbers.join(','));
	}
};

Business.moreFilterEvent = function(){
	$('#conditions-trigger').on('click', function(e){
		e.preventDefault();
	  if (!$(this).hasClass('conditions-expand')) {
		  $('#more-conditions').stop().slideDown(200, function(){
			   $('#conditions-trigger').addClass('conditions-expand').html('收起更多<b></b>');
			   $('#filter-reset').css('display', 'inline');
		  });
	  } else {
		  $('#more-conditions').stop().slideUp(200, function(){
			  $('#conditions-trigger').removeClass('conditions-expand').html('更多条件<b></b>');
			  $('#filter-reset').css('display', 'none');
		  });
	  };
	});
};

Business.gridEvent = function(){
	$('.grid-wrap').on('mouseenter', '.list tbody tr', function(e){
		$(this).addClass('tr-hover');
		if($_curTr) {
			$_curTr.removeClass('tr-hover');
			$_curTr = null;
		}
	}).on('mouseleave', '.list tbody tr', function(e){
		$(this).removeClass('tr-hover');
	});
};

//判断:当前元素是否是被筛选元素的子元素
$.fn.isChildOf = function(b){
    return (this.parents(b).length > 0);
};

//判断:当前元素是否是被筛选元素的子元素或者本身
$.fn.isChildAndSelfOf = function(b){
    return (this.closest(b).length > 0);
};

//数字输入框
$.fn.digital = function() {
	this.each(function(){
		$(this).keyup(function() {
			this.value = this.value.replace(/\D/g,'');
		})
	});
};

/** 
 1. 设置cookie的值，把name变量的值设为value   
example $.cookie(’name’, ‘value’);
 2.新建一个cookie 包括有效期 路径 域名等
example $.cookie(’name’, ‘value’, {expires: 7, path: ‘/’, domain: ‘jquery.com’, secure: true});
3.新建cookie
example $.cookie(’name’, ‘value’);
4.删除一个cookie
example $.cookie(’name’, null);
5.取一个cookie(name)值给myvar
var account= $.cookie('name');
**/
$.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
Public.print = function (opt){
	var voucherIds = opt.$grid.jqGrid('getGridParam','selarrrow').join();
	var pdfUrl = opt.pdf;
	var sidx = opt.$grid.jqGrid('getGridParam','sortname');
	var sord = opt.$grid.jqGrid('getGridParam','sortorder');
	var billType = opt.billType;
	var data = {
		sidx: sidx,
		sord: sord,
		op: 2
	};
	if (!voucherIds) {
		//$.extend(data,opt.filterConditions);
		if(!opt.filterConditions.id){
			parent.Public.tips({type:2,content:"请先选择需要打印的项！"});
			return;
		}else{
			data.id = opt.filterConditions.id;
		}
	} else {
		data.id = voucherIds;
	}
	$.dialog({
		title: opt.title,
		content : 'url:../print/print-settings-voucher.html',
		data: {taodaData: data, pdfData: data, pdfUrl: pdfUrl, billType:billType},
		width: 520,
		height: 400,
		min: false,
		max: false,
		lock: true,
		ok: function(){
			this.content.doPrint();
			return false;
		},
		okVal: '打印',
		cancel: true
	});
};