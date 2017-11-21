$(function(){
	
	
	var ue = UE.getEditor('editor');
		$('#pub-btn').click(function() {
			$('#a-content').val(ue.getContent());
			if($('#a-title').val() && $('#a-type').val() && $('#a-content').val()) {
				$('pub-form').submit()
			} else {
				alert('亲，存在未填！');
				return false;
			}
		});
		$('#delete').click(function(){
			if(!confirm('您确定要删除该篇文章吗？')){
				 return false;
			};
			
		});
		
	$('#message-form').dialog({
		autoOpen: false,
		height: 300,
		width: 500,
		resizable: false,
		modal: true,
		closeText: '关闭',
		hide: 'scale'

	});

	$('#message').click(function() {
		$('#message-form').dialog('open');
	});

	$('#friendapply-form').dialog({
		autoOpen: false,
		height: 300,
		width: 440,
		resizable: false,
		modal: true,
		closeText: '关闭',
		hide: 'scale'

	});

	$('#friend').click(function() {
		$('#friendapply-form').dialog('open');
	});
})
