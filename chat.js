(function(){
  var s=document.currentScript;
  var tenant=(s&&s.dataset.tenant)||'busifier';
  var api=(s&&s.dataset.api)||'/api/chat';
  var ps=window.BzPow?{}:document.createElement('script');ps.src=(s&&s.src?s.src.replace(/chat\.js(\?.*)?$/,''):'')+'pow.js';ps.async=false;if(!window.BzPow)document.head.appendChild(ps);
  var title=(s&&s.dataset.title)||'Ask Busifier';
  var greet=(s&&s.dataset.greeting)||'Hi! Ask me what Busifier does, what it costs, or how the approval step works.';
  // Tappable starter questions under the greeting, so a visitor never faces an empty box. data-examples="A|B|C" sets
  // them per site; busifier.com has its own three; other sites show none unless they set the attribute.
  var examples=(s&&s.dataset.examples?s.dataset.examples.split('|'):tenant==='busifier'?['What does it cost?','How does it work?','How long until I see my site?']:[]).map(function(t){return t.trim()}).filter(Boolean).slice(0,4);
  // Voice (WP11). Two modes: Talk (mic on, every reply spoken, listening resumes after the reply) or Type (silent).
  // data-voice="off" hides it; data-voice-provider is the tier 2 seam ('browser' today; 'azure' later, see
  // docs/product/audit-2026-10-08/voice-research.md). Tier 1 uses the browser's own speech service: no new network calls.
  var voiceWanted=!s||s.dataset.voice!=='off';
  var voiceProvider=(s&&s.dataset.voiceProvider)||'browser';
  var link=document.createElement('link');link.rel='stylesheet';link.href=(s&&s.dataset.css)||'chat.css';document.head.appendChild(link);
  var h=[];
  var btn=document.createElement('button');btn.className='bz-launch';btn.type='button';btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','bz-panel');
  btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>Chat</span>';
  var p=document.createElement('section');p.className='bz-panel';p.id='bz-panel';p.setAttribute('aria-label',title);p.setAttribute('role','dialog');p.setAttribute('aria-modal','false');if(tenant==='busifier')p.setAttribute('data-theme','busifier');
  var MIC='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/><path d="M6 11a6 6 0 0 0 12 0"/><path d="M12 17v4"/><path d="M9 21h6"/></svg>';
  var STOP='<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M7 7h10v10H7z"/></svg>';
  var KEYS='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18v10H3z"/><path d="M7 11h.01M11 11h.01M15 11h.01M7 14h10"/></svg>';
  p.innerHTML='<div class="bz-head"><div><b></b><small>AI assistant · answers from our team’s facts</small></div><button class="bz-x" type="button" aria-label="Close chat">×</button></div><div class="bz-log" role="log" aria-live="polite" aria-label="Conversation" tabindex="0"></div><div class="bz-bar" hidden><div class="bz-bar-row"><div class="bz-pill" role="group" aria-label="Talk or type"><button type="button" class="bz-pill-opt bz-pill-talk" aria-pressed="false">'+MIC+'<span>Talk</span></button><button type="button" class="bz-pill-opt bz-pill-type" aria-pressed="false">'+KEYS+'<span>Type</span></button></div><label class="bz-voice-pick" hidden><span>Voice</span><select aria-label="Voice"><option value="ava">Ava</option><option value="andrew">Andrew</option><option value="emma">Emma</option><option value="brian">Brian</option></select></label></div><p class="bz-voice" role="status" aria-live="polite" hidden></p></div><form class="bz-form"><label class="bz-sr" for="bz-in">Your message</label><input id="bz-in" autocomplete="off" maxlength="500" placeholder="Type your question"><button class="bz-mic" type="button" aria-pressed="false" aria-label="Talk" hidden>'+MIC+'</button><button type="submit">Send</button></form><div class="bz-note">AI can make mistakes. Hours, prices and bookings are confirmed by the team.</div>';
  p.querySelector('b').textContent=title;
  document.body.appendChild(btn);document.body.appendChild(p);
  var log=p.querySelector('.bz-log'),form=p.querySelector('form'),inp=p.querySelector('input'),note=p.querySelector('.bz-note');
  function add(t,c){var d=document.createElement('div');d.className='bz-m '+c;d.textContent=t;log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
  var opened=false;
  var chipRow=null;
  function offerExamples(){if(!examples.length)return;chipRow=document.createElement('div');chipRow.className='bz-chips';chipRow.setAttribute('role','group');chipRow.setAttribute('aria-label','Questions you can ask');
    examples.forEach(function(t){var c=document.createElement('button');c.type='button';c.className='bz-chip';c.textContent=t;c.onclick=function(){send(t)};chipRow.appendChild(c)});log.appendChild(chipRow)}
  function toggle(o){p.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);if(o){if(!opened){add(greet,'bot');offerExamples();if(voice)voice.offer();opened=true}inp.focus()}else{if(voice)voice.quiet();btn.focus()}}
  btn.onclick=function(){toggle(!p.classList.contains('open'))};
  p.querySelector('.bz-x').onclick=function(){toggle(false)};
  p.addEventListener('keydown',function(e){
    if(e.key==='Escape'){if(voice&&voice.listening()){e.preventDefault();voice.cancel();return}toggle(false);return}
    if(e.key!=='Tab')return;
    var f=Array.prototype.filter.call(p.querySelectorAll('button,input,[tabindex="0"]'),function(el){return !el.hidden&&!el.disabled&&el.offsetParent!==null});if(!f.length)return;
    var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
    else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
  });
  function send(t){
    if(!t)return;inp.value='';if(chipRow&&chipRow.parentNode){chipRow.parentNode.removeChild(chipRow);chipRow=null}
    if(voice)voice.busy(true);
    add(t,'me');h.push({role:'user',content:t});
    var w=add(window.BzPow&&!BzPow.hasSession()?"Checking you're human…":'Typing…','bot');w.setAttribute('aria-busy','true');
    var cp=window.BzPow?BzPow.call('/chat',{tenant:tenant,messages:h}):Promise.reject(new Error('nopow'));
    cp.then(function(j){w.removeAttribute('aria-busy');w.textContent=j.reply||'Sorry, I could not answer that.';h.push({role:'assistant',content:w.textContent});if(voice)voice.afterReply(w.textContent)})
      .catch(function(e){w.removeAttribute('aria-busy');w.className='bz-m err';w.textContent=e&&e.busy?"We're getting a lot of messages right now. Email hello@busifier.com or try again in a bit.":'The assistant is unavailable right now. Please use the request form or email hello@busifier.com and our team will follow up.';h.pop();if(voice)voice.busy(false)});
  }
  form.onsubmit=function(e){e.preventDefault();send(inp.value.trim())};

  // ---- voice: tier 1, browser speech only ----
  var voice=voiceWanted?setupVoice():null;
  function setupVoice(){
    var providers={browser:function(w){var R=w.SpeechRecognition||w.webkitSpeechRecognition||null;var S=w.speechSynthesis&&typeof w.speechSynthesis.speak==='function'?w.speechSynthesis:null;return{Recognition:typeof R==='function'?R:null,synthesis:S}}};
    var make=providers[voiceProvider]||providers.browser;
    var sup=make(window);var Rec=window.isSecureContext===false?null:sup.Recognition,syn=sup.synthesis;
    if(!Rec)return null; // Talk mode needs the microphone; otherwise the widget is text only, as before
    var lang=document.documentElement.lang||navigator.language||'en-US';
    var bar=p.querySelector('.bz-bar'),status=p.querySelector('.bz-voice'),mic=p.querySelector('.bz-mic'),pillTalk=p.querySelector('.bz-pill-talk'),pillType=p.querySelector('.bz-pill-type'),chooser=null;
    var KEY='bz-chat-mode',VKEY='bz-chat-voice',VOICES=['ava','andrew','emma','brian'],mode='text',rec=null,finalText='',typed='',cancelled=false,state='idle',utt=null,isBusy=false,paused=true;
    var audio=null,ttsSeq=0,lastClean='',picker=p.querySelector('.bz-voice-pick'),voiceSel=picker.querySelector('select'),voiceId='ava';
    try{var vv=localStorage.getItem(VKEY);if(VOICES.indexOf(vv)>=0)voiceId=vv}catch(e){}voiceSel.value=voiceId;
    var SILENT='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    function prime(){try{if(!window.Audio)return;audio=audio||new Audio();audio.src=SILENT;var pr=audio.play();if(pr&&pr.catch)pr.catch(function(){})}catch(e){}}
    // Server voice (Azure neural via /api/public/speech, PoW session, 600 chars). Browser speech is the fallback.
    function tts(text){return new Promise(function(res){if(!window.BzPow||!window.Audio||typeof BzPow.session!=='function')throw new Error('no tts');res(BzPow.session())}).then(function(tok){return fetch('/api/public/speech',{method:'POST',headers:{'content-type':'application/json','x-bz-session':tok},body:JSON.stringify({tenant:tenant,text:text,voice:voiceId})})}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.blob()})}
    function playBlob(blob,seq){audio=audio||new Audio();var url=URL.createObjectURL(blob);var release=function(){try{URL.revokeObjectURL(url)}catch(e){}};audio.onended=function(){release();if(seq===ttsSeq&&state==='speaking')setState('idle')};audio.onerror=function(){release();if(seq===ttsSeq&&!browserSpeak(lastClean))setState('idle')};audio.src=url;var pr=audio.play();if(pr&&pr.catch)pr.catch(function(){release();if(seq===ttsSeq&&!browserSpeak(lastClean))setState('idle')})}
    var COPY={listening:'Listening… tap the microphone when you are done.',thinking:'Thinking…',speaking:'Speaking…',ready:'Tap the microphone and talk.',returned:'Talk is on. Replies will be spoken.',blocked:'We could not use the microphone, so we switched you to typing.',cancelled:'Cancelled. Nothing was sent.'};
    var DENIED={setting:'The microphone is blocked for this site. Click the lock icon next to the web address, allow the microphone, then try again.',policy:'This page is not allowed to use the microphone yet, so typing is the way for now.',prompt:'We did not get permission to use the microphone. Try again and choose Allow when your browser asks.',device:'No microphone was found. Plug one in or check your sound settings, then try again.'};
    var statusText=document.createElement('span'),retry=document.createElement('button'),stopBtn=document.createElement('button'),switchBtn=document.createElement('button');
    retry.type='button';retry.className='bz-retry';retry.textContent='Try the microphone again';retry.hidden=true;
    stopBtn.type='button';stopBtn.className='bz-retry bz-stop';stopBtn.innerHTML=STOP+'Stop';stopBtn.setAttribute('aria-label','Stop speaking');stopBtn.hidden=true;
    switchBtn.type='button';switchBtn.className='bz-retry';switchBtn.textContent='Switch to Type';switchBtn.hidden=true;
    status.appendChild(statusText);status.appendChild(stopBtn);status.appendChild(retry);status.appendChild(switchBtn);
    retry.onclick=function(){setMode('voice',true)}; // start() runs synchronously inside this click so the browser can prompt
    stopBtn.onclick=function(){paused=true;stopSpeaking()};
    switchBtn.onclick=function(){setMode('text',false);inp.focus()};
    function say(t,kind,extra){statusText.textContent=t||'';status.hidden=!t;status.className='bz-voice'+(kind?' is-'+kind:'');retry.hidden=extra!=='retry';stopBtn.hidden=extra!=='stop';switchBtn.hidden=extra!=='switch'}
    function denialKind(code){
      if(code==='audio-capture')return Promise.resolve('device');
      try{var pol=document.permissionsPolicy||document.featurePolicy;if(pol&&typeof pol.allowsFeature==='function'&&!pol.allowsFeature('microphone'))return Promise.resolve('policy')}catch(e){}
      if(!navigator.permissions||!navigator.permissions.query)return Promise.resolve('setting');
      return navigator.permissions.query({name:'microphone'}).then(function(r){return r&&r.state==='prompt'?'prompt':'setting'},function(){return 'setting'});
    }
    function blocked(code){setMode('text');say(COPY.blocked,'bad','retry');denialKind(code).then(function(k){if(mode==='text')say(DENIED[k],'bad',k==='policy'?null:'retry')})}
    function errCopy(c){
      if(c==='no-speech')return 'We did not hear anything. Tap the microphone and try again.';
      if(c==='network')return 'Voice needs an internet connection right now. Typing still works.';
      if(c==='aborted')return '';
      return 'Voice is not working right now. Typing still works.';
    }
    function paint(){
      var st=isBusy?'thinking':state;
      mic.setAttribute('aria-pressed',String(st==='listening'));mic.className='bz-mic'+(st!=='idle'?' is-'+st:'');mic.disabled=isBusy;
      mic.setAttribute('aria-label',st==='listening'?'Stop listening and send':st==='speaking'?'Skip the reply and talk':st==='thinking'?'Thinking':'Talk');
      if(mode==='voice')say(COPY[st]||COPY.ready,st==='idle'?'':st,st==='speaking'?'stop':null);else if(!status.classList.contains('is-bad'))say('');
    }
    function setState(s){if(state===s)return;var was=state;state=s;paint();if(s==='idle'&&was==='speaking'&&mode==='voice'&&!paused&&!isBusy)listen()}
    function join(t){return typed&&t?typed+' '+t:(typed||t)}
    function stopSpeaking(){ttsSeq++;if(audio){try{audio.pause();audio.onended=audio.onerror=null;audio.removeAttribute('src')}catch(e){}}if(syn){try{syn.cancel()}catch(e){}}utt=null;if(state==='speaking')setState('idle')}
    function start(){
      if(state==='listening')return false;
      stopSpeaking();finalText='';cancelled=false;
      try{
        rec=new Rec();rec.lang=lang;rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
        rec.onresult=function(ev){var interim='',rs=ev.results||[];for(var i=ev.resultIndex||0;i<rs.length;i++){var alt=rs[i]&&rs[i][0]?rs[i][0].transcript:'';if(rs[i]&&rs[i].isFinal)finalText+=alt;else interim+=alt}inp.value=join((finalText+interim).replace(/\s+/g,' ').trim())};
        rec.onerror=function(ev){var c=ev&&ev.error;if(c==='not-allowed'||c==='service-not-allowed'||c==='audio-capture'){blocked(c);return}paused=true;if(c!=='aborted'&&c!=='no-speech')finalText='';var t=errCopy(c);if(t)say(t,'bad','retry')};
        rec.onend=function(){var t=finalText.trim();rec=null;setState('idle');if(!cancelled&&t)send(join(t));else if(cancelled)inp.value=typed;finalText=''};
        rec.start();setState('listening');return true;
      }catch(e){rec=null;setState('idle');say(errCopy('start-failed'),'bad','retry');return false}
    }
    function listen(){if(isBusy)return false;typed=inp.value.trim();paused=false;return start()}
    function stop(){if(rec){try{rec.stop()}catch(e){}}}
    function cancel(){paused=true;if(rec){cancelled=true;try{rec.abort()}catch(e){}}inp.value=typed;say(COPY.cancelled)}
    function pickVoice(vs){
      var base=lang.toLowerCase().split('-')[0],best=null,bestS=-1;
      for(var i=0;i<vs.length;i++){var v=vs[i],l=String(v.lang||'').toLowerCase().replace('_','-'),n=String(v.name||''),sc=0;
        if(l===lang.toLowerCase())sc+=40;else if(l.split('-')[0]===base)sc+=20;else continue;
        if(/natural|premium|enhanced|siri|neural/i.test(n))sc+=10;
        if(/google|microsoft .*online|samantha|ava|zoe|aria|jenny/i.test(n))sc+=5;
        if(/compact|espeak|novelty|whisper|bells|bad news|zarvox|trinoids|cellos|boing|bubbles|deranged|hysterical|organ|wobble|jester|superstar/i.test(n))sc-=30;
        if(v.default)sc+=1;
        if(sc>bestS){best=v;bestS=sc}}
      return best;
    }
    function speakable(t){return String(t).replace(/https?:\/\/[^\s)]+/g,function(m){try{return new URL(m).hostname.replace(/^www\./,'')}catch(e){return 'link'}}).replace(/[*_`#>]+/g,'').replace(/\s+/g,' ').trim()}
    function speak(t){
      if(mode!=='voice')return false;
      var clean=speakable(t);if(!clean)return false;
      stopSpeaking();lastClean=clean;
      var seq=ttsSeq;setState('speaking');
      tts(clean.slice(0,600)).then(function(blob){if(seq!==ttsSeq)return;playBlob(blob,seq)}).catch(function(){if(seq===ttsSeq&&!browserSpeak(clean))setState('idle')});
      return true;
    }
    function browserSpeak(clean){
      if(!syn||!clean||typeof SpeechSynthesisUtterance!=='function')return false;
      utt=new SpeechSynthesisUtterance(clean);utt.lang=lang;var v=pickVoice(syn.getVoices?syn.getVoices():[]);if(v)utt.voice=v;utt.rate=1;
      utt.onstart=function(){setState('speaking')};utt.onend=utt.onerror=function(){if(state==='speaking')setState('idle');utt=null};
      try{syn.speak(utt)}catch(e){utt=null;return false}
      return true;
    }
    function readMode(){var v=null;try{v=localStorage.getItem(KEY)}catch(e){}if(v!=='voice'&&v!=='text'){try{v=sessionStorage.getItem(KEY)}catch(e){}}return v==='voice'||v==='text'?v:null}
    function saveMode(m){try{localStorage.setItem(KEY,m)}catch(e){}try{sessionStorage.setItem(KEY,m)}catch(e){}}
    function setMode(m,startNow){
      mode=m;paused=true;saveMode(mode);
      picker.hidden=mode!=='voice';
      if(mode==='voice'){mic.hidden=false;if(startNow){prime();listen()}}
      else{stopSpeaking();if(rec){cancelled=true;try{rec.abort()}catch(e){}}inp.value=typed||inp.value;mic.hidden=true}
      pillTalk.setAttribute('aria-pressed',String(mode==='voice'));pillType.setAttribute('aria-pressed',String(mode==='text'));
      bar.hidden=false;
      if(chooser&&chooser.parentNode)chooser.parentNode.removeChild(chooser);chooser=null;
      paint();
    }
    mic.onclick=function(){if(state==='listening'){stop();return}if(state==='speaking')stopSpeaking();if(!listen())inp.focus()};
    voiceSel.onchange=function(){voiceId=VOICES.indexOf(voiceSel.value)>=0?voiceSel.value:'ava';try{localStorage.setItem(VKEY,voiceId)}catch(e){}if(mode==='voice'){prime();speak('Hi, I am '+voiceSel.options[voiceSel.selectedIndex].text+'.')}};
    pillTalk.onclick=function(){if(mode!=='voice')setMode('voice',true)};
    pillType.onclick=function(){if(mode!=='text'){setMode('text',false);inp.focus()}};
    var pn=document.createElement('span');pn.className='bz-privacy';pn.textContent=' Voice uses your browser’s speech service.';note.appendChild(pn);
    var saved=readMode();
    if(saved){setMode(saved,false);if(saved==='voice')say(COPY.returned,'','switch')}
    return{
      // First open with no remembered choice: offer Talk or Type as a large card in the conversation.
      offer:function(){if(saved)return;chooser=document.createElement('div');chooser.className='bz-m bot bz-choice';chooser.setAttribute('role','group');chooser.setAttribute('aria-label','How do you want to do this?');
        chooser.innerHTML='<p>How do you want to do this?</p><div class="bz-opts"><button type="button" class="bz-opt bz-opt-talk">'+MIC+'<b>Talk</b><small>Speak, and every reply is spoken back.</small></button><button type="button" class="bz-opt bz-opt-type">'+KEYS+'<b>Type</b><small>Type, and nothing is spoken.</small></button></div>';
        var bs=chooser.querySelectorAll('button');bs[0].onclick=function(){setMode('voice',true)};bs[1].onclick=function(){setMode('text',false);inp.focus()};log.appendChild(chooser);log.scrollTop=log.scrollHeight},
      busy:function(b){isBusy=!!b;if(isBusy&&state==='listening'){cancelled=true;try{rec&&rec.abort()}catch(e){}}paint()},
      afterReply:function(t){isBusy=false;var spoke=speak(t);if(!spoke&&mode==='voice'&&!paused)listen();else paint()},
      cancel:cancel,
      quiet:function(){stopSpeaking();if(state==='listening')cancel()},
      listening:function(){return state==='listening'}
    };
  }
})();
