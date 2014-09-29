var curRow, curCol, curArrears, loading, SYSTEM = parent.SYSTEM, VERSION = parent.SYSTEM.siType;
var urlParam = Public.urlParam();
var qtyPlaces = Number(parent.SYSTEM.qtyPlaces), pricePlaces = Number(parent.SYSTEM.pricePlaces), amountPlaces = Number(parent.SYSTEM.amountPlaces);
if(VERSION === 2) {
	var accountId = 4;
	var billId = initBillId = 6;
} else {
	var accountId = 9;
};
var THISPAGE = {
	init: function(data){
		this.loadGrid(data);
		this.initDom(data);		
		this.initCombo();
		if(VERSION === 2) {
			$('#standardVersion').show();
			this.extendFun(data);
		};
		this.addEvent();
	},
	initDom: function(data){
		var _self = this;
		this.$_customer = $('#customer');
		this.$_date = $('#date').val(SYSTEM.endDate);
		this.$_number = $('#number');
		this.$_discount = $('#discount');
		this.$_payment = $('#payment');
		this.$_toolTop = $('#toolTop');
		this.$_toolBottom = $('#toolBottom');
		this.$_note = $('#note');
		if(data.status === 'add') {
			var defaultSelected = 0;
		} else {
			var defaultSelected = ['id', data.buId];
		};
		var opt_supplier = {
			addOptions: {text:'(请选择销货单位)', value: -1},
			extraListHtml: ''
		};
		
		if(VERSION === 2) {
			opt_supplier.callback = {
				onChange: function(data){
					originalData.buId = data.id;
					_self.resetGridData();
					//_self.billCombo.loadData('/sales.html?action=findUnhxList&buId=' + data.id + '&id=' + originalData.id);
				}
			}
		};
		
		this.customerCombo = Business.customerCombo($('#customer'), opt_supplier);
		this.customerCombo.selectByValue(data.buId, false);
		
		this.$_date.datepicker();//.datepicker("setDate", data.date);
		
		this.$_discount.val(data.discount);
		this.$_payment.val(data.payment);
			
		if(data.id > 0) {
			this.$_number.text(data.billNo);
			this.$_date.val(data.date);
			this.$_note.val(data.description);
			//$("#grid").jqGrid('footerData', 'set', { qty:data.totalQty, amount: data.totalAmount });
			if(data.status === 'edit') {
				/*this.$_toolTop.html('<div class="fl"><!--<a id="add" class="ui-btn ui-btn-sp mrb">新增</a>--><a id="edit" class="ui-btn mrb">保存</a><!--<a id="print" class="ui-btn mrb">打印</a></div><div class="fr"><a class="ui-btn-prev mrb" id="prev" title="上一张"><b></b></a><a class="ui-btn-next" id="next" title="下一张"><b></b></a>--></div>').show();*/
				this.$_toolBottom.html('<a id="add" class="ui-btn ui-btn-sp mrb">新增</a><a id="edit" class="ui-btn mrb">保存</a>');
			} else {
				this.$_toolBottom.html('<a id="add" class="ui-btn ui-btn-sp mrb">新增</a><a class="ui-btn-prev mrb" id="prev" title="上一张"><b></b></a><a class="ui-btn-next" id="next" title="下一张"><b></b></a>');
			};
			//打印权限限制
			$('#print').on('click',function(e){
				if (!Business.verifyRight('RECEIPT_PRINT')) {
					e.preventDefault();
					return ;
				};
			});
			this.salesListIds = parent.salesListIds || [];	//单据ID数组
			this.idPostion = $.inArray(String(data.id), this.salesListIds);	//当前单据ID位置
			this.idLength = this.salesListIds.length;
			if(this.idPostion === 0) {
				$("#prev").addClass("ui-btn-prev-dis");
			}
			if(this.idPostion === this.idLength - 1) {
				$("#next").addClass("ui-btn-next-dis");
			}
		} else {
			this.$_toolBottom.html('<a id="savaAndAdd" class="ui-btn ui-btn-sp mrb">保存并新增</a><a id="save" class="ui-btn">保存</a>');
		};

	},
	loadGrid: function(data){
		var _self = this;
		if(data.id) {
			var len_ac = data.accounts.length, gap_ac = accountId - len_ac - 1;
			if(gap_ac > 0) {
				for(var i = 0; i < gap_ac; i++) {
					data.accounts.push({ id: len_ac + i + 1 });
				};
			} else {
				accountId = len_ac + 1;
			};
		};
		$("#accountGrid").jqGrid({
			data: data.accounts,
			datatype: "clientSide",
			width: 900,
			height: '100%',
			rownumbers: true,
			gridview: true,
			onselectrow: false,
			colModel:[
				{name:'operating', label:' ', width:40, fixed:true, formatter:Public.billsOper, align:"center"},
				{name:'accName', label:'结算账户', width:200, classes: 'ui-ellipsis', editable:true, edittype:'custom', editoptions:{custom_element: accountElem, custom_value: accountValue, handle: accountHandle/*, trigger:'ui-icon-triangle-1-s account-trigger'*/}},
				{name:'payment', label:'收款金额', width:100, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}, editable:true},
				{name:'wayName', label:'结算方式', width:100, editable:true, edittype:'custom', editoptions:{custom_element: paymentElem, custom_value: paymentValue, handle: paymentHandle, trigger:'ui-icon-triangle-1-s payment-trigger'}},
				{name:'settlement', label:'结算号', width:100, editable:true},
				{name:'remark', label:'备注', width:200, editable:true}
			],
			cmTemplate: {sortable: false, title:false},
			idPrefix: 'ac',	//表格id前缀
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
			  root: "data.account", 
			  records: "records",  
			  repeatitems : false,
			  id: "id"
			},
			loadComplete: function(data) {
				if(urlParam.id > 0){
					_self.paymentTotal();
					var rows = data['rows'];
					for(var i = 0, len = rows.length; i < len; i++) {
						var tempId = i + 1, row = rows[i];
						if($.isEmptyObject(rows[i])){
							break;
						};
						$('#ac' + tempId).data('accountInfo', {
							id: row.accId,
							name: row.accName
						}).data('paymentInfo', { 
							id: row.wayId, 
							name: row.wayName
						});
					};
				}
			},
			afterEditCell: function (rowid,name,val,iRow,iCol){
				if(name==='accName') {
					$("#"+iRow+"_accName", "#accountGrid").val(val);
					_self.accountCombo.selectByText(val);
				};
				if(name==='wayName') {
					$("#"+iRow+"_wayName", "#accountGrid").val(val);
					//setTimeout(function(){ $('.storageAuto').trigger('click'); }, 10)	//自动下拉显示
				};
			},
			afterSaveCell : function(rowid,name,val,iRow,iCol) {
				accountId = _self.newId;
				if(name == 'payment') {
					_self.paymentTotal();
					if(VERSION === 2) {
						_self.$_discount.trigger('keyup');
					};
				};
			},
			afterRestoreCell : function(rowid, value, iRow, iCol) {
				accountId = _self.newId;
			},
			loadonce: true,
			footerrow : true,
			userData: { accName: "合计：", payment: data.acPayment },
			userDataOnFooter : true
		});
		$("#accountGrid").jqGrid('setGridParam',{cellEdit: true});
		function accountElem(value, options) {
		  	var el = $('.accountAuto')[0];
		  	return el;
		};
		 
		function accountValue(elem, operation, value) {
			if(operation === 'get') {
			   if($('.accountAuto').getCombo().getValue() !== '') {
				  return $(elem).val();
			   } else {
				  var parentTr = $(elem).parents('tr');
				  parentTr.removeData('accountInfo');
				  return '';
			   }
			} else if(operation === 'set') {
			   $('input', elem).val(value);
			}
		};
		
		function accountHandle() {
		    $('#initCombo').append($('.accountAuto').val(''));
		};
		
		function paymentElem(value, options) {
		  	var el = $('.paymentAuto')[0];
		  	return el;
		};
		 
		function paymentValue(elem, operation, value) {
			if(operation === 'get') {
			   if($('.paymentAuto').getCombo().getValue() !== '') {
				  return $(elem).val();
			   } else {
				  var parentTr = $(elem).parents('tr');
				  parentTr.removeData('paymentInfo');
				  return '';
			   }
			} else if(operation === 'set') {
			   $('input', elem).val(value);
			}
		};
		
		function paymentHandle() {
		    $('#initCombo').append($('.paymentAuto').val(''));
		};
	},
	extendFun: function(data) {
		var _self = this;
		if(data.id) {
			var len_en = data.entries.length, gap = initBillId - len_en - 1;
			if(gap > 0) {
				for(var i = 0; i < gap; i++) {
					data.entries.push({ id: len_en + i + 1 });
				};
			} else {
				billId = len_en + 1;
			};
		};
		$("#grid").jqGrid({
			data: data.entries,
			datatype: "clientSide",
			width: 900,
			height: '100%',
			idPrefix: 'so',	//表格id前缀
			rownumbers: true,
			gridview: true,
			onselectrow: false,
			//colNames:['商品', '单位', '数量', '销售单价', '销售金额', '仓库'],
			colModel:[
				{name:'operating', label:' ', width:40, fixed:true, formatter:Public.billsOper, align:"center"},
				{name:'billNo', label:'源单编号', width:150, title:false, classes: 'ui-ellipsis'/*, editable:true, edittype:'custom', editoptions:{custom_element: billElem, custom_value: billValue, handle: billHandle}*/},
				{name:'transType', label:'业务类别', width:100, title:false},
				{name:'billDate', label:'单据日期', width:100, title:false, align:"center"},
				{name:'billPrice', label:'单据金额', width:100, title:false, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}},
				{name:'hasCheck', label:'已核销金额', width:100, title:false, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}},	
				{name:'notCheck', label:'未核销金额', width:100, title:false, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}},	
				{name:'nowCheck', label:'本次核销金额', width:100, title:false, align:"right", formatter:'currency', formatoptions:{showZero: true, decimalPlaces: amountPlaces}, editable:true}
			],
			cmTemplate: {sortable: false},
			//idPrefix: 'ys',	//表格id前缀
			//loadui: 'block',
			shrinkToFit: true,
			forceFit: true,
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
				if(urlParam.id > 0){
					_self.calTotal(false);
					var rows = data['rows'];
					for(var i = 0, len = rows.length; i < len; i++) {
						var tempId = i + 1, row = rows[i];
						if(row.billId === undefined){
							break;
						};
						$('#so' + tempId).data('billInfo', row);
					};
				}
			},
			gridComplete: function(){

			},
			afterEditCell: function (rowid,name,val,iRow,iCol){
				if(name==='billNo') {
					$("#"+iRow+"_billNo","#grid").val(val);
					_self.billCombo.selectByText(val);
				};
			},
			formatCell: function(rowid,name,val,iRow,iCol) {
				
			},
			beforeSubmitCell: function(rowid,name,val,iRow,iCol) {
				
			},
			afterSaveCell : function(rowid,name,val,iRow,iCol) {
				billId = _self.newId;
				if(name == 'billNo') {
					var billInfo = $('#' + rowid).data('billInfo');
					if(billInfo) {
						var su =  $("#grid").jqGrid('setRowData', rowid, { transType: billInfo.transType, billDate: billInfo.billDate, billPrice: billInfo.billPrice, hasCheck: billInfo.hasCheck, notCheck: billInfo.notCheck });
						if(su) {
							_self.calTotal();
						}
						/*var footerDataAmount = parseFloat($("#grid").jqGrid('footerData', 'get').amount.replace(/,/g,''));
						if(isNaN(footerDataAmount)) {
							$("#grid").jqGrid('footerData', 'set', { amount: 0 + goodsInfo.price})
						} else {
							$("#grid").jqGrid('footerData', 'set', { amount: footerDataAmount + parseFloat(goodsInfo.price)})
						}*/
						
					}
				};

				if(name == 'nowCheck') {
					_self.calTotal(false);
				};
			},
			afterRestoreCell : function(rowid, value, iRow, iCol) {
				billId = _self.newId;
			},
			loadonce: true,
			//postData:{aaa:"人民币", bb: [1, '什么'], cc: { name: '张山', age: 30, work: ['财务', '出纳']}}, //此数组内容直接赋值到url上，参数类型：{name1:value1…}
			footerrow : true,
			userData: { billNo: "合计：", billPrice: data.billPrice, hasCheck: data.billHasCheck, notCheck: data.billNotCheck, nowCheck: data.billNowCheck },
			userDataOnFooter : true,
			loadError : function(xhr,st,err) {
				Public.tips({type: 1, content : "Type: "+st+"; Response: "+ xhr.status + " "+xhr.statusText});
			}
		});
		$("#grid").jqGrid('setGridParam',{cellEdit: true});
		
		function billElem(value, options) {
		  var el = $('.billAuto')[0];
		  return el;
		};
		 
		function billValue(elem, operation, value) {
			if(operation === 'get') {
			   //console.log($('.goodsAuto').getCombo().getValue())
			   if($('.billAuto').getCombo().getValue() !== '') {
				  return $(elem).val();
			   } else {
				  var parentTr = $(elem).parents('tr');
				  parentTr.removeData('billInfo');
				  return '';
			   }
			} else if(operation === 'set') {
			   $('input',elem).val(value);
			}
		};
		
		function billHandle() {
		  	$('#initCombo').append($('.billAuto').val('').unbind("focus.once"));
		};
		
		//var billData = originalData.id > 0 ? '/sales.html?action=findUnhxList&buId=' + originalData.buId  + '&id=' + originalData.id: [];
		
