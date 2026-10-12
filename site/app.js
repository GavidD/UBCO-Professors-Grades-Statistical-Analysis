const $=s=>document.querySelector(s);
const DATA={},META={},SUBS={};
const LAB={UBCO:"UBC Okanagan",UBCV:"UBC Vancouver"};
const f1=v=>(v<0?"\u2212":"")+Math.abs(v).toFixed(1),sg=v=>(v>0?"+":v<0?"\u2212":"")+Math.abs(v).toFixed(1);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SC=12,X=v=>50+Math.max(-SC,Math.min(SC,v))/SC*50;
const S={campus:"UBCO",mode:"simple",q:"",subj:"",dir:"all",clr:false,k:"students",desc:true,open:new Set(),page:1,push:false};
const COLS=[
{k:"name",l:"Professor",left:1},{k:"subs",l:"Main subjects",left:1,adv:1},{k:"sec",l:"Sections",adv:1,tip:"Graded sections taught"},
{k:"terms",l:"Terms",adv:1,tip:"Distinct terms with a section"},{k:"students",l:"Students",adv:1,tip:"Students in the compared courses"},
{k:"pavg",l:["Their avg","Prof avg"],cls:"c-avg",tip:"Professor's weighted average"},{k:"oavg",l:["Colleagues' avg","Others avg"],cls:"c-avg",tip:"Everyone else's average, same courses and weights"},
{k:"diff",l:["Grades vs colleagues","Diff"],tip:"Percentage points above or below colleagues"},{k:"ch",l:"Gap vs others",ns:1,cls:"c-ch"},
{k:"ci",l:"95% CI",adv:1,ns:1,tip:"Bootstrap interval for the difference"},{k:"median",l:"Median course diff",adv:1,tip:"Median of per-course differences"},
{k:"pct",l:"% courses above",adv:1,tip:"Share of courses where they average higher"},{k:"clear",l:"Clear gap",tip:"Interval excludes zero"}];
const vis=()=>COLS.filter(c=>S.mode==="adv"||!c.adv);
const lab=c=>Array.isArray(c.l)?c.l[S.mode==="adv"?1:0]:c.l;
function chart(r,own){const d=own?r.d:r.diff,lo=own?d:r.lo,hi=own?d:r.hi,cl=own||r.clear,x=X(d),col=d>=0?"var(--up)":"var(--down)",L=Math.min(50,x),W=Math.abs(x-50);
 const bar=cl?`background:${col}`:`border:1px solid var(--flat);background:transparent`;
 return `<div class="ch" role="img" aria-label="${sg(d)} percentage points${own?"":", 95% CI "+f1(r.lo)+" to "+f1(r.hi)+", "+(cl?"clear gap":"not a clear gap")}"><i class="z"></i><i class="b" style="left:${L}%;width:${Math.max(W,.6)}%;${bar}"></i>${own?"":`<i class="w" style="left:${X(lo)}%;width:${X(hi)-X(lo)}%"></i><i class="c" style="left:${X(lo)}%"></i><i class="c" style="left:${X(hi)}%"></i>`}</div>`}
function rows(){const t=S.q.toLowerCase();let a=DATA[S.campus].filter(r=>(!t||(r.name+" "+r.subs+" "+r.courses.map(c=>c.c).join(" ")).toLowerCase().includes(t))&&(!S.subj||r.subs.includes(S.subj))&&(S.dir==="all"||(S.dir==="above"?r.diff>0:r.diff<0))&&(!S.clr||r.clear));
 const v=r=>S.k==="abs"?Math.abs(r.diff):S.k==="clear"?+r.clear:r[S.k];
 return a.sort((x,y)=>{const p=v(x),q=v(y),c=typeof p==="string"?p.localeCompare(q):p-q;return S.desc?-c:c})}
function cell(c,r){switch(c.k){
 case"name":return`<td class="l nm">${esc(r.name)}</td>`;case"subs":return`<td class="l">${esc(r.subs)}</td>`;
 case"pavg":case"oavg":return`<td class="${c.cls}">${r[c.k].toFixed(1)}</td>`;
 case"diff":return`<td class="${r.clear?(r.diff>0?"up":"down"):"muted"}"><b>${sg(r.diff)}</b></td>`;
 case"ch":return`<td class="c-ch">${chart(r)}</td>`;case"ci":return`<td class="muted">${f1(r.lo)} to ${f1(r.hi)}</td>`;
 case"median":return`<td>${sg(r.median)}</td>`;case"pct":return`<td>${r.pct}%</td>`;
 case"clear":return`<td class="${r.clear?(r.diff>0?"up":"down"):"muted"}">${r.clear?(r.diff>0?"Clear \u00b7 above":"Clear \u00b7 below"):"Not clear"}</td>`;
 default:return`<td>${r[c.k]}</td>`}}
