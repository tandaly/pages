var queryConditions = {
	matchCon: ''
}, SYSTEM = parent.SYSTEM, VERSION = parent.SYSTEM.siType;
var THISPAGE = {
	init: function(data){
		this.initDom();
		this.loadGrid();			
		this.addEvent();
	},
	initDom: function(){
		this.$_matchCon = $('#matchCon');
		this.$_beginDate = $('#beginDate').val(SYSTEM.beginDate);	
		this.$_endDate = $('#endDate').val(SYSTEM.endDate);
		this.$_matchCon.placeholder();
		this.$_beginDate.datepicker();	
		this.$_endDate.datepicker();
	},
	loadGrid: function(){
		var height = $(window).height() - $(".grid-wrap").offset().top - 65, _self = this;
		var colModels = [
		 				{name:'operating', label:'操作', width:60, fixed:true, formatter:operFmatter, align:"center"},
						{name:'billDate', label:'单据日期', index:'billDate', width:100, align:"center"},
						{name:'billNo', label:'单据编号', index:'billNo', width:120, align:"center"},
						{name:'contactName', label:'销货单位', index:'contactName', width:200},
						{name:'amount', label:'收款金额', index:'amount', width:100, align:"right", formatter:'currency'}
					]; 
		switch(VERSION){
			case 1:break;
			case 2:
				colModels = colModels.concat([
												{name:'bDeAmount' , label:'本次核销金额', index:'hxAmount', width:100, align:"right", formatter:'currency'},	
												{name:'adjustRate' , label:'整单折扣', index:'adjustRate', width:100, align:"right", formatter:'currency'},	
												{name:'deAmount' , label:'本次预收款', index:'deAmount', width:100, align:"right", formatter:'currency'}
							                  ])
				break;
			default:break;
		}
		colModels.push({name:'description', label:'备注', index:'description', width:200, classes: 'ui-ellipsis'});	
		queryConditions.beginDate = this.$_beginDate.val();
		queryConditions.endDate = this.$_endDate.val();
		_self.markRow = [];	//退货情况
		$("#grid").jqGrid({
			url:'/basedata/shoukuanjilu.json',
			postData: queryConditions,
			datatype: "json",
			//caption: "科目余额表",
			autowidth: true,//如果为ture时，则当表格在首次被创建时会根据父元素比例重新调整表格宽度。如果父元素宽度改变，为了使表格宽度能够自动调整则需要实现函数：setGridWidth
			//width: width,
			height: height,
			altRows: true, //设置隔行显示
			rownumbers: true,//如果为ture则会在表格左边新增一列，显示行顺序号，从1开始递增。此列名为'rn'
			gridview: true,
			colModel:colModels,
			cmTemplate: {sortable: false, title: false},
			//idPrefix: 'ys',
			//loadui: 'block',
			//multiselect: true,
			//multiboxonly: true,
			page: 1, 
			sortname: 'number',    
			sortorder: "desc", 
			pager: "#page",  
			rowNum: 2000,  
			//rowTotal: 2000,
			rowList:[300,500,1000],     
			scroll: 1, //创建一个动态滚动的表格，当为true时，翻页栏被禁用，使用垂直滚动条加载数据，且在首次访问服务器端时将加载所有数据到客户端。当此参数为数字时，表格只控制可见的几行，所有数据都在这几行中加载
			//scrollOffset: 120, //设置垂直滚动条宽度
			loadonce: true,
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
			var html_con = '<div class="operating" data-id="' + row.id + '"><span class="ui-icon ui-icon-pencil" title="修改"></span><span class="ui-icon ui-icon-trash" title="删除"></span></div>';
			return html_con;
		};

	},
	reloadData: function(data){
		this.markRow = [];
		$("#grid").jqGrid('setGridParam',{url:'/basedata/shoukuanjilu.json', datatype: "json", postData: data}).trigger("reloadGrid");
	},
	addEvent: function(){
		var _self = this;
		//编辑
		$('.grid-wrap').on('click', '.ui-icon-pencil', function(e){
			e.preventDefault();
			var rowId = $(this).parent().data('id');
			parent.tab.addTabItem({tabid: 'money-receipt', text: '收款单', url: '/receipt.html?id=' + rowId});
			var ids = $("#grid").jqGrid('getDataIDs');
			parent.salesListIds = $("#grid").jqGrid('getDataIDs');
		});
		//删除
		$('.grid-wrap').on('click', '.ui-icon-trash', function(e){
			e.preventDefault();
			if (!Business.verifyRight('RECEIPT_DELETE')) {
				return ;
			};
			var rowId = $(this).parent().data('id');
			$.dialog.confirm('您确定要删除该收款记录吗？', function(){
				Public.ajaxGet('/scm/receipt.do?action=delete', {id: rowId}, function(data){
					if(data.status === 200) {
						$("#grid").jqGrid('delRowData', rowId);
						parent.Public.tips({content : '删除成功！'});
					} else {
						parent.Public.tips({type: 1, content : data.msg});
					}
				});
			});
		});
		
		$('#search').click(function(){
			queryConditions.matchCon = _self.$_matchCon.val() === '请输入单据号或客户或备注' ? '' : _self.$_matchCon.val();
			queryConditions.beginDate = _self.$_beginDate.val();
			queryConditions.endDate = _self.$_endDate.val();
			THISPAGE.reloadData(queryConditions);
		});
		
		$('#refresh').click(function(){
			THISPAGE.reloadData(queryConditions);
		});
		
		$('#add').click(function(e){
			e.preventDefault();
			if (!Business.verifyRight('RECEIPT_ADD')) {
				return ;
			};
			parent.tab.addTabItem({tabid: 'money-receipt', text: '收款单', url: '/scm/receipt.do?action=initReceipt'});
		});
		
		$(window).resize(function(){
			Public.resizeGrid();
		});
	}
};
 
THISPAGE.init();