/*		this.billCombo = $('.billAuto').combo({
			data: '/sales.html?action=findUnhxList&buId=' + originalData.buId  + '&id=' + originalData.id,
			ajaxOptions: {
				formatData: function(data){
					return data.data.items;
				}	
			},
			text: 'billNo',
			value: 'billId',
			defaultSelected: 0,
			editable: true,
			trigger: false,
			defaultFlag: false,
			callback: {
				onChange: function(data){
					var parentTr = this.input.parents('tr');
					if(data) {
						parentTr.data('billInfo', data);
					};
				}
			}
		}).getCombo();*/
	},
	reloadData: function(data){
		$("#grid").clearGridData();
		//重载基础数据
		var _self = this;
		function _reloadBase(){
			_self.customerCombo.selectByValue(data.buId, false);
			_self.$_date.val(data.date);
			_self.$_number.text(data.billNo);
			data.classes === 'sales' ? _self.classes.setValue(0) : _self.classes.setValue(1);
			_self.$_note.val(data.note);
			_self.$_discountRate.val(data.disRate);
			_self.$_deduction.val(data.disAmount);
			_self.$_discount.val(data.amount);
			_self.$_payment.val(data.rpAmount);
			_self.$_arrears.val(data.arrears);	
			_self.$_totalArrears.val(data.totalArrears);
		};
		var gap = 8 - data.entries.length;
		if(gap > 0) {
			for(var i = 0; i < gap; i++) {
				data.entries.push({});
			};
		};
		if(data.status === 'edit') {
			$("#grid").jqGrid('setGridParam',{data: data.entries, userData: { qty: data.totalQty, amount: data.totalAmount }, cellEdit:true, datatype: "clientSide"}).trigger("reloadGrid");
			_reloadBase();
			if(!this.editable) {
				this.customerCombo.enable();
				this.$_date.removeAttr('disabled');
				//this.$_discount.removeAttr('disabled');
				this.$_discountRate.removeAttr('disabled');
				this.$_deduction.removeAttr('disabled');
				this.$_payment.removeAttr('disabled');
				this.editable = true;
			};
		} else {
			$("#grid").jqGrid('setGridParam',{url:'', datatype: "json", cellEdit:false}).trigger("reloadGrid");
			_reloadBase();
			if(this.editable) {
				this.customerCombo.disable();
				this.$_data.attr(disabled, 'disabled');
				//this.$_discount.attr(disabled, 'disabled');
				this.$_discountRate.attr(disabled, 'disabled');
				this.$_deduction.attr(disabled, 'disabled');
				this.$_payment.attr(disabled, 'disabled');
				this.editable = false;
			}
		}
	},
	initCombo: function(){		
		this.accountCombo = $('.accountAuto').combo({
			data: '/basedata/settAcctList.json?action=list',
			ajaxOptions: {
				formatData: function(data){
					return data.data.items;
				}	
			},
			formatText: function(data){
				return data.number + ' ' + data.name;
			},
			value: 'id',
			defaultSelected: 0,
			editable: true,
			trigger: false,
			defaultFlag: false,
			callback: {
				onChange: function(data){
					var parentTr = this.input.parents('tr');
					if(data) {
						parentTr.data('accountInfo', data);
					};
				}
			}
		}).getCombo();
		
		Business.paymentCombo($('.paymentAuto'), {
			callback: {
				onChange: function(data){
					var parentTr = this.input.parents('tr');
					if(data) {
						parentTr.data('paymentInfo', data);
					};
				}
			}
		});
		
		var billData = originalData.id > 0 ? '/sales.html?action=findUnhxList&buId=' + originalData.buId + '&id=' + originalData.id : [];
		
		this.billCombo = $('.billAuto').combo({
			data: billData,
			ajaxOptions: {
				formatData: function(data){
					return data.data.items;
				}	
			},
			text: 'billNo',
			value: 'billId',
			defaultSelected: 0,
			editable: true,
			trigger: false,
			defaultFlag: false,
			callback: {
				onChange: function(data){
					var parentTr = this.input.parents('tr');
					if(data) {
						parentTr.data('billInfo', data);
					};
				}
			}
		}).getCombo();
	},
	addEvent: function(){
		var _self = this;
		this.customerCombo.input.enterKey();
		this.$_note.enterKey();
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
		
		this.$_discount.keyup(function(){
			var val = parseFloat($(this).val()) || 0;
			var tol_payment = Number($("#accountGrid").jqGrid('footerData', 'get').payment.replace(/,/g,''));
			var tol_nowCheck = Number($("#grid").jqGrid('footerData', 'get').nowCheck.replace(/,/g,''));
			var thePayment = (tol_payment - (tol_nowCheck ? tol_nowCheck : 0) + val).toFixed(amountPlaces);
			_self.$_payment.val(thePayment);
		}).on('keypress', function(e){
			Public.numerical(e);
		}).on('focus', function(){
			this.select();
		});

		//付款方式下拉显示
		$('.grid-wrap').on('click', '.account-trigger', function(e){
			setTimeout(function(){ _self.accountCombo._onTriggerClick(); }, 10);
		});
		
		$('.grid-wrap').on('click', '.payment-trigger', function(e){
			setTimeout(function(){ $('.paymentAuto').trigger('click'); }, 10);
		});
		
		//取消分录编辑状态
		$(document).bind('click.cancel', function(e){
			if(curRow !== null && curCol !== null){
			   if(!$(e.target).closest("#accountGrid").length > 0) {
				  $("#accountGrid").jqGrid("saveCell", curRow, curCol);
			   }
			   if(!$(e.target).closest("#grid").length > 0) {
				  $("#grid").jqGrid("saveCell", curRow, curCol);		   	  
			   }
			   curRow = null;
			   curCol = null;
			};
		});
		
		//新增分录
		$('#acGridWrap').on('click', function(){
			_self.newId = accountId
			//console.log(111)
		});
		
		$('#billGridWrap').on('click', function(){
			_self.newId = billId;
		});
		

		
		$('#acGridWrap').on('click', '.ui-icon-plus', function(e){
			_self.newId = accountId;
			var rowId = 'ac' + $(this).parent().data('id');
			var newId = $('#accountGrid tbody tr').length;
			var datarow = { id: _self.newId };
			var su = $("#accountGrid").jqGrid('addRowData', _self.newId, datarow, 'after', rowId);
			if(su) {
				$(this).parents('td').removeAttr('class');
				$(this).parents('tr').removeClass('selected-row ui-state-hover');
				$("#accountGrid").jqGrid('resetSelection');
				accountId++;
			}
		});
		//删除分录
		$('#acGridWrap').on('click', '.ui-icon-trash', function(e){
			if($('#accountGrid tbody tr').length === 2) {
				parent.Public.tips({type: 2, content: '至少保留一条分录！'});
				return false;
			}
			var rowId = 'ac' + $(this).parent().data('id');
			var su = $("#accountGrid").jqGrid('delRowData', rowId);
			if(su) {
				_self.calTotal();
			};
		});
		
		$('#billGridWrap').on('click', '.ui-icon-plus', function(e){
			_self.newId = billId;
			var rowId = 'so' + $(this).parent().data('id');
			var newId = $('#grid tbody tr').length;
			var datarow = { id: _self.newId };
			var su = $("#grid").jqGrid('addRowData', _self.newId, datarow, 'after', rowId);
			if(su) {
				$(this).parents('td').removeAttr('class');
				$(this).parents('tr').removeClass('selected-row ui-state-hover');
				$("#grid").jqGrid('resetSelection');
				billId++;
			}
		});
		//删除分录
		$('#billGridWrap').on('click', '.ui-icon-trash', function(e){
			if($('#grid tbody tr').length === 2) {
				parent.Public.tips({type: 2, content: '至少保留一条分录！'});
				return false;
			}
			var rowId = 'so' + $(this).parent().data('id');
			var su = $("#grid").jqGrid('delRowData', rowId);
			if(su) {
				_self.calTotal();
			};
		});
			
		//保存
		$('.wrapper').on('click', '#save', function(e){
			e.preventDefault();
			if (!Business.verifyRight('RECEIPT_ADD')) {
				return ;
			};
			var postData = THISPAGE.getPostData();
			//console.log(postData)
			if(postData) {
				if(originalData.stata === 'edit') {
					postData.id = originalData.id;
					postData.stata = 'edit';
				};
				Public.ajaxPost('/scm/receipt.do?action=add', {postData: JSON.stringify(postData)}, function(data){
					if(data.status === 200) {
						originalData.id = data.data.id;
						_self.$_toolBottom.html('<a id="add" class="ui-btn ui-btn-sp mrb">新增</a><a id="edit" class="ui-btn mrb">保存</a>');
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
			if (!Business.verifyRight('RECEIPT_UPDATE')) {
				return ;
			};
			var postData = THISPAGE.getPostData();
			if(postData) {
				Public.ajaxPost('/scm/receipt.do?action=updateReceipt', {postData: JSON.stringify(postData)}, function(data){
					if(data.status === 200) {
						originalData.id = data.data.id;
						parent.Public.tips({content : '修改成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				})
			}
		});

		//保存并新增
		$('.wrapper').on('click', '#savaAndAdd', function(e){
			e.preventDefault();
			if (!Business.verifyRight('RECEIPT_ADD')) {
				return ;
			};
			var postData = THISPAGE.getPostData();
			//console.log(postData)
			if(postData) {
				Public.ajaxPost('/scm/receipt.do?action=addNew', {postData: JSON.stringify(postData)}, function(data){
					if(data.status === 200) {
						_self.$_number.text(data.data.billNo);
						$("#accountGrid").clearGridData(true);	
						for(var i=1; i<=5; i++) {
							$("#accountGrid").jqGrid('addRowData', i, {});
							//$("#grid").jqGrid('footerData', 'set', { qty:0, amount: 0 });
						};
						accountId = 6;
						if(VERSION === 2) {
							$("#grid").clearGridData(true);
							for(var i=1; i<=3; i++) {
								$("#grid").jqGrid('addRowData', i, {});
								//$("#grid").jqGrid('footerData', 'set', { qty:0, amount: 0 });
							};
						};
						_self.$_note.val('');
						_self.$_discount.val(originalData.discount);
						_self.$_payment.val(originalData.payment);
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
			if (!Business.verifyRight('RECEIPT_ADD')) {
				return ;
			};
			parent.tab.overrideSelectedTabItem({tabid: 'money-receipt', text: '收款单', url: '/scm/receipt.do?action=initReceipt'});
/*			if(parent.tab.isTabItemExist('sales-sales') ) {
				parent.tab.reload('sales-sales');
			} else {
				parent.tab.addTabItem({tabid: 'sales-sales', text: '销售单', url: '/sales.html?action=initSale'});
			}*/
			//parent.tab.reload("sales");
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
				Public.ajaxGet('/sales.html?action=update', {id : _self.salesListIds[_self.idPostion]}, function(data){
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
				Public.ajaxGet('/sales.html?action=update', {id : _self.salesListIds[_self.idPostion]}, function(data){
					THISPAGE.reloadData(data.data);
					$("#prev").removeClass("ui-btn-prev-dis");
					if(loading) {
						loading.close();
					};
				});
			};
		});
		//弹出源单批量选择
		$('#selectSource').on('click', function(){
			if(originalData.buId <= 0) {
				parent.Public.tips({type: 1, content: '请先选择销货单位！'});
				return false;
			};
			var $_grid = $('#grid');
			$.dialog({
				width: 765,
				height: 510,
				title: '选择源单',
				content: 'url:/scm/receipt.do?action=initUnhxList',
				data: {url:'/sales.html?action=findUnhxList&buId=' + originalData.buId  + '&id=' + originalData.id},
				lock: true,
				ok: function(){
					setFilter(this.content, $_grid);
				},
				cancel: true
			});
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
	paymentTotal: function(){
		var _self = this;
		var $_accountGrid = $("#accountGrid");
		var ids = $_accountGrid.jqGrid('getDataIDs');
		var total_quantity = 0, total_amount = 0;
		for(var i = 0, len = ids.length; i < len; i++){
			var id = ids[i];
			var row = $_accountGrid.jqGrid('getRowData',id);
			if(row.payment) {
				total_amount += parseFloat(row.payment);
			};
		};
		$_accountGrid.jqGrid('footerData', 'set', { payment: total_amount });
	},
	calTotal: function(flag){
		var _self = this;
		var ids = $("#grid").jqGrid('getDataIDs');
		var total_price = 0, total_hasCheck = 0, total_notCheck = 0, total_nowCheck = 0;
		for(var i = 0, len = ids.length; i < len; i++){
			var id = ids[i];
			var row = $("#grid").jqGrid('getRowData',id);
			if(flag !== false) {
				if(row.billPrice) {
					total_price += parseFloat(row.billPrice);
				};
				if(row.hasCheck) {
					total_hasCheck += parseFloat(row.hasCheck);
				};
				if(row.notCheck) {
					total_notCheck += parseFloat(row.notCheck);
				};
				$("#grid").jqGrid('footerData', 'set', { billPrice: total_price, hasCheck: total_hasCheck, notCheck: total_notCheck });
	
			}
			if(row.nowCheck) {
				total_nowCheck += parseFloat(row.nowCheck);
			};
		};
		$("#grid").jqGrid('footerData', 'set', { nowCheck: total_nowCheck });
		if(flag === false) {
			return;
		};
		var paymentVal = Number($("#accountGrid").jqGrid('footerData', 'get').payment.replace(/,/g,''));
		var discountVal = Number(_self.$_discount.val());
		if(paymentVal > total_nowCheck) {
			_self.$_payment.val((paymentVal - total_nowCheck + discountVal).toFixed(2));
		} else {
			_self.$_discount.val((total_nowCheck - paymentVal).toFixed(2));
			_self.$_payment.val(0);
		};
		
/*		var footerDataAmount = parseFloat($("#grid").jqGrid('footerData', 'get').amount.replace(/,/g,''));
		console.log(footerDataAmount)
		var total_amount = footerDataAmount + (new_data - old_data);
		$("#grid").jqGrid('footerData', 'set', { amount: total_amount});*/
	},
	resetGridData: function(){
		$("#grid").clearGridData(true);
		for(var i=1; i<initBillId; i++) {
			$("#grid").jqGrid('addRowData', i, {});
		};
		$("#grid").jqGrid('footerData', 'set', { billNo: "合计：", billPrice: 0, hasCheck: 0, notCheck: 0, nowCheck: 0 } );
		billId = initBillId;
	},
	_getAccountsData: function(){
		var accountsData = [];
		var ids = $("#accountGrid").jqGrid('getDataIDs');
		for(var i = 0, len = ids.length; i < len; i++){
			var id = ids[i], itemData;
			var row = $("#accountGrid").jqGrid('getRowData',id);
			if(row.accName === '') {
				continue;	//跳过无效分录
			};
			var accountInfo = $('#' + id).data("accountInfo");
			var paymentInfo = $('#' + id).data("paymentInfo") || {};
			itemData = {
				accId: accountInfo.id,
				payment: row.payment,
				wayId: paymentInfo.id || 0,
				settlement: row.settlement,
				remark: row.remark
			};
			accountsData.push(itemData);
		};
		return accountsData;
		//var ret = $("#grid").jqGrid('getRowData',id);
	},
	_getEntriesData: function(){
		var entriesData = [];
		var ids = $("#grid").jqGrid('getDataIDs');
		for(var i = 0, len = ids.length; i < len; i++){
			var id = ids[i], itemData;
			var row = $("#grid").jqGrid('getRowData',id);
			if(row.billNo === '') {
				continue;	//跳过无效分录
			};
			var billInfo = $('#' + id).data("billInfo");
			//console.log(goodsInfo)
			//console.log(storageInfo)
			itemData = {
				billId: billInfo.billId,
				billNo: billInfo.billNo,
				billType: billInfo.billType,
				transType: billInfo.transType,
				billDate: billInfo.billDate,
				billPrice: billInfo.billPrice,
				hasCheck: billInfo.hasCheck,
				notCheck: billInfo.notCheck,
				nowCheck: row.nowCheck
			};
			entriesData.push(itemData);
		};

		return entriesData;
		//var ret = $("#grid").jqGrid('getRowData',id);
	},
	getPostData: function(){
		var self = this;
		if(curRow !== null && curCol !== null){
		   $("#grid").jqGrid("saveCell", curRow, curCol);
		   $("#accountGrid").jqGrid("saveCell", curRow, curCol);
		   curRow = null;
		   curCol = null;
		};
		var customerId = self.customerCombo.getValue();
		if(customerId === '' || customerId === -1) {
			parent.Public.tips({type: 2, content: '请选择购货单位！'});   
			return false;
		};
		
		var accounts = this._getAccountsData();
		
		if(accounts.length === 0) {
			parent.Public.tips({type: 2, content: '结算账户信息不能为空！'});
			$("#accountGrid").jqGrid("editCell", 1, 2, true);
			return false;
		};
		
		if(VERSION === 2) {
			var entries = this._getEntriesData();
		} else {
			var entries = [];
		};
		
		//self.calTotal();
		var postData = {
			id: originalData.id,	//单据ID
			buId: customerId,	//客户ID
			contactName: self.customerCombo.getText(),	//客户名称
			date: $.trim(self.$_date.val()),	//日期
			billNo: $.trim(self.$_number.text()),	//单据编号
			accounts: accounts, //账号数据
			entries: entries,	//分录数据
			discount: $.trim(self.$_discount.val()),	//整单折扣
			payment: $.trim(self.$_payment.val()),	//本次预付款
			description: $.trim(self.$_note.val())	//备注
		};
/*			if(originalData.stata !== "add") {
			postData.id = originalData.id;
		};*/
		return postData;
	}
};

var hasLoaded = false, originalData;
if(!urlParam.id) {
	originalData = {
		id: -1,
		status: "add",	//操作类型
		buId: -1,
		accounts: [
			{id:"1"},
			{id:"2"}
		],
		acPayment: 0,
		entries: [
			{id:"1"},
			{id:"2"},
			{id:"3"}
		],
		billPrice: 0,
		billHasCheck: 0,
		billNotCheck: 0,
		billNowCheck: 0,
		discount: '0.00',
		payment: '0.00'
	};
	THISPAGE.init(originalData);
//新增
} else {
  //编辑
  if(!hasLoaded) {
	Public.ajaxGet('/scm/receipt.do?action=update', {id : urlParam.id}, function(data){
		if(data.status === 200) {
			originalData = data.data;
			THISPAGE.init(data.data);
			hasLoaded = true;
		} else {
			parent.Public.tips({type: 1, content : data.msg});
		}
  	});
  } else {
  
  };
} 
function setFilter(dialogCtn, S_grid){
	var ids = dialogCtn.$("#grid").jqGrid('getGridParam', 'selarrrow'), 
		len = ids.length,
		rows = [];
	var scIds = S_grid.jqGrid('getDataIDs'), scLen = scIds.length, curID;
	for(var scPos = 0; scPos < scLen; scPos++) {
		var billInfo = $('#' + scIds[scPos]).data('billInfo');
		if(billInfo) {
			
		} else {
			curID = scIds[scPos];
			break;
		}
	};
	
	var gap = scLen - scPos;
	var add = len - gap;
	if(curID === undefined) {
		curID = 'so' + billId;
	};
	if(add > 0) {
		var addRow = [];
		while(add) {
			addRow.push({id: billId});
			add--;
			billId++;
		};
		$("#grid").jqGrid('addRowData', 'id', addRow, 'after', curID);
	}
	
	if(len > 0){
		//var scIds = S_grid.jqGrid('getDataIDs');
		$.each(ids, function(idx, val){
			var row = dialogCtn.$("#grid").jqGrid('getRowData', val);
			$("#grid").jqGrid('setRowData', curID, row);
			curID = $('#' + curID).data('billInfo', row).next().attr('id');
		});
	};
	THISPAGE.calTotal();
};