function detail(r,n){return`<tr class="det"><td colspan="${n}"><p class="b2">Based on ${r.sec} sections across ${r.terms} terms, ${r.students.toLocaleString()} students.</p><table><thead><tr><th class="l">Course</th><th>Their avg</th><th>Colleagues' avg</th><th>Difference</th><th>Gap</th></tr></thead><tbody>${r.courses.map(c=>`<tr><td class="l">${c.c}</td><td>${c.p.toFixed(1)}</td><td>${c.o.toFixed(1)}</td><td>${sg(c.d)}</td><td>${chart(c,1)}</td></tr>`).join("")}</tbody></table></td></tr>`}
function render(){if(!DATA[S.campus])return;const sig=[S.campus,S.q,S.subj,S.dir,S.clr,S.k,S.desc].join("|");if(S.sig!==undefined&&sig!==S.sig)S.page=1;S.sig=sig;
 const cs=vis(),all=rows(),d=DATA[S.campus],pages=Math.max(1,Math.ceil(all.length/50));S.page=Math.min(S.page,pages);const a=all.slice((S.page-1)*50,S.page*50);
 $("#tbl").className=S.mode==="adv"?"adv":"simple";
 $("#th").innerHTML="<tr>"+cs.map(c=>{const on=S.k===c.k,ax=c.k==="ch"?'<span class="axl">\u2190 below | above \u2192 (points)</span>':"";
  return`<th scope="col" class="${c.left?"l ":""}${c.cls||""}" ${on?`aria-sort="${S.desc?"descending":"ascending"}"`:""} ${c.tip?`title="${c.tip}"`:""}>${c.ns?lab(c)+ax:`<button data-k="${c.k}">${lab(c)}${on?(S.desc?" \u25BE":" \u25B4"):""}</button>`}</th>`}).join("")+"</tr>";
 $("#tb").innerHTML=a.map(r=>{const o=S.open.has(r.name);return`<tr class="r" tabindex="0" data-n="${esc(r.name)}" aria-expanded="${o}">${cs.map(c=>cell(c,r)).join("")}</tr>${o?detail(r,cs.length):""}`}).join("")||`<tr><td colspan="${cs.length}" class="empty l">No professors match these filters. Try clearing the search or lowering the filters.</td></tr>`;
 $("#count").textContent=`${all.length} of ${d.length} professors \u00b7 ${all.filter(r=>r.diff>0).length} above \u00b7 ${all.filter(r=>r.diff<0).length} below \u00b7 ${all.filter(r=>r.clear).length} clear gaps`;
 $("#status").textContent=`${LAB[S.campus]} \u00b7 ${d.length} professors \u00b7 terms covered: ${META[S.campus].terms} \u00b7 built ${META[S.campus].built}`;
 document.querySelectorAll(".seg").forEach(g=>g.querySelectorAll("button").forEach(b=>{const key=g.id==="campus"?"campus":g.id==="mode"?"mode":"dir";b.setAttribute("aria-pressed",S[key]===b.dataset.v)}));
 const sv=S.k+":"+S.desc,so=$("#sort");so.value=[...so.options].some(o=>o.value===sv)?sv:"x";pager(pages);writeURL(S.push);S.push=false}
