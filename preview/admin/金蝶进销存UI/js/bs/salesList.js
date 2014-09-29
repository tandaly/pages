var queryConditions = {
	matchCon: ''
} , system = parent.SYSTEM, billRequiredCheck = system.billRequiredCheck;
var THISPAGE = {
	init: function(data){
		this.initDom();
		this.loadGrid();			
		this.addEvent();
	},
	initDom: function(){
		this.$_matchCon = $('#matchCon');
		this.$_beginDate = $('#beginDate').val(system.beginDate);	
		this.$_endDate = $('#endDate').val(system.endDate);
		this.$_matchCon.placeholder();
		this.$_beginDate.datepicker();	
		this.$_endDate.datepicker();
/*		if(billRequiredCheck) {
			this.rownumbers = false;
			this.multiselect = true;
			//$('#add').addClass('mrb').after('<a class="ui-btn mrb" id="audit">审核</a><a class="ui-btn" id="reAudit">反审核</a>');
		} else {
			this.rownumbers = true;
			this.multiselect = false;
		};*/
	},
	loadGrid: function(){
		var height = $(window).height() - $(".grid-wrap").offset().top - 65, _self = this;
		queryConditions.beginDate = this.$_beginDate.val();
		queryConditions.endDate = this.$_endDate.val();
		_self.markRow = [];	//退货情况
		var colModel = [
				{name:'operating', label:'操作', width:60, fixed:true, formatter:operFmatter, align:"center"},
				{name:'billDate', label:'单据日期', index:'billDate', width:100, align:"center"},
				{name:'billNo', label:'单据编号', index:'billNo', width:120, align:"center"},
				{name:'transType', label:'业务类别', index:'transType', width:100, formatter:transFmatter, align:"center"},
				{name:'contactName', label:'客户', index:'contactName', width:200},
				{name:'totalAmount', label:'销售金额', index:'totalAmount', width:100, align:"right", formatter:'currency'},
				{name:'amount', label:'折后金额', index:'amount', width:100, align:"right", formatter:'currency'},
				{name:'rpAmount', label:'已收款金额', index:'rpAmount', width:100, align:"right", formatter:'currency'},	
				{name:'description', label:'备注', index:'description', width:200, classes: 'ui-ellipsis'},
				{name:'checkName', label:'审核人', index:'checkName', width:80, hidden: billRequiredCheck ? false : true, fixed:true, align:'center', title:false}
			];
		$("#grid").jqGrid({
			url:'/basedata/salelist.json',
			postData: queryConditions,
			datatype: "json",
			//caption: "科目余额表",
			autowidth: true,//如果为ture时，则当表格在首次被创建时会根据父元素比例重新调整表格宽度。如果父元素宽度改变，为了使表格宽度能够自动调整则需要实现函数：setGridWidth
			//width: width,
			height: height,
			altRows: true, //设置隔行显示
			//rownumbers: _self.rownumbers,//如果为ture则会在表格左边新增一列，显示行顺序号，从1开始递增。此列名为'rn'
			gridview: true,
			multiselect: true,
			//multiboxonly: true,
			colModel: colModel,
			cmTemplate: {sortable: false, title: false},
			page: 1, 
			sortname: 'number',    
			sortorder: "desc", 
			pager: "#page",  
			rowNum: 100,  
			//rowTotal: 2000,
			rowList:[100,200,500],     
			//scroll: 1, //创建一个动态滚动的表格，当为true时，翻页栏被禁用，使用垂直滚动条加载数据，且在首次访问服务器端时将加载所有数据到客户端。当此参数为数字时，表格只控制可见的几行，所有数据都在这几行中加载
			//scrollOffset: 120, //设置垂直滚动条宽度
			//loadonce: true,
			viewrecords: true,
			shrinkToFit: false,
			forceFit: false,
			//cellLayout: 10,
			//loadonce: true,
			//postData:{aaa:"人民币", bb: [1, '什么'], cc: { name: '张山', age: 30, work: ['财务', '出纳']}}, //此数组内容直接赋值到url上，参数类型：{name1:value1…}
			//footerrow : true,
			//userDataOnFooter : true,
			jsonReader: {
			  root: "data.rows", 
			  records: "data.records", 
			  total: "data.total", 
			  repeatitems : false,
			  id: "id"
			},
			loadComplete:  function(data) {
				var markLen = _self.markRow.length;
				if(markLen > 0) {
					for(var i = 0; i < markLen; i++) {
						$('#' + _self.markRow[i]).addClass('red');
					}
				}
			},
			loadError : function(xhr,st,err) {
				
			},
			ondblClickRow : function(rowid, iRow, iCol, e){
				$('#' + rowid).find('.ui-icon-pencil').trigger('click');
			}
		});
		
	
		function operFmatter (val, opt, row) {
			var html_con = '<div class="operating" data-id="' + row.id + '"><a class="ui-icon ui-icon-pencil" title="修改"></a><a class="ui-icon ui-icon-trash" title="删除"></a></div>';
			return html_con;
		};
		
		function transFmatter (val, opt, row) {
			if(val === 150601) {
				return '销货';
			} else {
				_self.markRow.push(row.id);
				return '退货';
			};
		};

	},
	reloadData: function(data){
		this.markRow = [];
		$("#grid").jqGrid('setGridParam',{url:'/basedata/salelist.json', datatype: "json", postData: data}).trigger("reloadGrid");
	},
	addEvent: function(){
		var _self = this;
		//编辑
		$('.grid-wrap').on('click', '.ui-icon-pencil', function(e){
			e.preventDefault();
			var rowId = $(this).parent().data('id');
			parent.tab.addTabItem({tabid: 'sales-sales', text: '销售单', url: '/sales.html?id=' + rowId + '&flag=list'});
			var ids = $("#grid").jqGrid('getDataIDs');
			parent.cacheList.salesId = $("#grid").jqGrid('getDataIDs');
		});
		//删除
		$('.grid-wrap').on('click', '.ui-icon-trash', function(e){
			e.preventDefault();
			if (!Business.verifyRight('SA_DELETE')) {
				return ;
			};
			var rowId = $(this).parent().data('id');
			$.dialog.confirm('您确定要删除该销货记录吗？', function(){
				Public.ajaxGet('/sales.html?action=delete', {id: rowId}, function(data){
					if(data.status === 200) {
						$("#grid").jqGrid('delRowData', rowId);
						parent.Public.tips({content : '删除成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				});
			});
		});
		//打印
		$('.wrapper').on('click', '#print', function(e){
			e.preventDefault();
			if (!Business.verifyRight('PU_PRINT')) {
				return ;
			};
			Public.print({
				title:'购货单列表',
				$grid:$('#grid'),
				pdf: '/sales.html?action=toPdf',
				billType: 10201,
				filterConditions:queryConditions
			});
			
		});
		if(billRequiredCheck){
			var btn_audit = $("#audit").css('display','inline-block'),
			btn_reAudit = $("#reAudit").css('display','inline-block');
			//审核
			$('.wrapper').on('click', '#audit', function(e){
				e.preventDefault();
				var arr_ids = $('#grid').jqGrid('getGridParam','selarrrow')
				var voucherIds = arr_ids.join();
				if (!voucherIds) {
					parent.Public.tips({type:2,content:"请先选择需要审核的项！"});
					return;
				}
				Public.ajaxPost('/sales.html?action=batchCheckInvSa',{"id":voucherIds}, function(data){
					if(data.status === 200) {
						for(var i = 0, len = arr_ids.length;i<len ;i++){
							$('#grid').setCell(arr_ids[i],'checkName',system.realName);
						}
						parent.Public.tips({content : '审核成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				});
			});
			//反审核
			$('.wrapper').on('click', '#reAudit', function(e){
				e.preventDefault();
				var arr_ids = $('#grid').jqGrid('getGridParam','selarrrow')
				var voucherIds = arr_ids.join();
				if (!voucherIds) {
					parent.Public.tips({type:2,content:"请先选择需要反审核的项！"});
					return;
				}
				Public.ajaxPost('/sales.html?action=rsBatchCheckInvSa', {"id":voucherIds}, function(data){
					if(data.status === 200) {
						for(var i = 0, len = arr_ids.length;i<len ;i++){
							$('#grid').setCell(arr_ids[i],'checkName',"&#160;");
						}
						parent.Public.tips({content : '反审核成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				});
			});
		}
		$('#search').click(function(){
			queryConditions.matchCon = _self.$_matchCon.val() === '请输入单据号或客户名或备注' ? '' : $.trim(_self.$_matchCon.val());
			queryConditions.beginDate = _self.$_beginDate.val();
			queryConditions.endDate = _self.$_endDate.val();
			THISPAGE.reloadData(queryConditions);
		});
		
		$('#refresh').click(function(){
			THISPAGE.reloadData(queryConditions);
		});
		
		$('#add').click(function(e){
			e.preventDefault();
			if (!Business.verifyRight('SA_ADD')) {
				return ;
			};
			parent.tab.addTabItem({tabid: 'sales-sales', text: '销售单', url: '/sales.html?action=initSale'});		
		});
		
		/*$('#audit').click(function(e){
			e.preventDefault();
			var rowId = $("#grid").jqGrid('getGridParam','selarrrow');
			if(rowId.length > 0) {
				Public.ajaxPost('/sales.html?action=checkInvSa&flag=1', {id: rowId.join()}, function(data){
					if(data.status === 200) {
						parent.Public.tips({content : '审核成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				})
			}
		});
		
		$('#reAudit').click(function(e){
			e.preventDefault();
			var rowId = $("#grid").jqGrid('getGridParam','selarrrow');
			if(rowId.length > 0) {
				Public.ajaxPost('/sales.html?action=checkInvSa&flag=0', {id: rowId.join()}, function(data){
					if(data.status === 200) {
						parent.Public.tips({content : '反审核成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				})
			}
		});*/
		
		$(window).resize(function(){
			Public.resizeGrid();
		});
	}
};
 
THISPAGE.init();