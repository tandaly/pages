var filterConditions = {};
var profitChk, $_curTr;

initFilter();
//initField();
initEvent();
(function(){
	if(!Public.isIE6) return;
	var $search = $('#report-search'),
		$win = $(window);
	$search.width($win.width());
	$win.resize(function(){
		$search.width($win.width());
	});
})();

function initFilter(){
	Business.filterCustomer();
	Business.filterGoods();
	Business.filterStorage();	
	$('#filter-fromDate, #filter-toDate').datepicker();

	var params = Public.urlParam();
	filterConditions = {
		beginDate: params.beginDate || defParams.beginDate,
		endDate: params.endDate || defParams.endDate,
		customerNo: params.customerNo || '',
		goodsNo: params.goodsNo || '',
		storageNo: params.storageNo || '',
		orderBy: params.orderBy || 'salesQty',
		profit: params.profit || '1'
	};
	
	$('#filter-fromDate').val(filterConditions.beginDate || '');
	$('#filter-toDate').val(filterConditions.endDate || '');
	$('#filter-customer input').val(filterConditions.customerNo || '');
	$('#filter-goods input').val(filterConditions.goodsNo || '');
	$('#filter-storage input').val(filterConditions.storageNo || '');
	
	if(filterConditions.orderBy === 'salesQty') {
		$('#salesQty').attr('checked', true);
	} else {
		$('#salesIncome').attr('checked', true);
	}
	
	if(filterConditions.profit === '1'){
		$('#profit-wrap input').attr('checked', true);
	};
	
	if(filterConditions.beginDate && filterConditions.endDate){
		$('#selected-period').text(filterConditions.beginDate + '至' + filterConditions.endDate);
	};
	
	Public.dateCheck();
	
	$(document).on('click', '#ui-datepicker-div,.ui-datepicker-header', function(e){
		e.stopPropagation();
	});
	
	profitChk = $('#profit-wrap').cssCheckbox();

	Business.moreFilterEvent();
	$('#conditions-trigger').trigger('click');
	
	//查询
	$('#filter-submit').on('click', function(e){
		e.preventDefault();
		var fromDate = $('#filter-fromDate').val(),
			toDate = $('#filter-toDate').val();
		if(fromDate && toDate && new Date(fromDate).getTime() > new Date(toDate).getTime()){
			parent.Public.tips({type:1, content : '开始日期不能大于结束日期'});
			return;
		};

		filterConditions = {
			beginDate: fromDate,
			endDate: toDate,
			customerNo: $('#filter-customer input').val() || '',
			goodsNo: $('#filter-goods input').val() || '',
			storageNo: $('#filter-storage input').val() || '',
			orderBy: $("input[name='sort-rule']:checked").val(),
			profit: profitChk.chkVal().length > 0 ? '1' : '0'
		};
		reloadReport();
	});
	//重置
	$('#filter-reset').on('click', function(e){
		e.preventDefault();
		$('#filter-fromDate').val('');
		$('#filter-toDate').val('');
		$('#filter-customer input').val('');
		$('#filter-goods input').val('');
		$('#filter-storage input').val('');
		profitChk.chkNot();
	});
}


function initField(){
	var customer = filterConditions.customer ? filterConditions.customer.split(',') : '',
		goods = filterConditions.goods ? filterConditions.goods.split(',') : '',
		txt = '';
	if(customer && goods){
		txt = '「您已选择了<b>' + customer.length + '</b>个客户，<b>' + goods.length + '</b>个商品进行查询」';
	}else if(customer){
		txt = '「您已选择了<b>' + customer.length + '</b>个客户进行查询」';
	}else if(goods){
		txt = '「您已选择了<b>' + goods.length + '</b>个商品进行查询」';
	}
	$('#cur-search-tip').html(txt);
}

function initEvent(){
	//刷新
	$('#refresh').on('click', function(e){
		e.preventDefault()
		reloadReport();
	});
	//打印
	$('#btn-print').click(function(e){
		e.preventDefault();
		if (!Business.verifyRight('SAREPORTDETAIL_PRINT')) {
			return ;
		};
		window.print();
	});
	//导出
	$('#btn-export').click(function(e){
		e.preventDefault();
		if (!Business.verifyRight('SAREPORTDETAIL_EXPORT')) {
			return ;
		};
		var args = {};
		for(var key in filterConditions){
			if(filterConditions[key]){
				args[key] = filterConditions[key];
			}
		}
		Business.getFile('/report/salesDetail.do?action=detailExporter', args);
	});
	
	$('.grid-wrap').on('click', '.link', function(e){
		e.preventDefault();
		if (!Business.verifyRight('SA_QUERY')) {
			return ;
		};
		var id = $(this).data('id'), type = $(this).data('type');
		parent.tab.addTabItem({tabid: 'sales-sales', text: '销售单', url: '/sales/sales.jsp?id=' + id});
		$(this).addClass('tr-hover');
		$_curTr = $(this);
	});
	
	Business.gridEvent();
}

function reloadReport(){
	var params = '';
	for(key in filterConditions){
		if(filterConditions[key]){
			params +='&' + key + '=' + encodeURIComponent(filterConditions[key]);
		}
	}
	window.location = '/report/salesDetail.do?action=detail' + params;
}
$(function(){
	Public.initCustomGrid($('table.list'));
})
