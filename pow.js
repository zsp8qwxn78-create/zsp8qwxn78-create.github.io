// Busifier anti-abuse client: proof-of-work (Web Worker) + chat/edit sessions + lead submit helper. No third parties.
(function(){
  var cs=document.currentScript, base=cs&&cs.src?cs.src.replace(/pow\.js(\?.*)?$/,''):'/';
  var API='/api';
  var MAILTO='hello@busifier.com';
  var BUSY="We're getting a lot of messages right now. Email "+MAILTO+" or try again in a bit.";
  var cur=null; // {p:Promise<{token,c}>, at:ms}
  function fetchJson(path,opt){return fetch(API+path,opt).then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{status:r.status,j:j}})})}
  function work(ch){
    return new Promise(function(res,rej){
      var w;try{w=new Worker(base+'pow-worker.js')}catch(e){return rej(new Error('noworker'))}
      var to=setTimeout(function(){w.terminate();rej(new Error('timeout'))},60000);
      w.onmessage=function(e){var d=e.data||{};if(d.c!==undefined){clearTimeout(to);w.terminate();res({token:ch.token,c:d.c})}else if(d.error){clearTimeout(to);w.terminate();rej(new Error(d.error))}};
      w.onerror=function(){clearTimeout(to);w.terminate();rej(new Error('worker'))};
      w.postMessage({token:ch.token,bits:ch.bits});
    });
  }
  // Starts a solve (idempotent); resolves with {token,c} once the server's minimum age has passed.
  function solve(){
    if(cur&&Date.now()-cur.at<12*60*1000)return cur.p;
    var at=Date.now();
    var p=fetchJson('/challenge',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}).then(function(x){
      if(x.status===429){var e=new Error('busy');e.busy=true;e.retryAfterSec=x.j&&x.j.retryAfterSec;throw e}
      if(!x.j||!x.j.token)throw new Error('challenge');
      var t0=Date.now();
      return work(x.j).then(function(sol){
        var wait=Math.max(0,(x.j.minAgeSec||3)*1000+400-(Date.now()-t0));
        return new Promise(function(r){setTimeout(function(){r(sol)},wait)});
      });
    });
    cur={p:p,at:at};p.catch(function(){cur=null});
    return p;
  }
  function take(){var p=solve();cur=null;return p} // single use: next call starts a fresh challenge
  var sess=null;
  function session(){
    if(sess&&sess.exp>Date.now()+30000)return Promise.resolve(sess.tok);
    return take().then(function(sol){
      return fetchJson('/session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pow:sol})});
    }).then(function(x){
      if(x.status===429){var e=new Error('busy');e.busy=true;e.retryAfterSec=x.j&&x.j.retryAfterSec;throw e}
      if(!x.j||!x.j.session)throw new Error('session');
      sess={tok:x.j.session,exp:Date.now()+(x.j.expiresInSec||1800)*1000};return sess.tok;
    });
  }
  // Authenticated call to /chat or /edit. Retries once with a fresh session on 401.
  function call(path,body,signal){
    function once(){
      return session().then(function(tok){
        return fetch(API+path,{method:'POST',headers:{'content-type':'application/json','x-bz-session':tok},body:JSON.stringify(body),signal:signal})
      });
    }
    return once().then(function(r){
      if(r.status===401){sess=null;return once()}
      return r;
    }).then(function(r){
      if(r.status===429){var e=new Error('busy');e.busy=true;e.retryAfterSec=x.j&&x.j.retryAfterSec;throw e}
      if(!r.ok)throw new Error('http '+r.status);
      return r.json();
    });
  }
  // Lead submit: payload fields + pow. onState('checking'|'sending'). Resolves {ok,status,error}.
  function submitLead(payload,onState){
    if(onState)onState('checking');
    return solve().then(function(sol){
      cur=null;
      if(onState)onState('sending');
      payload.pow=sol;
      return fetchJson('/lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    }).then(function(x){
      return{ok:x.status===200&&x.j&&x.j.ok===true,status:x.status,retryAfterSec:x.j&&x.j.retryAfterSec,error:(x.j&&x.j.error)||''};
    },function(e){
      return{ok:false,status:e&&e.busy?429:0,retryAfterSec:e&&e.retryAfterSec,error:e&&e.busy?BUSY:'',fallback:true};
    });
  }
  window.BzPow={solve:solve,session:session,call:call,submitLead:submitLead,BUSY:BUSY,MAILTO:MAILTO,hasSession:function(){return !!(sess&&sess.exp>Date.now()+30000)},warm:function(){solve().catch(function(){})}};
})();
