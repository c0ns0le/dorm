$(function () {
	var show,menu={};

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
		var bs = get('bs'),
		user = get('user')||{},
		action = get('action')||[];
		if (bs[bid][0] === 0) {
			uid = inout.uid;
			bs[bid] = [uid,inout.date];
			user[uid]=[inout.name,inout.sex,inout.dept,inout.job];
			action.push([
				bid,uid,inout.action,inout.date
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
		return function(){
			return true;
		}
	}
	var bsFilter=function(){
		//房间，房间状态，开始时间，结束时间
		var s=getFormData($('#searchForm'));
		var room=s.room,status=s.status,from=s.from,to=s.to;
		if(from)from=new Date(from);
		if(to)to=new Date(to);
		return function(o){
			var bid,info,uid,flag=true;
			o=o.split(':');
			bid=o[0];
			info=o[1].split(',');
			uid=info[0];
			date=info[1]||0;
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
	var fDate=function(d){
		var y=d.getFullYear();
		var m=d.getMonth()+1;
		var day=d.getDate();
		if(m<10)m='0'+m;
		if(day<10)day='0'+day;
		return y+'-'+m+'-'+day;
	}
	var getPage=function(page){
		return {
			page:page||$('#page').html()||1,
			size:$('#size').val()
		}
	}
	var pageHandler=function(p){
		$('#page').html(p.page);
		$('#len').html(p.record);
		$('#last').html(p.totalpage);
		if(p.page==p.totalpage){
			$('#next').hide();
		}else{
			$('#next').show();
		}
		if(p.page==1){
			$('#prev').hide();
		}else{
			$('#prev').show();
		}
	
	}
	var showAction=menu.actionlog=window.sa=function(page){
		var p,a,totalpage,html;
		p=getPage(page);
		page=p.page;
		size=p.size;
		a=get('action');
		a=a.filter(actionFilter());
		p.record=a.length;
		p.totalpage=1+(p.record+1)/size|0;
		pageHandler(p);
		a=a.slice((page-1)*size,page*size);
		a.sort(function(v1,v2){
			var d1=v1[3];
			var d2=v2[3];
			return new Date(d1)<new Date(d2); 
		});
		renderAction(a);
	}
	var renderAction=function(a){
		var user,sex,name,roomId,html='<table><thead><th>床位</th><th>姓名</th><th>性别</th><th>部门</th><th>职位</th><th>搬入还是搬出</th><th>日期</th><th>操作</th></thead><tbody>';
		a.forEach(function(v){
			roomId=v[0];
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
			var act=''
			var dept=user[2]||'';
			var job=user[3]||'';
			var date=v[3]||'';
			html+='<tr class="data" id="'+roomId+'"><td>'+roomId+'</td><td>'+name+'</td><td>'+sex+'</td><td>'+dept+'</td><td>'+job+'</td><td>'+action+'</td><td>'+date+'</td><td>'+act+'</td></tr>';
		});
		html+='</tbody></table>';
		$('#actionlog').html(html);
	}
	//显示床位
	var showBed=menu.index=window.show=function(page){
		var p,size,totalpage,bs=get('bs',true);
		p=getPage(page);
		page=p.page;
		size=p.size;
		bs=bs.replace(/\],/g,'\]_');
		bs=bs.replace(/[\[\]{}"]/g,'').split('_');
		bs=bs.filter(bsFilter());
		p.record=bs.length;
		p.totalpage=1+(p.record+1)/size|0;
		pageHandler(p);
		bs=bs.slice((page-1)*size,page*size);
		renderBed(bs);
	}
	var renderBed=function(bs){
		var roomId,info,user,uid,name,
		html='<table><thead><th>床位</th><th>姓名</th><th>性别</th><th>部门</th><th>职位</th><th>搬入日期</th><th>操作</th></thead><tbody>';
		bs.forEach(function(v){
			v=v.split(':');
			roomId=v[0];
			info=v[1].split(',');
			uid=info[0];
			user=get('user')[uid]||{};
			name=user[0]||'空';
			var act='';
			if(uid>0){
				act= '<a class="out" href="#">搬出</a>';
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
			html+='<tr class="data" id="'+roomId+'"><td>'+roomId+'</td><td>'+name+'</td><td>'+sex+'</td><td>'+dept+'</td><td>'+job+'</td><td>'+date+'</td><td>'+act+'</td></tr>';
		});
		html+='</tbody></table>';
		$('#list').html(html);
	}
	$('#prev').click(function(){
		var p=$('#page');
		p.html(+p.html()-1);
		show();
		return false;
	});
	$('#next').click(function(){
		var p=$('#page');
		p.html(+p.html()+1);
		show();
		return false;
	});
	$('#first').click(function(){
		show(1);
		return false;
	});
	$('#last').click(function(){
		var p=$('#page');
		p.html(+this.innerHTML);
		show();
		return false;
	});
	$('#search').click(function(){
		show(1);
	});
	$('#list').on('click','.out',function(){
		var $this=$(this);
		var bid=$this.parent().parent()[0].id;
		var bs=get('bs');
		var action=get('action')||[];
		var uid=bs[bid][0];
		var date=fDate(new Date);
		action.push([bid,uid,2,date]);
		bs[bid]=[0];
		save('bs',bs);
		save('action',action);
		show();
		return false;
	});
	$('#menu').on('click','a',function(){
		$('.content').hide();
		$('#'+this.id+'_content').show();
		show={bed:showBed,action:showAction}[this.id];
		show();
		return false;
	});
	//录入事件
	$('#in').click(function () {
		var inout=getFormData($('#inform'));
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
	generateSelect($('#size'), [10,15,20,25,30,35]);
	var from=$('.from').datepicker({ defaultDate:-7,maxDate:0,onClose:function(){
		to.datepicker('option','minDate',this.value);
	}});
	var to=$('.to').datepicker({ maxDate:0,onClose:function(){
		from.datepicker('option','maxDate',this.value);
	}});
	$('#date').datepicker({maxDate:0})
	show=showBed;
	show();
});
