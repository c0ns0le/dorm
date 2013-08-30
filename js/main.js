$(function () {
	var show,table,
	actionForm=$('#actionForm'),
	searchForm=$('#searchForm'),
	$page=$('#page'),
	$size=$('#size'),
	$last=$('#last'),
	$next=$('#next'),
	$prev=$('#prev'),
	$len=$('#len'),
	$actionlog=$('#actionlog'),
	$list=$('#list'),
	$first=$('#first'),
	$inform=$('#inform');

	var save = function (name, json) {
		localStorage.setItem(name, JSON.stringify(json));
	}
	var get = function (name,string) {
		var v = localStorage.getItem(name);
		return string?v:(v ? JSON.parse(v) : v);
	}
	var getFormData=function(form){
		var o={},arr=form.serializeArray();
		arr.forEach(function(v){
			v.value && (o[v.name]=v.value);
		});
		return o;
	}
	var inlog = function (inout) {
		var uid,bid = inout.bid;
		var uniqueId,bs = get('bs'),
		user = get('user')||{},
		action = get('action')||[];
		if (bs[bid][0] === 0) {
			uid = inout.uid;
			bs[bid] = [uid,inout.date];
			user[uid]=[inout.name,inout.sex,inout.dept,inout.job];
			action.push([
				bid,uid,inout.action,inout.date,uid
			]);
			save('uid', inout.uid);
			save('user', user);
			save('bs', bs);
			save('action', action);
			show();
		} else {
			alert('该床有人，请先搬出');
		}
	}
	var actionFilter=function(){
		var af=getFormData(actionForm);
		var room=af.room,name=af.name,from=af.from,to=af.to,sex=af.sex,action=af.action,dept=af.dept;
		if(from)from=new Date(from);
		if(to)to=new Date(to);
		return function(o){
			var date,user,bid,info,uid,flag=true;
			bid=o[0];
			uid=o[1];
			o_action=o[2];
			date=o[3];
			if(name){
				user=get('user')[uid];
				flag=user[0].indexOf(name)>-1;
				if(!flag)return false;
			}
			if(dept){
				user=user||get('user')[uid];
				flag=user && dept==user[2];
				if(!flag)return false;
			}
			if(sex>0){
				user=user||get('user')[uid];
				flag=user[1]==sex;
				if(!flag)return false;
			}
			if(action>0){
				flag=action==o_action;
				if(!flag)return false;
			}
			if(room>0){
				flag=(bid/10|0)==room;
				if(!flag)return false;
			}
			if(from){
				flag=from<=new Date(date);
				if(!flag)return false;
			}
			if(to){
				flag=to>=new Date(date);
				if(!flag)return false;
			}
			return true;
		}
	}
	var bsFilter=function(){
		//房间，房间状态，开始时间，结束时间
		var s=getFormData(searchForm);
		var room=s.room,status=s.status,from=s.from,to=s.to,sex=s.sex,name=s.name,dept=s.dept;
		if(from)from=new Date(from);
		if(to)to=new Date(to);
		return function(o){
			var user,date,bid,info,uid,flag=true;
			o=o.split(':');
			bid=o[0];
			info=o[1].split(',');
			uid=info[0];
			date=info[1]||0;
			if(name){
				user=get('user')[uid];
				flag=user && user[0].indexOf(name)>-1;
				if(!flag)return false;
			}
			if(sex>0){
				user=user||get('user')[uid];
				flag=user && user[1]==sex;
				if(!flag)return false;
			}
			if(dept){
				user=user||get('user')[uid];
				flag=user && dept==user[2];
				if(!flag)return false;
			}
			if(room>0){
				flag=(bid/10|0)==room;
				if(!flag)return false;
			}
			if(status==1){
				flag=uid==0;
				if(!flag)return false;
			}else if(status==2){
				flag=uid>0;
				if(!flag)return false;
			}
			if(from){
				flag=from<=new Date(date);
				if(!flag)return false;
			}
			if(to){
				flag=to>=new Date(date);
				if(!flag)return false;
			}
			return flag;
		};
	}
	var getPage=function(page){
		page=page||$page.html()||1;
		if(page<1)page=1;
		return {
			page:page,
			size:$size.val()
		}
	}
	var pageHandler=function(p){
		$page.html(p.page);
		$len.html(p.record);
		$last.html(p.totalpage);
		if(p.page>=p.totalpage){
			$next.hide();
		}else{
			$next.show();
		}
		if(p.page<=1){
			$prev.hide();
		}else{
			$prev.show();
		}
	
	}
	var showAction=function(page){
		var p,a,totalpage,html;
		p=getPage(page);
		page=p.page;
		size=p.size;
		a=get('action');
		a=a.filter(actionFilter());
		p.record=a.length;
		p.totalpage=1+(p.record-1)/size|0;
		pageHandler(p);
		table=a;
		a=a.slice((page-1)*size,page*size);
		a.sort(function(v1,v2){
			var d1=v1[3];
			var d2=v2[3];
			return new Date(d1)<new Date(d2); 
		});
		html=renderAction(a);
		$actionlog.html(html);
	}
	var renderAction=function(a,isExport){
		var bid,bNo,user,sex,name,roomId,html;
		html='<table><thead><th>房间</th><th>床位</th><th>姓名</th><th>性别</th><th>部门</th>'
		+'<th>职位</th><th>搬入搬出</th><th>日期</th>'+(isExport?'':'<th>操作</th>')+'</thead><tbody>';

		a.forEach(function(v){
			roomId=v[0];
			bid=roomId.slice(0,3);
			bNo=roomId.slice(3);
			uid=v[1];
			action=v[2];
			user=get('user')[uid]||{};
			sex=user[1]||'';
			name=user[0]||'空';
			if(sex==1){
				sex='男'
			}else if(sex==2){
				sex='女';
			}
			action={1:'搬入',2:'搬出'}[action]||'';
			var act='<a class="dellog" href="#">删除记录</a>'
			var dept=user[2]||'';
			var job=user[3]||'';
			var date=v[3]||'';
			html+='<tr class="data" id="'+v[4]+'"><td>'+bid+'</td><td>'+bNo+'</td><td>'+name+'</td><td>'+sex+'</td><td>'+dept+'</td><td>'+job+'</td>'
			+'<td>'+action+'</td><td>'+date+'</td>'+(isExport?'':('<td>'+act+'</td>'))+'</tr>';
		});
		html+='</tbody></table>';
		return html;
	}
	//显示床位
	var showBed=function(page){
		var html,p,size,totalpage,bs=get('bs',true);
		p=getPage(page);
		page=p.page;
		size=p.size;
		bs=bs.replace(/\],/g,'\]_');
		bs=bs.replace(/[\[\]{}"]/g,'').split('_');
		bs=bs.filter(bsFilter());
		p.record=bs.length;
		p.totalpage=1+(p.record-1)/size|0;
		pageHandler(p);
		table=bs;
		bs=bs.slice((page-1)*size,page*size);
		html=renderBed(bs);
		$list.html(html);
	}
	var renderBed=function(bs,isExport){
		var roomId,info,user,uid,act,name,bid,bNo,html;
		html='<table><thead><th>房间</th><th>床位</th><th>姓名</th><th>性别</th><th>部门</th><th>职位</th><th>搬入日期</th>'+(!isExport?'<th>操作</th>':'')+'</thead><tbody>';
		bs.forEach(function(v){
			v=v.split(':');
			roomId=v[0];
			bid=roomId.slice(0,3);
			bNo=roomId.slice(3);
			info=v[1].split(',');
			uid=info[0];
			user=get('user')[uid]||{};
			name=user[0];
			if(name){
				name=isExport?name: '<a href="#" class="name" id="'+uid+'" title="点击编辑人员信息">'+name+'</a>';
			}else{
				name=isExport?'':'空';
			}
			if(uid>0){
				act=isExport?'搬出':'<a class="out" href="#" title="点击会弹出日期选择框选择搬出日期">搬出</a><input style="display:none" placeholder="请选择搬出日期" type="text" />';
			}else{
				act=isExport?'':'<a class="del" href="#">删除床位</a>';
			}
			var sex=user[1]||'';
			if(sex==1){
				sex='男'
			}else if(sex==2){
				sex='女';
			}
			var dept=user[2]||'';
			var job=user[3]||'';
			var date=info[1]||'';
			html+='<tr class="data" id="'+roomId+'"><td>'+bid+'</td><td>'+bNo+'</td><td>'+name+'</td><td>'+sex+'</td><td>'+dept+'</td><td>'+job+'</td><td>'+date+'</td>'+(!isExport?'<td>'+act+'</td>':'')+'</tr>';
		});
		html+='</tbody></table>';
		return html;
	}
	$prev.click(function(){
		var $p=$page,p=$p.html();
		p=p-1;
		p=p>0?p:1;
		show(p);
		return false;
	});
	$next.click(function(){
		var p=$page.html();
		show(+p+1);
		return false;
	});
	$first.click(function(){
		show(1);
		return false;
	});
	$last.click(function(){
		show(+this.innerHTML);
		return false;
	});
	$('.search').click(function(){
		show(1);
	});
	$size.change(function(){
		show(1);
	});
	$actionlog.on('click','.dellog',function(){
		var id,thisId,action=get('action');
		thisId=$(this).parent().parent().attr('id');
		for(var i=action.length;i--;){
			id=action[i][4];
			if(id==thisId){
			if(confirm('确定删除此记录？')){
				action.splice(i,1);
				save('action',action);
				show();
			}
				break;
			}
		};
		return false;
	});
	var mask=$('#mask').click(function(){
		mask.hide();
		editUser.hide();
	});
	var editUser=$('#editUser').on('click','.update',function(){
		var form=editUser.find('form');
		var user=getFormData(form);
		var users=get('user');
		users[user.uid]=[user.name,user.sex,user.dept,user.job,user.remark];
		save('user',users);
		mask.click();
		show();
	}).on('keydown',function(e){
		var k=e.keyCode;
		if(k===13){//按回车
			editUser.find('.update').click();
		}else if(k===27){//按Esc
			mask.click();
		}
	});
	editUser.tmpl=$.trim(editUser.html());
	$list.on('click','.out',function(){
		var $this=$(this);
		var indate=$this.parent().prev().html();
		var d=$this.next().datepicker({
		minDate:indate,
		onClose:function(){
			d.hide();
		},
		onSelect:function(){
			var date=$.datepicker.formatDate('yy-mm-dd',d.datepicker("getDate"));
			if(confirm('确定'+date+'搬出？')){
				var bid=$this.parent().parent()[0].id;
				var bs=get('bs');
				var action=get('action')||[];
				var uid=bs[bid][0];
				var uniqueId=get('uid');
				action.push([bid,uid,2,date,++uniqueId]);
				bs[bid]=[0];
				save('bs',bs);
				save('action',action);
				save('uid',uniqueId);
				show();
			}
		}
		}).show().datepicker("show");
		return false;
	}).on('click','tr',function(){
		var id=this.id;
		var r=id.slice(0,3);
		var b=id.slice(3);
		$inform.find('.name').val('').focus();
		$inform.find('.room').val(r);
		$inform.find('.bed').val(b);
		return false;
	}).on('click','.del',function(){
		var $this=$(this);
		var id=$this.parent().parent().attr('id');
		var bs=get('bs');
		if(confirm('确定删除床位'+id+'?')){
			delete bs[id];
			save('bs',bs);
			show();
		}
		return false;
	}).on('click','.name',function(){
		var html,uid=this.id;
		var users=get('user');
		var user=users[uid];
		if(user){
			var name=user[0],
			sex=user[1],
			dept=user[2]||'',
			job=user[3]||'',
			remark=user[4]||'';
			html=editUser.tmpl;
			html=html.replace(/\{name\}/,name);
			html=html.replace(/\{uid\}/,uid);
			html=html.replace(/\{male\}/,{1:'checked',2:''}[sex]);
			html=html.replace(/\{female\}/,{2:'checked',1:''}[sex]);
			html=html.replace(/\{dept\}/,dept);
			html=html.replace(/\{job\}/,job);
			html=html.replace(/\{remark\}/,remark);
			mask.show();
			editUser.html(html).show().find('.name').focus();
		}
		return false;
	});
	$('#menu').on('click','a',function(){
		$('.content').hide();
		$('#'+this.id+'_content').show();
		show={bed:showBed,action:showAction}[this.id];
		render={bed:renderBed,action:renderAction}[this.id];
		show(1);
		return false;
	});
	//录入事件
	$('#in').click(function () {
		var inout=getFormData($inform);
		if(!inout.name||!inout.date){
			alert('姓名，日期不能为空',inout);
		}else{
			inout.bid=inout.roomId+inout.bid;
			delete inout.roomId;
			inout = $.extend(inout,{
				uid : get('uid') + 1,
				action : 1
			});
			inlog(inout);
		}
		return false;
	});
	//导出excel
	var exports=function(table){
		table='<html><head></head><body><table>'+table+'</table></body></html>';
		table=window.btoa(unescape(encodeURIComponent(table)));
		window.location.href = 'data:application/vnd.ms-excel;base64,' + table;
	}
	$('#export').click(function(){
		var html=render(table,true);
		exports(html);
	});
	var init = function () {
		var i, j, bid, bs, bedstatus = {};
		if (!get('bs')) {
			for (i = 601; i < 615; i++) {
				for (j = 1; j < 6; j++) {
					bid = '' + i + j;
					bedstatus[bid] = [0];
				}
			}
			for (i = 701; i < 716; i++) {
				for (j = 1; j < 6; j++) {
					bid = '' + i + j;
					bedstatus[bid] = [0];
				}
			}
			//bid,uid
			save('bs', bedstatus);
			//uid,name,sex,department,job
			save('user', {});
			save('action', []);
			save('uid', 0);
		}
	}
	init();
	var room = [];
	for (var i = 601; i < 615; i++) {
		room.push(i);
	}
	for (i = 701; i < 716; i++) {
		room.push(i);
	}
	var generateSelect = function (obj, arr) {
		var str = '';
		arr.forEach(function (r) {
			str += '<option value="' + r + '">' + r + '</option>'
		});
		obj.append(str);
	}
	generateSelect($('.room'), room);
	generateSelect($('.bed'), [1,2,3,4,5]);
	generateSelect($size, [15,20,25,30,35,40,50]);
	$.datepicker.setDefaults({maxDate:0});
	var from=$('.from').datepicker({ defaultDate:-7,onSelect:function(){
		to.datepicker('option','minDate',this.value);
	}});
	var to=$('.to').datepicker({onSelect:function(){
		from.datepicker('option','maxDate',this.value);
	}});
	$('#date').datepicker()
	$('#bed').click();
});
