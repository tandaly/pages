var curRow, curCol, curArrears, loading, system = parent.SYSTEM, SYSTEM = system, 
	billRequiredCheck = system.billRequiredCheck, 
	requiredMoney = system.requiredMoney, 
	taxRequiredCheck  = system.taxRequiredCheck;
	taxRequiredInput = system.taxRequiredInput;
var urlParam = Public.urlParam();
var qtyPlaces = Number(parent.SYSTEM.qtyPlaces), 
	pricePlaces = Number(parent.SYSTEM.pricePlaces), 
	amountPlaces = Number(parent.SYSTEM.amountPlaces);
var THISPAGE = {
	init: function(data){
		this.loadGrid(data);
		this.initDom(data);		
		this.initCombo();
		if(data.id > 0 && data.checked) {
			this.disableEdit();
		} else {
			this.editable = true;
			$("#grid").jqGrid('setGridParam',{cellEdit: true});
		};
		this.addEvent();
	},
	initDom: function(data){
		var _self = this;
		this.$_customer = $('#customer');
		this.$_date = $('#date').val(system.endDate);
		this.$_number = $('#number');
		this.$_classes = $('#classes');
		this.$_note = $('#note');
		this.$_discountRate = $('#discountRate');
		this.$_deduction = $('#deduction');
		this.$_discount = $('#discount');
		this.$_payment = $('#payment');
		this.$_arrears = $('#arrears');
		this.$_totalArrears = $('#totalArrears');
		this.$_toolTop = $('#toolTop');
		this.$_toolBottom = $('#toolBottom');
		this.$_paymentTxt = $('#paymentTxt');
		this.$_accountInfo = $('#accountInfo');
		this.customerArrears = 0; //客户欠款

		if(data.status === 'add') {
			var defaultSelected = 0;
		} else {
			var defaultSelected = ['id', data.buId];
		};
		
		this.customerCombo = Business.customerCombo($('#customer'), {
			defaultSelected: defaultSelected
		});
		
		this.$_date.datepicker();//.datepicker("setDate", data.date);
		//this.$_number.text(data.number);
		this.classes = this.$_classes.cssRadio({ callback: function($_obj){
			if($_obj.find('input').val() === "150601") {
				_self.$_paymentTxt.text('本次收款:');
			} else {
				_self.$_paymentTxt.text('本次退款:');
			}
		}});
		
		data.transType === 150601 ? this.classes.setValue(0) : this.classes.setValue(1);
		
		this.$_discountRate.val(data.disRate);
		this.$_deduction.val(data.disAmount);
		this.$_discount.val(data.amount);
		this.$_payment.val(data.rpAmount);
		this.$_arrears.val(data.arrears);
		
		//是否启用资金
		if(requiredMoney) {
			$('#accountWrap').show();
			this.accountCombo = Business.accountCombo($('#account'), {
				width: 200,
				height: 300,
				emptyOptions: true,
				addOptions: {text:'多账户', value: -1},
				callback: {
					onChange: function(data){
						if(this.getValue() === -1) {
							_self.chooseAccount();
						} else {
							var returnVal = [];
							returnVal.push({
								accId: this.getValue(),
								account: '',
								payment: _self.$_payment.val(),
								wayId: 0,
								way: '',
								settlement: ''
							});
							_self.$_accountInfo.data('accountInfo', returnVal).hide();
							_self.$_payment.removeAttr('disabled').removeClass('ui-input-dis');
						};
					}
				}
			});
			this.accountCombo.selectByValue(data.accId, false);
		};
		var btn_add = '<a id="savaAndAdd" class="ui-btn ui-btn-sp">保存并新增</a><a id="save" class="ui-btn">保存</a>';
		var btn_edit = '<a id="add" class="ui-btn ui-btn-sp">新增</a><a id="edit" class="ui-btn">保存</a><a href="/basedata/sales.json?action=toPdf&id=' + data.id + '" target="_blank" id="print" class="ui-btn">打印</a>';
		var btn_view = '<a id="add" class="ui-btn ui-btn-sp">新增</a><a href="/basedata/sales.json?action=toPdf&id=' + data.id + '" target="_blank" id="print" class="ui-btn">打印</a>';
		var btn_audit = '', btn_reaudit = '';
		if(billRequiredCheck) {
			btn_audit = '<a class="ui-btn" id="audit">审核</a>';
			btn_reaudit = '<a class="ui-btn" id="reAudit">反审核</a>';
		};
		var btn_p_n = '<a class="ui-btn-prev" id="prev" title="上一张"><b></b></a><a class="ui-btn-next" id="next" title="下一张"><b></b></a>';
		this.btn_edit = btn_edit;
		this.btn_audit = btn_audit;
		this.btn_view = btn_view;
		this.btn_reaudit = btn_reaudit;
		if(data.id > 0) {
			this.$_number.text(data.billNo);
			this.$_date.val(data.date);
			this.$_note.val(data.description);
			this.$_totalArrears.val(data.totalArrears);
			this.$_accountInfo.data('accountInfo', data.accounts);
			if(data.accId === -1) {
				this.$_accountInfo.show();
				_self.$_payment.attr('disabled', 'disabled').addClass('ui-input-dis');
			};
			$("#grid").jqGrid('footerData', 'set', { qty:data.totalQty, amount: data.totalAmount });
			if(urlParam.flag !== 'list') {
				btn_p_n = '';
			};
			if(data.status === 'edit') {
				/*this.$_toolTop.html('<div class="fl"><!--<a id="add" class="ui-btn ui-btn-sp mrb">新增</a>--><a id="edit" class="ui-btn mrb">保存</a><!--<a id="print" class="ui-btn mrb">打印</a></div><div class="fr"><a class="ui-btn-prev mrb" id="prev" title="上一张"><b></b></a><a class="ui-btn-next" id="next" title="下一张"><b></b></a>--></div>').show();*/
				this.$_toolBottom.html('<span id=groupBtn>' + btn_edit + btn_audit + '</span>' + btn_p_n);
			} else {
				if(data.checked) {
					$("#mark").addClass("has-audit");
					this.$_toolBottom.html('<span id="groupBtn">' + btn_view + btn_reaudit + '</span>' + btn_p_n);
				} else {
					this.$_toolBottom.html('<span id="groupBtn">' + btn_view + '</span>' + btn_p_n);
				};
				//this.$_toolBottom.html('<a id="add" class="ui-btn ui-btn-sp mrb">新增</a><a href="/basedata/sales.json?action=toPdf&id=' + data.id + '" target="_blank" id="print" class="ui-btn mrb">打印</a><a class="ui-btn-prev mrb" id="prev" title="上一张"><b></b></a><a class="ui-btn-next" id="next" title="下一张"><b></b></a>');
			};
			this.idList = parent.cacheList.salesId || [];	//单据ID数组
			this.idPostion = $.inArray(String(data.id), this.idList);	//当前单据ID位置
			this.idLength = this.idList.length;
			if(this.idPostion === 0) {
				$("#prev").addClass("ui-btn-prev-dis");
			}
			if(this.idPostion === this.idLength - 1) {
				$("#next").addClass("ui-btn-next-dis");
			};
		} else {
			if(billRequiredCheck) {
				this.$_toolBottom.html('<span id=groupBtn>' + btn_add + btn_audit + '</span>');
			} else {
				this.$_toolBottom.html('<span id="groupBtn">' + btn_add + '</span>');
			};
		};
	},
	loadGrid: function(data){
		var _self = this;
		if(data.id) {
			var gap = 8 - data.entries.length;
			if(gap > 0) {
				for(var i = 0; i < gap; i++) {
					data.entries.push({});
				};
			}
		};
		_self.newId = 9;
		var width = 1020;
		var colModel = [
			{name:'operating', label:' ', width:40, fixed:true, formatter:Public.billsOper, align:"center"},
			{name:'goods', label:'商品', width:320, classes: 'ui-ellipsis', formatter:goodsFmt, editable:true, edittype:'custom', editoptions:{custom_element: goodsElem, custom_value: goodsValue, handle: goodsHandle, trigger:'ui-icon-ellipsis'}},
			{name:'mainUnit', label:'单位', width:60 },
			{name:'qty', label:'数量', width:80, align:"right", formatter:'number', formatoptions:{decimalPlaces: qtyPlaces}, editable:true},
			{name:'price', label:'销售单价', width:100, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: pricePlaces}, editable:true},
			{name:'discountRate', label:'折扣率(%)', width:70, fixed:true, align:"right", formatter:'integer', editable:true},
			{name:'deduction', label:'折扣额', width:70, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}, editable:true},
			{name:'amount', label:'销售金额', width:100, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}, editable:true}
		];
		this.calAmount = 'amount';
		if(taxRequiredCheck) {
			width = 1024 + 70 + 70 + 100;
			$('.bills').width(width+2);
			colModel.pop();
			colModel.push(
				{name:'amount', label:'金额', width:100, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}, editable:true},
				{name:'taxRate', label:'税率(%)', width:70, fixed:true, align:"right", formatter:'integer', editable:true},
				{name:'tax', label:'税额', width:70, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}, editable:true},
				{name:'taxAmount', label:'价税合计', width:100, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}, editable:true}			)
		this.calAmount = 'taxAmount';
		};
		colModel.push({name:'locationName', label:'仓库<small id="batchStorage">(批量)</small>', width:100, editable:true, edittype:'custom', editoptions:{custom_element: storageElem, custom_value: storageValue, handle: storageHandle, trigger:'ui-icon-triangle-1-s'}});
		$("#grid").jqGrid({
			data: data.entries,
			datatype: "clientSide",
			width: width,
			height: '100%',
			rownumbers: true,
			gridview: true,
			onselectrow: false,
			colModel: colModel,
			cmTemplate: {sortable: false, title: false},
			//idPrefix: 'ys',	//表格id前缀
			//loadui: 'block',
			shrinkToFit: true,
			forceFit: true,
			rowNum: 1000,
			cellEdit: false,
			cellsubmit: 'clientArray',
			localReader: {
			  root: "rows", 
			  records: "records",  
			  repeatitems : false,
			  id: "id"
			},
			jsonReader: {
			  root: "data.entries", 
			  records: "records",  
			  repeatitems : false,
			  id: "id"
			},
			loadComplete: function(data) {
				//console.log(data)
				if(urlParam.id > 0){
					var rows = data['rows'];
					var len = rows.length;
					_self.newId = len + 1;
					for(var i = 0; i < len; i++) {
						var tempId = i + 1, row = rows[i];
						if($.isEmptyObject(rows[i])){
							break;
						};
						$('#' + tempId).data('goodsInfo', {
							id: row.invId,
							number:	row.invNumber,
							name: row.invName,
							spec: row.invSpec,
							unitId: row.unitId,
							unitName: row.mainUnit
						}).data('storageInfo', { 
							id: row.locationId, 
							name: row.locationName
						});
					};
				}
			},
			gridComplete: function(){

			},
			afterEditCell: function (rowid,name,val,iRow,iCol){
				if(name==='goods') {
					$("#"+iRow+"_goods","#grid").val(val);
					THISPAGE.goodsCombo.selectByText(val);
					THISPAGE.curID = rowid;
				};
				if(name==='locationName') {
					$("#"+iRow+"_locationName","#grid").val(val);
					//setTimeout(function(){ $('.storageAuto').trigger('click'); }, 10)	//自动下拉显示
				};
			},
			formatCell: function(rowid,name,val,iRow,iCol) {
				
			},
			beforeSubmitCell: function(rowid,name,val,iRow,iCol) {
				
			},
			afterSaveCell : function(rowid,name,val,iRow,iCol) {
				switch (name) {
					case 'goods':
						var goodsInfo = $('#' + rowid).data('goodsInfo');
						if(goodsInfo) {
							var amount = goodsInfo.salePrice;
							var rowData = {mainUnit: goodsInfo.unitName, qty: 1, price: goodsInfo.salePrice, discountRate: 0, deduction:0, amount:goodsInfo.salePrice, locationName: goodsInfo.localtionName};
							if(taxRequiredCheck) {
								var taxRate = taxRequiredInput;
								var tax = amount * taxRate / 100;
								var taxAmount = amount + tax;
								rowData.taxRate = taxRate;
								rowData.tax = tax;
								rowData.taxAmount = taxAmount;
							};
							var su =  $("#grid").jqGrid('setRowData', rowid, rowData);
							if(su) {
								THISPAGE.calTotal();
							};
						};
						break;
					case 'qty':
						var val = parseFloat(val);
						var price = parseFloat($("#grid").jqGrid('getCell', rowid, iCol+1));
						var discountRate = parseFloat($("#grid").jqGrid('getCell', rowid, iCol+2));
						if($.isNumeric(price)) {
							if($.isNumeric(discountRate)) {
								var deduction = val * price * discountRate / 100;
								var amount = val * price - deduction;
								var su = $("#grid").jqGrid('setRowData', rowid, {deduction: deduction, amount: amount});
							} else {
								var su = $("#grid").jqGrid('setRowData', rowid, {amount: val * price});
							};
						};
						taxRequired(rowid);
						if(su) {
							THISPAGE.calTotal();
						};
						break;
					case 'price':
						var val = parseFloat(val);
						var quantity = parseFloat($("#grid").jqGrid('getCell', rowid, iCol-1));
						var discountRate = parseFloat($("#grid").jqGrid('getCell', rowid, iCol+1));
						if($.isNumeric(quantity)) {
							if($.isNumeric(discountRate)) {
								var deduction = val * quantity * discountRate / 100;
								var amount = val * quantity - deduction;
								var su = $("#grid").jqGrid('setRowData', rowid, {deduction: deduction, amount: amount});
							} else {
								var su = $("#grid").jqGrid('setRowData', rowid, {amount: val * quantity});
							};
	/*						if(su) {
								THISPAGE.calTotal();
							}*/
						};
						taxRequired(rowid);
						if(su) {
							THISPAGE.calTotal();
						};
						break;
					case 'discountRate':
						var val = parseFloat(val);
						var quantity = parseFloat($("#grid").jqGrid('getCell', rowid, iCol-2));
						var price = parseFloat($("#grid").jqGrid('getCell', rowid, iCol-1));
						if($.isNumeric(quantity) && $.isNumeric(price)) {
							var original = quantity * price;
							var deduction = original * val / 100;
							var amount = original - deduction;
							var su = $("#grid").jqGrid('setRowData', rowid, { deduction: deduction, amount: amount });
						};
						taxRequired(rowid);
						if(su) {
							THISPAGE.calTotal();
						};
						break;
					case 'deduction':
						var val = parseFloat(val);
						var quantity = parseFloat($("#grid").jqGrid('getCell', rowid, iCol-3));
						var price = parseFloat($("#grid").jqGrid('getCell', rowid, iCol-2));
						if($.isNumeric(quantity) && $.isNumeric(price)) {
							var original = quantity * price;
							var amount = original - val;
							var discountRate = (val*100/original).toFixed(amountPlaces);
							var su = $("#grid").jqGrid('setRowData', rowid, { discountRate: discountRate, amount: amount });
						};
						taxRequired(rowid);
						if(su) {
							THISPAGE.calTotal();
						};
						break;
					case 'amount':
						taxRequired(rowid);
						THISPAGE.calTotal();
						break;
					case 'taxRate':
						var strVal = val;
						var val = parseFloat(val);
						var row = $("#grid").jqGrid('getRowData', rowid);
						var amount = parseFloat(row.amount);
						if($.isNumeric(val)) {
							var tax = amount * val / 100;
							var taxAmount = amount + tax;
							var su = $("#grid").jqGrid('setRowData', rowid, {tax: tax, taxAmount: taxAmount});
							if(su) {
								THISPAGE.calTotal();
							};
							break;
						};
						if(strVal === '') {
							var su = $("#grid").jqGrid('setRowData', rowid, {tax: '', taxAmount: amount});
							if(su) {
								THISPAGE.calTotal();
							};
							break;
						};
					case 'tax':
						var val = parseFloat(val);
						var row = $("#grid").jqGrid('getRowData', rowid);
						if($.isNumeric(val)) {
							var amount = parseFloat(row.amount);
							var taxAmount = amount + val;
							var su = $("#grid").jqGrid('setRowData', rowid, {taxAmount: taxAmount});
							if(su) {
								THISPAGE.calTotal();
							};
						};
						break;
				};
			},
			loadonce: true,
			//postData:{aaa:"人民币", bb: [1, '什么'], cc: { name: '张山', age: 30, work: ['财务', '出纳']}}, //此数组内容直接赋值到url上，参数类型：{name1:value1…}
			footerrow : true,
			userData: { goods:"合计：", qty: data.totalQty, deduction: data.totalDiscount, amount: data.totalAmount, tax: data.totalTax, taxAmount: data.totalTaxAmount},
			userDataOnFooter : true,
			loadError : function(xhr,st,err) {
				Public.tips({type: 1, content : "Type: "+st+"; Response: "+ xhr.status + " "+xhr.statusText});
			}
		});
		
		function taxRequired(rowid){
			if(taxRequiredCheck) {
				var row = $("#grid").jqGrid('getRowData', rowid);
				var taxRate = parseFloat(row.taxRate);
				if($.isNumeric(taxRate)) {
					var amount = parseFloat(row.amount);
					var tax = amount * taxRate / 100;
					var taxAmount = amount + tax;
					var su = $("#grid").jqGrid('setRowData', rowid, {tax: tax, taxAmount: taxAmount});
				};
			};
		};
		
		function goodsFmt(val, opt, row){
			if(val) {
				return val;
			} else if(row.invNumber) {
				if(row.invSpec) {
					return row.invNumber + ' ' + row.invName + '_' + row.invSpec;
				} else {
					return row.invNumber + ' ' + row.invName;
				}
			} else {
				return '&#160;';
			}
			
		};
		
		function goodsElem(value, options) {
		  var el = $('.goodsAuto')[0];
		  return el;
		};
		 
		function goodsValue(elem, operation, value) {
			if(operation === 'get') {
			   //console.log($('.goodsAuto').getCombo().getValue())
			   if($('.goodsAuto').getCombo().getValue() !== '') {
				  return $(elem).val();
			   } else {
				  var parentTr = $(elem).parents('tr');
				  parentTr.removeData('goodsInfo');
				  return '';
			   }
			} else if(operation === 'set') {
			   $('input',elem).val(value);
			}
		};
		
		function goodsHandle() {
		  	$('#initCombo').append($('.goodsAuto').val('').unbind("focus.once"));
		};
		
		function storageElem(value, options) {
		  	var el = $('.storageAuto')[0];
		  	return el;
		};
		 
		function storageValue(elem, operation, value) {
			if(operation === 'get') {
			   if($('.storageAuto').getCombo().getValue() !== '') {
				  return $(elem).val();
			   } else {
				  var parentTr = $(elem).parents('tr');
				  parentTr.removeData('storageInfo');
				  return '';
			   }
			} else if(operation === 'set') {
			   $('input', elem).val(value);
			}
		};
		
		function storageHandle() {
		    $('#initCombo').append($('.storageAuto').val(''));
		};

	},
	reloadData: function(data){
		$("#grid").clearGridData();
		//重载基础数据
		var _self = this;
		function _reloadBase(){
			_self.customerCombo.selectByValue(data.buId, false);
			_self.$_date.val(data.date);
			_self.$_number.text(data.billNo);
			data.transType === 150601 ? _self.classes.setValue(0) : _self.classes.setValue(1);
			_self.$_note.val(data.note);
			_self.$_discountRate.val(data.disRate);
			_self.$_deduction.val(data.disAmount);
			_self.$_discount.val(data.amount);
			_self.$_payment.val(data.rpAmount);
			_self.accountCombo.selectByValue(data.accId, false);
			_self.$_accountInfo.data('accountInfo', data.accounts);
			if(data.accId === -1) {
				_self.$_accountInfo.show();
			} else {
				_self.$_accountInfo.hide();
			};
			_self.$_arrears.val(data.arrears);	
			_self.$_totalArrears.val(data.totalArrears);
		};
		var gap = 8 - data.entries.length;
		if(gap > 0) {
			for(var i = 0; i < gap; i++) {
				data.entries.push({});
			};
		};
		$("#grid").jqGrid('setGridParam',{data: data.entries, userData: { qty: data.totalQty, deduction: data.totalDiscount, amount: data.totalAmount, tax: data.totalTax, taxAmount: data.totalTaxAmount }}).trigger("reloadGrid");
		_reloadBase();
		if(data.status === 'edit') {
			if(!this.editable) {
				_self.enableEdit();
				$('#groupBtn').html(_self.btn_edit + _self.btn_audit);
				$("#mark").removeClass("has-audit");
			};
		} else {
			if(this.editable) {
				_self.disableEdit();
				$('#groupBtn').html(_self.btn_view + _self.btn_reaudit);
				$("#mark").addClass("has-audit");
			};
		};
	},
	initCombo: function(){
		this.goodsCombo = Business.goodsCombo($('.goodsAuto'));
		Business.storageCombo($('.storageAuto'));
	},
	disableEdit: function(){
		this.customerCombo.disable();
		this.$_date.attr('disabled', 'disabled').addClass('ui-input-dis');
		this.$_note.attr('disabled', 'disabled').addClass('ui-input-dis');
		this.$_discountRate.attr('disabled', 'disabled').addClass('ui-input-dis');
		this.$_deduction.attr('disabled', 'disabled').addClass('ui-input-dis');
		this.$_payment.attr('disabled', 'disabled').addClass('ui-input-dis');
		this.accountCombo.disable();
		$("#grid").jqGrid('setGridParam',{cellEdit: false});
		this.editable = false;
	},
	enableEdit: function(){
		this.customerCombo.enable();
		this.$_date.removeAttr('disabled').removeClass('ui-input-dis');
		this.$_note.removeAttr('disabled').removeClass('ui-input-dis');
		this.$_discountRate.removeAttr('disabled').removeClass('ui-input-dis');
		this.$_deduction.removeAttr('disabled').removeClass('ui-input-dis');
		this.$_payment.removeAttr('disabled').removeClass('ui-input-dis');
		this.accountCombo.enable();
		$("#grid").jqGrid('setGridParam',{cellEdit: true});
		this.editable = true;
	},
	chooseAccount: function(data){
		var _self = this;
		_self.$_accountInfo.show();
		_self.$_payment.attr('disabled', 'disabled').addClass('ui-input-dis');
		$.dialog({
			width: 670,
			height: 250,
			title: '多账户结算',
			content: 'url:/settings/choose-account.jsp',
			data: {
				accountInfo: data, 
				type: 'purchase'
			},
			lock: true,
			ok: function(){
				var returnVal = this.content.callback();
				if(!returnVal) {
					return false;
				} else {
					_self.$_payment.val(returnVal.payment).trigger('keyup');
					_self.$_accountInfo.data('accountInfo', returnVal.accounts);
					_self.accountCombo.blur();
				}
			},
			cancel: true
		});
	},
	addEvent: function(){
		var _self = this;
		this.customerCombo.input.enterKey();
		this.$_date.bind('keydown', function(e){
			if(e.which === 13){
				$("#grid").jqGrid("editCell", 1, 2, true);
			}
		}).bind('focus', function(e){
			_self.dateValue = $(this).val();
		}).bind('blur', function(e){
			var reg = /((^((1[8-9]\d{2})|([2-9]\d{3}))(-)(10|12|0?[13578])(-)(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(11|0?[469])(-)(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(-)(0?2)(-)(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)(-)(0?2)(-)(29)$)|(^([3579][26]00)(-)(0?2)(-)(29)$)|(^([1][89][0][48])(-)(0?2)(-)(29)$)|(^([2-9][0-9][0][48])(-)(0?2)(-)(29)$)|(^([1][89][2468][048])(-)(0?2)(-)(29)$)|(^([2-9][0-9][2468][048])(-)(0?2)(-)(29)$)|(^([1][89][13579][26])(-)(0?2)(-)(29)$)|(^([2-9][0-9][13579][26])(-)(0?2)(-)(29)$))/;
			if(!reg.test($(this).val())) {
				parent.Public.tips({type:2, content : '日期格式有误！如：2012-08-08。'});
				$(this).val(_self.dateValue);
			};
		});
		this.$_note.enterKey();
		this.$_discount.enterKey();
		this.$_discountRate.enterKey();

		//仓库下拉显示
		$('.grid-wrap').on('click', '.ui-icon-triangle-1-s', function(e){
			setTimeout(function(){ $('.storageAuto').trigger('click'); }, 10);
		});
		
		Business.billsEvent(_self, 'sales');
		
		this.$_deduction.keyup(function(){
			var value = Number($(this).val());
			var inTotal = Number($("#grid").jqGrid('footerData', 'get')[_self.calAmount].replace(/,/g,''));
			var discount = (inTotal - value).toFixed(amountPlaces);
			if(inTotal) {
				var rate = (value/inTotal)*100;
				var arrears = discount - Number($.trim(_self.$_payment.val()));
				THISPAGE.$_discountRate.val(rate.toFixed(amountPlaces));
				THISPAGE.$_discount.val(discount);
				THISPAGE.$_arrears.val(arrears);
			}
		}).on('keypress', function(e){
			Public.numerical(e);
		}).on('click', function(){
			this.select();
		});
		
		this.$_discountRate.keyup(function(){
			var value = Number($(this).val());
			var inTotal = Number($("#grid").jqGrid('footerData', 'get')[_self.calAmount].replace(/,/g,''));
			var rate = inTotal*(value/100);
			var deduction = rate.toFixed(amountPlaces);
			var discount = (inTotal - deduction).toFixed(amountPlaces);
			var arrears = discount - Number($.trim(_self.$_payment.val()));
			THISPAGE.$_deduction.val(deduction);
			THISPAGE.$_discount.val(discount);
			THISPAGE.$_arrears.val(arrears);
		}).on('keypress', function(e){
			Public.numerical(e);
		}).on('click', function(){
			this.select();
		});
		
		this.$_payment.keyup(function(){
			var value = $(this).val() || 0;
			var discount = _self.$_discount.val();
			var arrears = Number(parseFloat(discount) - parseFloat(value));
			var totalArrears = Number(arrears  + THISPAGE.customerArrears);
			THISPAGE.$_arrears.val(arrears.toFixed(amountPlaces));
			THISPAGE.$_totalArrears.val(totalArrears.toFixed(amountPlaces));
			var accountInfo = _self.$_accountInfo.data('accountInfo');
			if(accountInfo && accountInfo.length === 1) {
				accountInfo[0].payment = value;
			};
		}).on('keypress', function(e){
			Public.numerical(e);
		}).on('click', function(){
			this.select();
		});
		
		//保存
		$('.wrapper').on('click', '#save', function(e){
			e.preventDefault();
			var postData = THISPAGE.getPostData();
			//console.log(postData)
			if(postData) {
				if(originalData.stata === 'edit') {
					postData.id = originalData.id;
					postData.stata = 'edit';
				};
				Public.ajaxPost('/basedata/sales.json?action=add', {postData: JSON.stringify(postData)}, function(data){
					if(data.status === 200) {
						originalData.id = data.data.id;
						if(billRequiredCheck) {
							_self.$_toolBottom.html('<span id="groupBtn">' + _self.btn_edit + _self.btn_audit + '</span>');
						} else {
							_self.$_toolBottom.html('<span id="groupBtn">' + _self.btn_edit + '</span>');
						}
						parent.Public.tips({content : '保存成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				})
			}
		});
		
		//修改
		$('.wrapper').on('click', '#edit', function(e){
			e.preventDefault();
			if (!Business.verifyRight('SA_UPDATE')) {
				return ;
			};
			var postData = THISPAGE.getPostData();
			if(postData) {
				Public.ajaxPost('/basedata/sales.json?action=updateInvSa', {postData: JSON.stringify(postData)}, function(data){
					if(data.status === 200) {
						originalData.id = data.data.id;
						parent.Public.tips({content : '修改成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				})
			}
		});
		
		//审核
		$('.wrapper').on('click', '#audit', function(e){
			e.preventDefault();
			var postData = THISPAGE.getPostData();
			if(postData) {
				Public.ajaxPost('/basedata/sales.json?action=checkInvSa', {postData: JSON.stringify(postData)}, function(data){
					if(data.status === 200) {
						originalData.id = data.data.id;
						$('#mark').addClass("has-audit");
						$('#edit').hide();
						_self.disableEdit();
						$("#groupBtn").html(_self.btn_view + _self.btn_reaudit);
						parent.Public.tips({content : '审核成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				})
			}
		});
		
		//反审核
		$('.wrapper').on('click', '#reAudit', function(e){
			e.preventDefault();
			var postData = THISPAGE.getPostData();
			if(postData) {
				Public.ajaxPost('/basedata/sales.json?action=revsCheckInvSa', {postData: JSON.stringify(postData)}, function(data){
					if(data.status === 200) {
						$('#mark').removeClass();
						$('#edit').show();
						_self.enableEdit();
						$("#groupBtn").html(_self.btn_edit + _self.btn_audit);
						parent.Public.tips({content : '反审核成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				});
			};
		});

		//保存并新增
		$('.wrapper').on('click', '#savaAndAdd', function(e){
			e.preventDefault();
			var postData = THISPAGE.getPostData();
			//console.log(postData)
			if(postData) {
				Public.ajaxPost('/basedata/sales.json?action=addNew', {postData: JSON.stringify(postData)}, function(data){
					if(data.status === 200) {
						_self.$_number.text(data.data.billNo);
						$("#grid").clearGridData();
						$("#grid").clearGridData(true);
						for(var i=1; i<=8; i++) {
							$("#grid").jqGrid('addRowData', i, {});
							//$("#grid").jqGrid('footerData', 'set', { qty:0, amount: 0 });
						};
						_self.newId = 9;
						_self.$_note.val('');
						_self.$_discountRate.val(originalData.disRate);
						_self.$_deduction.val(originalData.disAmount);
						_self.$_discount.val(originalData.amount);
						_self.$_payment.val(originalData.rpAmount);
						_self.$_arrears.val(originalData.arrears);
						_self.accountCombo.selectByValue(0, true);
						parent.Public.tips({content : '保存成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				})
			};
		});
		
		//新增
		$('.wrapper').on('click', '#add', function(e){
			e.preventDefault();
			if (!Business.verifyRight('SA_ADD')) {
				return ;
			};
			parent.tab.overrideSelectedTabItem({tabid: 'sales-sales', text: '销售单', url: '/basedata/sales.json?action=initSale'});
/*			if(parent.tab.isTabItemExist('sales-sales') ) {
				parent.tab.reload('sales-sales');
			} else {
				parent.tab.addTabItem({tabid: 'sales-sales', text: '销售单', url: '/basedata/sales.json?action=initSale'});
			}*/
			//parent.tab.reload("sales");
		});
		
		//打印
		$('.wrapper').on('click', '#print', function(e){
			e.preventDefault();
			if (!Business.verifyRight('SA_PRINT')) {
				return ;
			};
			Public.print({
				title:'销货单列表',
				$grid:$('#grid'),
				pdf: '/basedata/sales.json?action=toPdf',
				billType: 10201,
				filterConditions:{
					//billIds: originalData.id
					id:originalData.id
				}
			});
		});
		
		this.$_accountInfo.click(function(){
			var accountInfo = $(this).data('accountInfo');
			_self.chooseAccount(accountInfo);
		});
		
		
		//上一张
		$('#prev').click(function(e){
			e.preventDefault();
			if($(this).hasClass("ui-btn-prev-dis")) {
				parent.Public.tips({type:2, content : '已经没有上一张了！'});
				return false;
			} else {
				_self.idPostion = _self.idPostion - 1;
				if(_self.idPostion === 0) {
					$(this).addClass("ui-btn-prev-dis");
				};
				loading = $.dialog.tips('数据加载中...', 1000, 'loading.gif', true);
				Public.ajaxGet('/basedata/sales.json?action=update', {id : _self.idList[_self.idPostion]}, function(data){
					THISPAGE.reloadData(data.data);
					$("#next").removeClass("ui-btn-next-dis");
					if(loading) {
						loading.close();
					};
				});
			};
			
		});
		//下一张
		$('#next').click(function(e){
			e.preventDefault();
			if($(this).hasClass("ui-btn-next-dis")) {
				parent.Public.tips({type:2, content : '已经没有下一张了！'});
				return false;
			} else {
				_self.idPostion = _self.idPostion + 1;
				if(_self.idLength === _self.idPostion + 1) {
					$(this).addClass("ui-btn-next-dis");
				};
				loading = $.dialog.tips('数据加载中...', 1000, 'loading.gif', true);
				Public.ajaxGet('/basedata/sales.json?action=update', {id : _self.idList[_self.idPostion]}, function(data){
					THISPAGE.reloadData(data.data);
					$("#prev").removeClass("ui-btn-prev-dis");
					if(loading) {
						loading.close();
					};
				});
			};
		});	
	},
	resetData: function(){
		var _self = this;
		$("#grid").clearGridData();
		for(var i=1; i<=8; i++) {
			$("#grid").jqGrid('addRowData', i, {});
			$("#grid").jqGrid('footerData', 'set', { qty:0, amount: 0 });
		};
		_self.$_note.val('');
		_self.$_discountRate.val(originalData.disRate);
		_self.$_deduction.val(originalData.disAmount);
		_self.$_discount.val(originalData.amount);
		_self.$_payment.val(originalData.rpAmount);
		_self.$_arrears.val(originalData.arrears);
	},
	calTotal: function(){
		var ids = $("#grid").jqGrid('getDataIDs');
		var total_quantity = 0, total_deduction = 0, total_amount = 0, total_tax = 0, total_taxAmount = 0;
		for(var i = 0, len = ids.length; i < len; i++){
			var id = ids[i];
			var row = $("#grid").jqGrid('getRowData',id);
			if(row.qty) {
				total_quantity += parseFloat(row.qty);
			};
			if(row.deduction) {
				total_deduction += parseFloat(row.deduction);
			};
			if(row.amount) {
				total_amount += parseFloat(row.amount);
			};
			if(row.tax) {
				total_tax += parseFloat(row.tax);
			};
			if(row.taxAmount) {
				total_taxAmount += parseFloat(row.taxAmount);
			};
		};
		$("#grid").jqGrid('footerData', 'set', { qty:total_quantity, deduction:total_deduction, amount: total_amount, tax:total_tax, taxAmount: total_taxAmount});
		if(taxRequiredCheck) {
			var discountVal = (total_taxAmount - Number(this.$_deduction.val())).toFixed(2);
		} else {
			var discountVal = (total_amount - Number(this.$_deduction.val())).toFixed(2);	
		};
		var arrearsVal = (discountVal - Number(this.$_payment.val())).toFixed(2);
		this.$_discount.val(discountVal);
		this.$_arrears.val(arrearsVal);		
/*		var footerDataAmount = parseFloat($("#grid").jqGrid('footerData', 'get').amount.replace(/,/g,''));
		console.log(footerDataAmount)
		var total_amount = footerDataAmount + (new_data - old_data);
		$("#grid").jqGrid('footerData', 'set', { amount: total_amount});*/
	},
	_getEntriesData: function(){
		var entriesData = [];
		var ids = $("#grid").jqGrid('getDataIDs');
		for(var i = 0, len = ids.length; i < len; i++){
			var id = ids[i], itemData;
			var row = $("#grid").jqGrid('getRowData',id);
			if(row.goods === '') {
				continue;	//跳过无效分录
			};
			var goodsInfo = $('#' + id).data("goodsInfo");
			var storageInfo = $('#' + id).data("storageInfo");
			//console.log(goodsInfo)
			//console.log(storageInfo)
			itemData = {
				invId: goodsInfo.id,
				invNumber: goodsInfo.number,
				invName: goodsInfo.name,
				invSpec: goodsInfo.spec,
				unitId: goodsInfo.unitId,
				mainUnit: goodsInfo.unitName,
				qty: row.qty,
				price: row.price,
				discountRate: row.discountRate,
				deduction: row.deduction,
				amount: row.amount,
				locationId: storageInfo.id,
				locationName: storageInfo.name
			};
			if(taxRequiredCheck) {
				itemData.taxRate = row.taxRate;
				itemData.tax = row.tax;
				itemData.taxAmount = row.taxAmount;
			}
			entriesData.push(itemData);
		};

		return entriesData;
		//var ret = $("#grid").jqGrid('getRowData',id);
	},
	getPostData: function(){
		var self = this;
		if(curRow !== null && curCol !== null){
		   $("#grid").jqGrid("saveCell", curRow, curCol);
		   curRow = null;
		   curCol = null;
		};
		var customerId = self.customerCombo.getValue();
		if(customerId === '') {
			parent.Public.tips({type: 2, content: '客户信息不能为空！'});   
			return false;
		}
		var entries = this._getEntriesData();
		if(entries.length > 0) {
			//self.calTotal();
			var postData = {
				id: originalData.id,	//单据ID
				buId: customerId,	//客户ID
				contactName: self.customerCombo.getText(),	//客户名称
				date: $.trim(self.$_date.val()),	//日期
				billNo: $.trim(self.$_number.text()),	//单据编号
				transType: self.classes.getValue(),	//单据类型
				entries: entries,	//分录数据
				totalQty: $("#grid").jqGrid('footerData', 'get').qty.replace(/,/g,''),	//合计数量
				totalDiscount: $("#grid").jqGrid('footerData', 'get').deduction.replace(/,/g,''),	//合计折扣额
				totalAmount: $("#grid").jqGrid('footerData', 'get').amount.replace(/,/g,''),	//合计金额
				description: $.trim(self.$_note.val()),	//备注
				disRate: $.trim(self.$_discountRate.val()),	//折扣率
				disAmount: $.trim(self.$_deduction.val()),	//折扣额
				amount: $.trim(self.$_discount.val()),	//折后金额
				rpAmount: $.trim(self.$_payment.val()),	//本次收款
				arrears: $.trim(self.$_arrears.val()),	//本次欠款
				totalArrears: ''/*$.trim(self.$_totalArrears.val())*/	//总欠款
			};
			if(taxRequiredCheck){
				postData.totalTax = $("#grid").jqGrid('footerData', 'get').tax.replace(/,/g,'');	//合计税金
				postData.totalTaxAmount = $("#grid").jqGrid('footerData', 'get').taxAmount.replace(/,/g,'');	//合计价税合计
			};
			if(requiredMoney) {
				postData.accId = self.accountCombo.getValue();
				postData.accounts = self.$_accountInfo.data('accountInfo');
				if(Number(postData.rpAmount) !== 0 && postData.accId === 0) {
					parent.Public.tips({type: 1, content: '请选择结算账户！'});
					return false;
				};
				if(Number(postData.rpAmount) === 0 && postData.accId !== 0) {
					parent.Public.tips({type: 1, content: '结算账户不为空时，需要输入收款额！！'});
					return false;
				};
				if(postData.accId === -1 && !postData.accounts) {
					parent.Public.tips({type: 1, content: '请检查账户信息是否正确！'});
					return false;
				};
			}
/*			if(originalData.stata !== "add") {
				postData.id = originalData.id;
			};*/
			return postData;
		} else {
			parent.Public.tips({type: 2, content: '商品信息不能为空！'});
			$("#grid").jqGrid("editCell", 1, 2, true);
			return false;
		}
	}
};

var hasLoaded = false, originalData;
if(!urlParam.id) {
	originalData = {
		id: -1,
		status: "add",	//操作类型
		customer: 0,
		//date: initData.date,
		//number: initData.number,
		transType: 150601,
		entries: [
			{id:"1", mainUnit: null},
			{id:"2"},
			{id:"3"},
			{id:"4"},
			{id:"5"},
			{id:"6"},
			{id:"7"},
			{id:"8"}
		],
		totalQty: 0,
		totalDiscount: 0,
		totalAmount: 0,
		totalTax: 0,
		totalTaxAmount: 0,
		disRate: 0,
		disAmount: 0,
		amount: '0.00',
		rpAmount: '0.00',
		arrears: '0.00',
		accId: 0
	};
	THISPAGE.init(originalData);
//新增
} else {
  //编辑
  if(!hasLoaded) {
	var $_bills = $('.bills').hide();
	Public.ajaxGet('/basedata/sales.json?action=update', {id : urlParam.id}, function(data){
		if(data.status === 200) {
			originalData = data.data;
			THISPAGE.init(data.data);
			$_bills.show();
			hasLoaded = true;
		} else {
			parent.Public.tips({type: 1, content : data.msg});
		}
  	});
  } else {
  
  };
} 