function subjects(){$("#subj").innerHTML='<option value="">All subjects</option>'+SUBS[S.campus].map(s=>`<option>${s}</option>`).join("")}
$("#sort").innerHTML='<option value="students:true">Most students</option><option value="name:false">Name A to Z</option><option value="diff:true">Above colleagues first</option><option value="diff:false">Below colleagues first</option><option value="abs:true">Largest gap</option><option value="x" disabled>Custom</option>';
function theme(t){document.documentElement.dataset.theme=t;$("#theme").textContent=t==="dark"?"Light theme":"Dark theme";try{localStorage.setItem("gg-theme",t)}catch(e){}}
try{const t=localStorage.getItem("gg-theme");if(t)theme(t)}catch(e){}
$("#theme").onclick=()=>theme(document.documentElement.dataset.theme==="dark"?"light":"dark");
$("#campus").onclick=e=>{if(e.target.dataset.v)choose(e.target.dataset.v)};
$("#mode").onclick=e=>{if(e.target.dataset.v){S.mode=e.target.dataset.v;S.push=true;try{localStorage.setItem("gg-mode",S.mode)}catch(e2){}if(S.mode==="simple"&&!vis().some(c=>c.k===S.k)&&S.k!=="abs"){S.k="name";S.desc=false}render()}};
$("#dir").onclick=e=>{if(e.target.dataset.v){S.dir=e.target.dataset.v;render()}};
$("#q").oninput=e=>{S.q=e.target.value;render()};$("#subj").onchange=e=>{S.subj=e.target.value;render()};$("#clr").onchange=e=>{S.clr=e.target.checked;render()};
$("#sort").onchange=e=>{const[k,d]=e.target.value.split(":");S.k=k;S.desc=d==="true";render()};
$("#th").onclick=e=>{const b=e.target.closest("button");if(!b)return;const k=b.dataset.k;if(S.k===k)S.desc=!S.desc;else{S.k=k;S.desc=k!=="name"&&k!=="subs"}render()};
function tog(e){const tr=e.target.closest("tr.r");if(!tr)return;const n=tr.dataset.n;S.open.has(n)?S.open.delete(n):S.open.add(n);render()}
$("#tb").onclick=tog;$("#tb").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tog(e)}};
$("#reset").onclick=()=>{Object.assign(S,{q:"",subj:"",dir:"all",clr:false,k:"students",desc:true});S.open.clear();$("#q").value="";$("#subj").value="";$("#clr").checked=false;render()};
$("#exp").onclick=()=>{const a=rows(),csv=["professor,students,prof_avg,others_avg,diff,ci_low,ci_high,clear"].concat(a.map(r=>[r.name,r.students,r.pavg.toFixed(2),r.oavg.toFixed(2),r.diff.toFixed(2),r.lo.toFixed(2),r.hi.toFixed(2),r.clear].join(","))).join("\n");const l=document.createElement("a");l.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));l.download="gradegap-"+S.campus.toLowerCase()+".csv";l.click()};
document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement!==$("#q")){e.preventDefault();$("#q").focus()}});
const dlg=$("#pick");
function choose(v){S.push=true;try{localStorage.setItem("gg-campus",v)}catch(e){}if(dlg.open)dlg.close();go(v)}
dlg.querySelectorAll("button").forEach(b=>b.onclick=()=>choose(b.dataset.v));
dlg.addEventListener("cancel",e=>{e.preventDefault();choose(S.campus)});
async function load(c){if(DATA[c])return true;try{const r=await fetch("data/"+c.toLowerCase()+".json?v="+document.documentElement.dataset.build);if(!r.ok)throw 0;const j=await r.json();DATA[c]=j.rows;META[c]=j.meta;SUBS[c]=[...new Set(j.rows.flatMap(x=>x.subs.split(", ")).filter(Boolean))].sort();return true}catch(e){return false}}
async function go(c){S.campus=c;S.open.clear();const n=vis().length;$("#tb").innerHTML=`<tr><td colspan="${n}" class="empty l">Loading ${LAB[c]} data\u2026</td></tr>`;$("#count").textContent="";
 const ok=await load(c);if(S.campus!==c)return;
 if(!ok){$("#tb").innerHTML=`<tr><td colspan="${n}" class="empty l err">Couldn't load the ${LAB[c]} data. <a href="#" id="retry">Try again</a></td></tr>`;$("#retry").onclick=ev=>{ev.preventDefault();go(c)};return}
 if(!SUBS[c].includes(S.subj))S.subj="";subjects();$("#subj").value=S.subj;$("#q").value=S.q;$("#clr").checked=S.clr;render()}
function readURL(){try{const p=new URLSearchParams(location.search),c=(p.get("campus")||"").toUpperCase(),m=p.get("mode"),so=p.get("sort");
 if(LAB[c])S.campus=c;if(m==="simple"||m==="advanced")S.mode=m==="advanced"?"adv":"simple";
 if(so){const[k,d]=so.split(".");if(COLS.some(x=>x.k===k)||k==="abs"){S.k=k;S.desc=d!=="asc"}}
 S.q=p.get("q")||"";S.subj=p.get("subj")||"";S.dir=["above","below"].includes(p.get("dir"))?p.get("dir"):"all";S.clr=p.get("clear")==="1";S.page=Math.max(1,+p.get("p")||1);return !!LAB[c]}catch(e){return false}}
function writeURL(push){try{const p=new URLSearchParams({campus:S.campus.toLowerCase(),mode:S.mode==="adv"?"advanced":"simple"});if(S.q)p.set("q",S.q);if(S.subj)p.set("subj",S.subj);if(S.dir!=="all")p.set("dir",S.dir);if(S.clr)p.set("clear","1");p.set("sort",S.k+"."+(S.desc?"desc":"asc"));if(S.page>1)p.set("p",S.page);const u="?"+p;if(u!==location.search)history[push?"pushState":"replaceState"](null,"",u)}catch(e){}}
function pager(pages){$("#pager").innerHTML=pages>1?`<button class="tbtn" data-d="-1" ${S.page<2?"disabled":""}>Previous</button><span>Page ${S.page} of ${pages}</span><button class="tbtn" data-d="1" ${S.page>=pages?"disabled":""}>Next</button>`:""}
$("#pager").onclick=e=>{const b=e.target.closest("button");if(b&&!b.disabled){S.page+=+b.dataset.d;S.push=true;render();window.scrollTo(0,$(".scroll").offsetTop-80)}};
addEventListener("popstate",()=>{S.sig=undefined;readURL();go(S.campus)});
const fromURL=readURL();let saved=null;try{saved=localStorage.getItem("gg-campus");const mm=localStorage.getItem("gg-mode");if(!fromURL&&(mm==="simple"||mm==="adv"))S.mode=mm}catch(e){}
if(!fromURL&&LAB[saved])S.campus=saved;
go(S.campus);
if(!fromURL&&!LAB[saved])dlg.showModal();
