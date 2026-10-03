var data = JSON.parse(localStorage.getItem('khorcher_khata') || '{"transactions":[]}');
var histFilter = 'all';
var selectedCat = '';
var catChartInst = null;

function save(){ localStorage.setItem('khorcher_khata', JSON.stringify(data)); }
function taka(n){ return '\u09f3' + Math.abs(Number(n)).toLocaleString('bn-BD'); }
function todayISO(){ return new Date().toISOString().split('T')[0]; }
function fmtDate(iso){ return new Date(iso+'T00:00:00').toLocaleDateString('bn-BD',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtTime(ts){ return new Date(ts).toLocaleTimeString('bn-BD',{hour:'2-digit',minute:'2-digit'}); }
function thisMonth(){ return new Date().toISOString().slice(0,7); }
function thisWeekStart(){ var d=new Date(); d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0); return d; }

var CAT_EMOJI = {'\u0996\u09be\u09ac\u09be\u09b0':'\ud83c\udf5b','\u09af\u09be\u09a4\u09be\u09af\u09bc\u09be\u09a4':'\ud83d\ude8c','\u09ac\u09bf\u09b2':'\ud83d\udca1','\u09b6\u09aa\u09bf\u0982':'\ud83d\udecd\ufe0f','\u09ac\u09bf\u09a8\u09cb\u09a6\u09a8':'\ud83c\udfae','\u09b8\u09cd\u09ac\u09be\u09b8\u09cd\u09a5\u09cd\u09af':'\ud83d\udc8a','\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af':'\ud83d\udce6'};
var CAT_COLORS = {'\u0996\u09be\u09ac\u09be\u09b0':'#f97316','\u09af\u09be\u09a4\u09be\u09af\u09bc\u09be\u09a4':'#06b6d4','\u09ac\u09bf\u09b2':'#8b5cf6','\u09b6\u09aa\u09bf\u0982':'#ec4899','\u09ac\u09bf\u09a8\u09cb\u09a6\u09a8':'#f59e0b','\u09b8\u09cd\u09ac\u09be\u09b8\u09cd\u09a5\u09cd\u09af':'#22c55e','\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af':'#64748b'};
var SRC_EMOJI = {'\u09ac\u09c7\u09a4\u09a8':'\ud83d\udcbc','\u09ab\u09cd\u09b0\u09bf\u09b2\u09cd\u09af\u09be\u09a8\u09cd\u09b8':'\ud83d\udcbb','\u09ac\u09cd\u09af\u09ac\u09b8\u09be':'\ud83c\udfea','\u09aa\u0995\u09c7\u099f\u09ae\u09be\u09a8\u09bf':'\ud83d\udc5b','\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af':'\ud83d\udce6'};
var CAT_ICONS = {'\u0996\u09be\u09ac\u09be\u09b0':'utensils','\u09af\u09be\u09a4\u09be\u09af\u09bc\u09be\u09a4':'bus','\u09ac\u09bf\u09b2':'lightbulb','\u09b6\u09aa\u09bf\u0982':'shopping-bag','\u09ac\u09bf\u09a8\u09cb\u09a6\u09a8':'gamepad-2','\u09b8\u09cd\u09ac\u09be\u09b8\u09cd\u09a5\u09cd\u09af':'heart-pulse','\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af':'package'};
var SRC_ICONS = {'\u09ac\u09c7\u09a4\u09a8':'briefcase-business','\u09ab\u09cd\u09b0\u09bf\u09b2\u09cd\u09af\u09be\u09a8\u09cd\u09b8':'laptop','\u09ac\u09cd\u09af\u09ac\u09b8\u09be':'store','\u09aa\u0995\u09c7\u099f\u09ae\u09be\u09a8\u09bf':'wallet','\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af':'package'};

function iconHTML(name){ return '<i class="ui-icon" data-lucide="'+name+'" aria-hidden="true"></i>'; }
function renderIcons(){ if(window.lucide) window.lucide.createIcons(); }

function showTab(id,btn){
  document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
  document.getElementById('section-'+id).classList.add('active');
  if(btn) btn.classList.add('active');
  renderAll();
}
function pickCat(el){
  document.querySelectorAll('.cat-chip').forEach(function(c){c.classList.remove('active');});
  el.classList.add('active');
  selectedCat = el.dataset.cat;
}
function addExpense(){
  var desc=document.getElementById('expDesc').value.trim();
  var amt=parseFloat(document.getElementById('expAmt').value);
  var date=document.getElementById('expDate').value||todayISO();
  if(!desc){alert('\u09ac\u09bf\u09ac\u09b0\u09a3 \u09b2\u09bf\u0996\u09c1\u09a8');return;}
  if(!amt||isNaN(amt)||amt<=0){alert('\u09b8\u09a0\u09bf\u0995 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 \u09a6\u09bf\u09a8');return;}
  if(!selectedCat){alert('\u0995\u09cd\u09af\u09be\u099f\u09be\u0997\u09b0\u09bf \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8');return;}
  data.transactions.push({id:Date.now(),type:'expense',desc:desc,amount:amt,cat:selectedCat,date:date,ts:Date.now()});
  save();
  document.getElementById('expDesc').value='';
  document.getElementById('expAmt').value='';
  document.querySelectorAll('.cat-chip').forEach(function(c){c.classList.remove('active');});
  selectedCat='';
  renderAll();
  showSuccess('\u0996\u09b0\u099a \u09af\u09cb\u0997 \u09b9\u09af\u09bc\u09c7\u099b\u09c7 \u2705');
}
function addIncome(){
  var source=document.getElementById('incSource').value;
  var amt=parseFloat(document.getElementById('incAmt').value);
  var desc=document.getElementById('incDesc').value.trim();
  var date=document.getElementById('incDate').value||todayISO();
  if(!amt||isNaN(amt)||amt<=0){alert('\u09b8\u09a0\u09bf\u0995 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 \u09a6\u09bf\u09a8');return;}
  data.transactions.push({id:Date.now(),type:'income',desc:desc||source,amount:amt,source:source,date:date,ts:Date.now()});
  save();
  document.getElementById('incAmt').value='';
  document.getElementById('incDesc').value='';
  renderAll();
  showSuccess('\u0986\u09af\u09bc \u09af\u09cb\u0997 \u09b9\u09af\u09bc\u09c7\u099b\u09c7 \u2705');
}
function deleteTx(id){
  data.transactions=data.transactions.filter(function(t){return t.id!==id;});
  save(); renderAll();
}
function clearAll(){
  if(!confirm('\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09ac\u09c7\u09a8?')) return;
  data.transactions=[];
  save(); renderAll();
}
function showSuccess(msg){
  var t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:24px;right:24px;background:#22c55e;color:#fff;padding:10px 18px;border-radius:10px;font-size:.8rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.3);transition:opacity .4s';
  t.textContent=msg;document.body.appendChild(t);
  setTimeout(function(){t.style.opacity='0';setTimeout(function(){t.remove();},400);},1800);
}
function filterHistory(f,btn){
  histFilter=f;
  document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active');});
  if(btn) btn.classList.add('active');
  renderHistory();
}

function getMonthTx(month){ month=month||thisMonth(); return data.transactions.filter(function(t){return t.date.startsWith(month);}); }
function getMonthIncome(month){ return getMonthTx(month).filter(function(t){return t.type==='income';}).reduce(function(s,t){return s+t.amount;},0); }
function getMonthExpense(month){ return getMonthTx(month).filter(function(t){return t.type==='expense';}).reduce(function(s,t){return s+t.amount;},0); }
function getTodayTx(){ var tod=todayISO(); return data.transactions.filter(function(t){return t.type==='expense'&&t.date===tod;}); }
function getWeekExpense(){ var ws=thisWeekStart(); return data.transactions.filter(function(t){return t.type==='expense'&&new Date(t.date+'T00:00:00')>=ws;}).reduce(function(s,t){return s+t.amount;},0); }
function getTotalBalance(){ var inc=data.transactions.filter(function(t){return t.type==='income';}).reduce(function(s,t){return s+t.amount;},0); var exp=data.transactions.filter(function(t){return t.type==='expense';}).reduce(function(s,t){return s+t.amount;},0); return inc-exp; }

function renderAll(){ renderDashboard(); renderExpenseTab(); renderIncomeTab(); renderHistory(); renderReport(); renderIcons(); }

function renderDashboard(){
  var bal=getTotalBalance();
  var mInc=getMonthIncome(); var mExp=getMonthExpense();
  var todTx=getTodayTx(); var todTotal=todTx.reduce(function(s,t){return s+t.amount;},0);
  var weekExp=getWeekExpense();
  var topBal=document.getElementById('topBalance');
  topBal.textContent=taka(bal); topBal.style.color=bal>=0?'var(--green)':'var(--red)';
  var hb=document.getElementById('heroBalance');
  hb.textContent=(bal<0?'-':'')+taka(bal);
  hb.className='hero-amount '+(bal>0?'positive':bal<0?'negative':'neutral');
  document.getElementById('heroInc').textContent=taka(mInc);
  document.getElementById('heroExp').textContent=taka(mExp);
  document.getElementById('heroSub').textContent=new Date().toLocaleDateString('bn-BD',{month:'long',year:'numeric'})+' \u09ae\u09be\u09b8';
  document.getElementById('todayExp').textContent=taka(todTotal);
  document.getElementById('todayExpCount').textContent=todTx.length+'\u099f\u09bf';
  document.getElementById('weekExp').textContent=taka(weekExp);
  document.getElementById('monthExp').textContent=taka(mExp);
  var day=new Date().getDate();
  document.getElementById('avgDaily').textContent=taka(day>0?Math.round(mExp/day):0);
  renderCatChart();
  var tbody=document.getElementById('recentBody');
  var empty=document.getElementById('recentEmpty');
  var recent=[].concat(data.transactions).sort(function(a,b){return b.ts-a.ts;}).slice(0,6);
  tbody.innerHTML='';
  if(!recent.length){empty.style.display='block';}
  else{
    empty.style.display='none';
    recent.forEach(function(t){
      var isExp=t.type==='expense';
      tbody.innerHTML+='<tr><td style="color:var(--muted)">'+fmtDate(t.date)+'</td><td style="font-weight:500">'+t.desc+'</td><td>'+(isExp?('<span class="cbadge '+t.cat+'">'+iconHTML(CAT_ICONS[t.cat]||'package')+' '+t.cat+'</span>'):'<span class="ibadge">'+iconHTML(SRC_ICONS[t.source]||'package')+' '+(t.source||'\u0986\u09af\u09bc')+'</span>')+'</td><td style="font-weight:700;color:'+(isExp?'var(--red)':'var(--green)')+'">'+(isExp?'-':'+')+taka(t.amount)+'</td></tr>';
    });
  }
}

function renderCatChart(){
  var mTx=getMonthTx().filter(function(t){return t.type==='expense';});
  var catMap={};
  mTx.forEach(function(t){catMap[t.cat]=(catMap[t.cat]||0)+t.amount;});
  var cats=Object.keys(catMap);
  var canvas=document.getElementById('catChart');
  var empty=document.getElementById('catChartEmpty');
  var bars=document.getElementById('catBars');
  if(!cats.length){empty.style.display='flex';canvas.style.display='none';bars.innerHTML='';if(catChartInst){catChartInst.destroy();catChartInst=null;}return;}
  empty.style.display='none';canvas.style.display='block';
  if(catChartInst) catChartInst.destroy();
  catChartInst=new Chart(canvas,{type:'doughnut',data:{labels:cats,datasets:[{data:cats.map(function(c){return catMap[c];}),backgroundColor:cats.map(function(c){return CAT_COLORS[c]||'#64748b';}),borderColor:'#161d2e',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',font:{family:"'Hind Siliguri',sans-serif",size:12},padding:12,usePointStyle:true}},tooltip:{callbacks:{label:function(ctx){var tot=cats.map(function(c){return catMap[c];}).reduce(function(a,b){return a+b;},0);var pct=((ctx.parsed/tot)*100).toFixed(1);return ctx.label+': \u09f3'+ctx.parsed.toLocaleString()+' ('+pct+'%)';}},backgroundColor:'rgba(0,0,0,.85)',titleFont:{family:"'Hind Siliguri',sans-serif"},bodyFont:{family:"'Hind Siliguri',sans-serif"}}}}});
  var total=cats.map(function(c){return catMap[c];}).reduce(function(a,b){return a+b;},0);
  bars.innerHTML=cats.sort(function(a,b){return catMap[b]-catMap[a];}).map(function(c){return '<div class="prog-row"><div class="prog-label"><span>'+iconHTML(CAT_ICONS[c]||'package')+' '+c+'</span><span>'+taka(catMap[c])+' ('+((catMap[c]/total)*100).toFixed(0)+'%)</span></div><div class="prog-bg"><div class="prog-fill" style="width:'+((catMap[c]/total)*100)+'%;background:'+(CAT_COLORS[c]||'#64748b')+'"></div></div></div>';}).join('');
}

function renderExpenseTab(){
  var tod=todayISO();
  var todTx=data.transactions.filter(function(t){return t.type==='expense'&&t.date===tod;}).sort(function(a,b){return b.ts-a.ts;});
  var todTotal=todTx.reduce(function(s,t){return s+t.amount;},0);
  document.getElementById('todayTotal').textContent=taka(todTotal);
  var tbody=document.getElementById('todayBody');
  var empty=document.getElementById('todayEmpty');
  tbody.innerHTML='';
  if(!todTx.length){empty.style.display='block';}
  else{
    empty.style.display='none';
    todTx.forEach(function(t){
      tbody.innerHTML+='<tr><td style="color:var(--muted);font-size:.72rem">'+fmtTime(t.ts)+'</td><td style="font-weight:500">'+t.desc+'</td><td><span class="cbadge '+t.cat+'">'+iconHTML(CAT_ICONS[t.cat]||'package')+' '+t.cat+'</span></td><td style="color:var(--red);font-weight:700">'+taka(t.amount)+'</td><td><button class="btn btn-danger btn-sm" aria-label="\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09ae\u09c1\u099b\u09c1\u09a8" title="\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09ae\u09c1\u099b\u09c1\u09a8" onclick="deleteTx('+t.id+')">'+iconHTML('trash-2')+'</button></td></tr>';
    });
  }
}

function renderIncomeTab(){
  var mTx=getMonthTx().filter(function(t){return t.type==='income';});
  var srcMap={};
  mTx.forEach(function(t){srcMap[t.source]=(srcMap[t.source]||0)+t.amount;});
  var srcs=Object.keys(srcMap);
  var grid=document.getElementById('sourceGrid');
  var empty=document.getElementById('sourceEmpty');
  grid.innerHTML='';
  if(!srcs.length){empty.style.display='block';grid.style.display='none';}
  else{
    empty.style.display='none';grid.style.display='grid';
    srcs.forEach(function(s){grid.innerHTML+='<div class="inc-source-card"><div class="inc-source-name">'+iconHTML(SRC_ICONS[s]||'package')+' '+s+'</div><div class="inc-source-amt">'+taka(srcMap[s])+'</div><div class="inc-source-month">\u098f\u0987 \u09ae\u09be\u09b8</div></div>';});
  }
  var allInc=[].concat(data.transactions).filter(function(t){return t.type==='income';}).sort(function(a,b){return b.ts-a.ts;});
  var tbody=document.getElementById('incBody');
  var incEmpty=document.getElementById('incEmpty');
  tbody.innerHTML='';
  if(!allInc.length){incEmpty.style.display='block';}
  else{
    incEmpty.style.display='none';
    allInc.forEach(function(t){tbody.innerHTML+='<tr><td style="color:var(--muted)">'+fmtDate(t.date)+'</td><td><span class="ibadge">'+iconHTML(SRC_ICONS[t.source]||'package')+' '+t.source+'</span></td><td style="color:var(--muted2)">'+(t.desc||'\u2014')+'</td><td style="color:var(--green);font-weight:700">+'+taka(t.amount)+'</td><td><button class="btn btn-danger btn-sm" aria-label="\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09ae\u09c1\u099b\u09c1\u09a8" title="\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09ae\u09c1\u099b\u09c1\u09a8" onclick="deleteTx('+t.id+')">'+iconHTML('trash-2')+'</button></td></tr>';});
  }
}

function renderHistory(){
  var txs=[].concat(data.transactions).sort(function(a,b){return b.ts-a.ts;});
  var tod=todayISO(); var ws=thisWeekStart();
  if(histFilter==='expense') txs=txs.filter(function(t){return t.type==='expense';});
  else if(histFilter==='income') txs=txs.filter(function(t){return t.type==='income';});
  else if(histFilter==='today') txs=txs.filter(function(t){return t.date===tod;});
  else if(histFilter==='week') txs=txs.filter(function(t){return new Date(t.date+'T00:00:00')>=ws;});
  else if(histFilter==='month') txs=txs.filter(function(t){return t.date.startsWith(thisMonth());});
  var tbody=document.getElementById('histBody');
  var empty=document.getElementById('histEmpty');
  tbody.innerHTML='';
  if(!txs.length){empty.style.display='block';}
  else{
    empty.style.display='none';
    txs.forEach(function(t){
      var isExp=t.type==='expense';
      tbody.innerHTML+='<tr><td style="color:var(--muted)">'+fmtDate(t.date)+'</td><td style="font-weight:500">'+t.desc+'</td><td>'+(isExp?('<span class="cbadge '+t.cat+'">'+iconHTML(CAT_ICONS[t.cat]||'package')+' '+t.cat+'</span>'):'<span class="ibadge">'+iconHTML(SRC_ICONS[t.source]||'package')+' '+(t.source||'\u0986\u09af\u09bc')+'</span>')+'</td><td style="font-weight:700;color:'+(isExp?'var(--red)':'var(--green)')+'">'+(isExp?'-':'+')+taka(t.amount)+'</td><td><button class="btn btn-danger btn-sm" aria-label="\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09ae\u09c1\u099b\u09c1\u09a8" title="\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09ae\u09c1\u099b\u09c1\u09a8" onclick="deleteTx('+t.id+')">'+iconHTML('trash-2')+'</button></td></tr>';
    });
  }
}

function renderReport(){
  var mInc=getMonthIncome(); var mExp=getMonthExpense(); var mSave=mInc-mExp;
  var rate=mInc>0?Math.round((mSave/mInc)*100):0;
  document.getElementById('rpInc').textContent=taka(mInc);
  document.getElementById('rpExp').textContent=taka(mExp);
  var rpSave=document.getElementById('rpSave');
  rpSave.textContent=(mSave<0?'-':'')+taka(mSave);
  rpSave.style.color=mSave>=0?'var(--green)':'var(--red)';
  document.getElementById('rpRate').textContent=rate+'%';
  document.getElementById('reportMonthLabel').textContent=new Date().toLocaleDateString('bn-BD',{month:'long',year:'numeric'});
  var mTx=getMonthTx().filter(function(t){return t.type==='expense';});
  var catMap={};mTx.forEach(function(t){catMap[t.cat]=(catMap[t.cat]||0)+t.amount;});
  var cats=Object.keys(catMap).sort(function(a,b){return catMap[b]-catMap[a];});
  document.getElementById('rpCatList').innerHTML=cats.length?cats.map(function(c){return '<div class="prog-row"><div class="prog-label"><span>'+iconHTML(CAT_ICONS[c]||'package')+' '+c+'</span><span style="color:var(--muted)">'+taka(catMap[c])+'</span></div><div class="prog-bg"><div class="prog-fill" style="width:'+(mExp>0?(catMap[c]/mExp*100):0)+'%;background:'+(CAT_COLORS[c]||'#64748b')+'"></div></div></div>';}).join(''):'<div class="empty"><div class="ei">'+iconHTML('chart-pie')+'</div><p>\u098f\u0987 \u09ae\u09be\u09b8\u09c7 \u0995\u09cb\u09a8\u09cb \u0996\u09b0\u099a \u09a8\u09c7\u0987</p></div>';
  var incTx=getMonthTx().filter(function(t){return t.type==='income';});
  var srcMap={};incTx.forEach(function(t){srcMap[t.source]=(srcMap[t.source]||0)+t.amount;});
  var srcs=Object.keys(srcMap).sort(function(a,b){return srcMap[b]-srcMap[a];});
  document.getElementById('rpSourceList').innerHTML=srcs.length?srcs.map(function(s){return '<div class="prog-row"><div class="prog-label"><span>'+iconHTML(SRC_ICONS[s]||'package')+' '+s+'</span><span style="color:var(--muted)">'+taka(srcMap[s])+'</span></div><div class="prog-bg"><div class="prog-fill" style="width:'+(mInc>0?(srcMap[s]/mInc*100):0)+'%;background:var(--green)"></div></div></div>';}).join(''):'<div class="empty"><div class="ei">'+iconHTML('wallet')+'</div><p>\u098f\u0987 \u09ae\u09be\u09b8\u09c7 \u0995\u09cb\u09a8\u09cb \u0986\u09af\u09bc \u09a8\u09c7\u0987</p></div>';
}

function downloadPDF(){
  var btn=document.getElementById('pdfBtn');
  btn.disabled=true;btn.textContent='\u29d7 \u09a4\u09c8\u09b0\u09bf \u09b9\u099a\u09cd\u099b\u09c7...';
  var month=new Date().toLocaleDateString('bn-BD',{month:'long',year:'numeric'});
  var now=new Date().toLocaleDateString('bn-BD',{day:'numeric',month:'long',year:'numeric'});
  var mInc=getMonthIncome();var mExp=getMonthExpense();var mSave=mInc-mExp;
  var rate=mInc>0?Math.round((mSave/mInc)*100):0;
  var mTx=getMonthTx();
  var expTx=mTx.filter(function(t){return t.type==='expense';}).sort(function(a,b){return b.date.localeCompare(a.date);});
  var incTx=mTx.filter(function(t){return t.type==='income';}).sort(function(a,b){return b.date.localeCompare(a.date);});
  var catMap={};expTx.forEach(function(t){catMap[t.cat]=(catMap[t.cat]||0)+t.amount;});
  var srcMap={};incTx.forEach(function(t){srcMap[t.source]=(srcMap[t.source]||0)+t.amount;});
  var catRows=expTx.map(function(t,i){return '<tr style="background:'+(i%2===0?'#fff':'#f9fafb')+'"><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:11px">'+fmtDate(t.date)+'</td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;font-weight:500">'+t.desc+'</td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px"><span style="background:'+(CAT_COLORS[t.cat]||'#64748b')+'22;color:'+(CAT_COLORS[t.cat]||'#64748b')+';padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600">'+t.cat+'</span></td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;font-weight:700;color:#ef4444">\u09f3'+t.amount.toLocaleString()+'</td></tr>';}).join('');
  var incRows=incTx.map(function(t,i){return '<tr style="background:'+(i%2===0?'#fff':'#f9fafb')+'"><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:11px">'+fmtDate(t.date)+'</td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px">'+(SRC_EMOJI[t.source]||'')+' '+t.source+'</td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:11px">'+(t.desc||'\u2014')+'</td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;font-weight:700;color:#22c55e">\u09f3'+t.amount.toLocaleString()+'</td></tr>';}).join('');
  var catSum=Object.keys(catMap).map(function(c){return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:11px"><span>'+(CAT_EMOJI[c]||'')+' '+c+'</span><span style="font-weight:700;color:'+(CAT_COLORS[c]||'#64748b')+'">\u09f3'+catMap[c].toLocaleString()+'</span></div>';}).join('');
  var srcSum=Object.keys(srcMap).map(function(s){return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:11px"><span>'+(SRC_EMOJI[s]||'')+' '+s+'</span><span style="font-weight:700;color:#22c55e">\u09f3'+srcMap[s].toLocaleString()+'</span></div>';}).join('');
  var tpl=document.getElementById('pdfTpl');
  tpl.style.display='block';
  tpl.innerHTML='<div style="width:794px;background:#fff;font-family:\'Hind Siliguri\',sans-serif;color:#111"><div style="background:linear-gradient(135deg,#080c14,#1e3a5f);padding:30px 44px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:20px;font-weight:700;color:#fff">\ud83d\udcb0 \u0996\u09b0\u099a\u09c7\u09b0 \u0996\u09be\u09a4\u09be</div><div style="color:rgba(255,255,255,.65);font-size:12px;margin-top:4px">\u09ae\u09be\u09b8\u09bf\u0995 \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09aa\u09cd\u09b0\u09a4\u09bf\u09ac\u09c7\u09a6\u09a8</div></div><div style="text-align:right"><div style="background:rgba(255,255,255,.15);color:#fff;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600">'+month+'</div><div style="color:rgba(255,255,255,.5);font-size:10px;margin-top:5px">\u09a4\u09c8\u09b0\u09bf: '+now+'</div></div></div><div style="padding:28px 44px"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px"><div style="border-radius:10px;padding:14px;text-align:center;background:#f0fdf4;border:2px solid #22c55e"><div style="font-size:9px;color:#6b7280;margin-bottom:4px;text-transform:uppercase">\u09ae\u09cb\u099f \u0986\u09af\u09bc</div><div style="font-size:17px;font-weight:700;color:#22c55e">\u09f3'+mInc.toLocaleString()+'</div></div><div style="border-radius:10px;padding:14px;text-align:center;background:#fef2f2;border:2px solid #ef4444"><div style="font-size:9px;color:#6b7280;margin-bottom:4px;text-transform:uppercase">\u09ae\u09cb\u099f \u0996\u09b0\u099a</div><div style="font-size:17px;font-weight:700;color:#ef4444">\u09f3'+mExp.toLocaleString()+'</div></div><div style="border-radius:10px;padding:14px;text-align:center;background:#eff6ff;border:2px solid #3b82f6"><div style="font-size:9px;color:#6b7280;margin-bottom:4px;text-transform:uppercase">\u09b8\u099e\u09cd\u099a\u09af\u09bc</div><div style="font-size:17px;font-weight:700;color:'+(mSave>=0?'#22c55e':'#ef4444')+'">\u09f3'+Math.abs(mSave).toLocaleString()+'</div></div><div style="border-radius:10px;padding:14px;text-align:center;background:#fffbeb;border:2px solid #f59e0b"><div style="font-size:9px;color:#6b7280;margin-bottom:4px;text-transform:uppercase">\u09b8\u099e\u09cd\u099a\u09af\u09bc\u09c7\u09b0 \u09b9\u09be\u09b0</div><div style="font-size:17px;font-weight:700;color:#f59e0b">'+rate+'%</div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px"><div><div style="font-size:12px;font-weight:700;border-left:3px solid #ef4444;padding-left:8px;margin-bottom:8px">\ud83d\udcca \u0995\u09cd\u09af\u09be\u099f\u09be\u0997\u09b0\u09bf \u09ad\u09be\u0999\u09a8</div>'+(catSum||'<div style="color:#9ca3af;font-size:11px">\u0995\u09cb\u09a8\u09cb \u0996\u09b0\u099a \u09a8\u09c7\u0987</div>')+'</div><div><div style="font-size:12px;font-weight:700;border-left:3px solid #22c55e;padding-left:8px;margin-bottom:8px">\ud83d\udcda \u0986\u09af\u09bc\u09c7\u09b0 \u0989\u09ce\u09b8</div>'+(srcSum||'<div style="color:#9ca3af;font-size:11px">\u0995\u09cb\u09a8\u09cb \u0986\u09af\u09bc \u09a8\u09c7\u0987</div>')+'</div></div><div style="font-size:12px;font-weight:700;border-left:3px solid #ef4444;padding-left:8px;margin-bottom:10px">\ud83d\udcb8 \u0996\u09b0\u099a\u09c7\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be</div><table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px"><thead><tr style="background:#fef2f2"><th style="padding:8px 10px;text-align:left;color:#ef4444;border-bottom:2px solid #ef4444;font-size:10px">\u09a4\u09be\u09b0\u09bf\u0996</th><th style="padding:8px 10px;text-align:left;color:#ef4444;border-bottom:2px solid #ef4444;font-size:10px">\u09ac\u09bf\u09ac\u09b0\u09a3</th><th style="padding:8px 10px;text-align:left;color:#ef4444;border-bottom:2px solid #ef4444;font-size:10px">\u0995\u09cd\u09af\u09be\u099f\u09be\u0997\u09b0\u09bf</th><th style="padding:8px 10px;text-align:left;color:#ef4444;border-bottom:2px solid #ef4444;font-size:10px">\u09aa\u09b0\u09bf\u09ae\u09be\u09a3</th></tr></thead><tbody>'+(catRows||'<tr><td colspan="4" style="text-align:center;padding:14px;color:#9ca3af">\u0995\u09cb\u09a8\u09cb \u0996\u09b0\u099a \u09a8\u09c7\u0987</td></tr>')+'</tbody></table><div style="font-size:12px;font-weight:700;border-left:3px solid #22c55e;padding-left:8px;margin-bottom:10px">\ud83d\udcda \u0986\u09af\u09bc\u09c7\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be</div><table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:22px"><thead><tr style="background:#f0fdf4"><th style="padding:8px 10px;text-align:left;color:#22c55e;border-bottom:2px solid #22c55e;font-size:10px">\u09a4\u09be\u09b0\u09bf\u0996</th><th style="padding:8px 10px;text-align:left;color:#22c55e;border-bottom:2px solid #22c55e;font-size:10px">\u09b8\u09cb\u09b0\u09cd\u09b8</th><th style="padding:8px 10px;text-align:left;color:#22c55e;border-bottom:2px solid #22c55e;font-size:10px">\u09ac\u09bf\u09ac\u09b0\u09a3</th><th style="padding:8px 10px;text-align:left;color:#22c55e;border-bottom:2px solid #22c55e;font-size:10px">\u09aa\u09b0\u09bf\u09ae\u09be\u09a3</th></tr></thead><tbody>'+(incRows||'<tr><td colspan="4" style="text-align:center;padding:14px;color:#9ca3af">\u0995\u09cb\u09a8\u09cb \u0986\u09af\u09bc \u09a8\u09c7\u0987</td></tr>')+'</tbody></table><div style="padding-top:12px;border-top:2px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin-bottom:28px"><span>\ud83d\udcb0 \u0996\u09b0\u099a\u09c7\u09b0 \u0996\u09be\u09a4\u09be \u2014 \u09b8\u09cd\u09ac\u09af\u09bc\u0982\u0995\u09cd\u09b0\u09bf\u09af\u09bc\u09ad\u09be\u09ac\u09c7 \u09a4\u09c8\u09b0\u09bf</span><span>'+now+'</span></div></div></div>';
  html2canvas(tpl.firstElementChild,{scale:2,useCORS:true,backgroundColor:'#ffffff'}).then(function(canvas){
    var jsPDF=window.jspdf.jsPDF;
    var pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    var iw=210,ih=(canvas.height*210)/canvas.width;
    var y=0;
    while(y<ih){if(y>0)pdf.addPage();pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,-y,iw,ih);y+=297;}
    pdf.save('\u0996\u09b0\u099a\u09c7\u09b0-\u0996\u09be\u09a4\u09be-'+month+'.pdf');
    tpl.style.display='none';btn.disabled=false;btn.textContent='\ud83d\udce5 PDF \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8';
  }).catch(function(e){alert('PDF \u09a4\u09c8\u09b0\u09bf\u09a4\u09c7 \u09b8\u09ae\u09b8\u09cd\u09af\u09be: '+e.message);tpl.style.display='none';btn.disabled=false;btn.textContent='\ud83d\udce5 PDF \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8';});
}

function toggleNotif(){
  document.getElementById('notifPanel').classList.toggle('open');
  document.getElementById('notifDot').style.display='none';
}
document.addEventListener('click',function(e){if(!e.target.closest('.notif-btn')&&!e.target.closest('.notif-panel'))document.getElementById('notifPanel').classList.remove('open');});

function requestNotifPermission(){
  if(!('Notification' in window)){alert('\u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0 \u09a8\u09cb\u099f\u09bf\u09ab\u09bf\u0995\u09c7\u09b6\u09a8 \u09b8\u09be\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09c7 \u09a8\u09be');return;}
  Notification.requestPermission().then(function(p){
    if(p==='granted'){showSuccess('\u09a8\u09cb\u099f\u09bf\u09ab\u09bf\u0995\u09c7\u09b6\u09a8 \u099a\u09be\u09b2\u09c1 \u2705');}
    else{alert('\u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0 \u09b8\u09c7\u099f\u09bf\u0982\u09b8 \u09a5\u09c7\u0995\u09c7 \u0985\u09a8\u09c1\u09ae\u09a4\u09bf \u09a6\u09bf\u09a8');}
  });
}

function showReminderToast(){ document.getElementById('reminderToast').classList.add('show'); document.getElementById('notifDot').style.display='block'; }
function dismissToast(){ document.getElementById('reminderToast').classList.remove('show'); }
function goAddExpense(){ dismissToast(); showTab('expense',document.querySelectorAll('.tab')[1]); }

function checkReminder(){
  var h=new Date().getHours();
  var tod=todayISO();
  var lastShown=localStorage.getItem('lastReminderDate');
  if(h>=21&&lastShown!==tod){
    var todayHasEntry=data.transactions.some(function(t){return t.date===tod&&t.type==='expense';});
    if(!todayHasEntry){
      setTimeout(function(){showReminderToast();localStorage.setItem('lastReminderDate',tod);},3000);
    }
  }
  setInterval(function(){
    var ch=new Date().getHours(),cm=new Date().getMinutes();
    var ctod=todayISO();
    var cls=localStorage.getItem('lastReminderDate');
    if(ch===21&&cm===0&&cls!==ctod){
      localStorage.setItem('lastReminderDate',ctod);
      showReminderToast();
      if(typeof Notification!=='undefined'&&Notification.permission==='granted'){
        new Notification('\ud83d\udcb0 \u0996\u09b0\u099a\u09c7\u09b0 \u0996\u09be\u09a4\u09be',{body:'\u0986\u099c\u0995\u09c7\u09b0 \u0996\u09b0\u099a \u0987\u09a8\u09aa\u09c1\u099f \u09a6\u09bf\u09af\u09bc\u09c7\u099b\u09c7\u09a8? \u098f\u0996\u09a8\u0987 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8!'});
      }
    }
  },60000);
}

(function init(){
  var t=todayISO();
  document.getElementById('expDate').value=t;
  document.getElementById('incDate').value=t;
  document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('bn-BD',{weekday:'long',day:'numeric',month:'long'});
  renderAll();
  checkReminder();
  window.addEventListener('beforeunload',save);
})();