// Proof-of-work solver (Web Worker). Finds counter c so SHA-256(token + ":" + c) has `bits` leading zero bits.
// Pure-JS SHA-256 (sync) because crypto.subtle.digest is too slow for ~2^18 attempts.
var K=new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
var W=new Uint32Array(64);
function sha(m){ // m: Uint8Array -> Uint32Array(8)
  var l=m.length,n=((l+9+63)>>6)<<6,b=new Uint8Array(n);b.set(m);b[l]=0x80;
  var bits=l*8;b[n-4]=bits>>>24;b[n-3]=bits>>>16;b[n-2]=bits>>>8;b[n-1]=bits;
  var h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  for(var o=0;o<n;o+=64){
    for(var i=0;i<16;i++)W[i]=(b[o+4*i]<<24)|(b[o+4*i+1]<<16)|(b[o+4*i+2]<<8)|b[o+4*i+3];
    for(i=16;i<64;i++){var a=W[i-15],c=W[i-2];
      W[i]=(((c>>>17|c<<15)^(c>>>19|c<<13)^(c>>>10))+W[i-7]+((a>>>7|a<<25)^(a>>>18|a<<14)^(a>>>3))+W[i-16])|0}
    var A=h0,B=h1,C=h2,D=h3,E=h4,F=h5,G=h6,H=h7;
    for(i=0;i<64;i++){
      var t1=(H+((E>>>6|E<<26)^(E>>>11|E<<21)^(E>>>25|E<<7))+((E&F)^(~E&G))+K[i]+W[i])|0;
      var t2=(((A>>>2|A<<30)^(A>>>13|A<<19)^(A>>>22|A<<10))+((A&B)^(A&C)^(B&C)))|0;
      H=G;G=F;F=E;E=(D+t1)|0;D=C;C=B;B=A;A=(t1+t2)|0}
    h0=(h0+A)|0;h1=(h1+B)|0;h2=(h2+C)|0;h3=(h3+D)|0;h4=(h4+E)|0;h5=(h5+F)|0;h6=(h6+G)|0;h7=(h7+H)|0}
  return [h0,h1,h2,h3,h4,h5,h6,h7];
}
function lz(h){var n=0;for(var i=0;i<8;i++){if(h[i]===0){n+=32;continue}return n+Math.clz32(h[i])}return n}
self.onmessage=function(e){
  var token=e.data.token,bits=e.data.bits,enc=new TextEncoder(),pre=token+":";
  for(var c=0;c<4e9;c++){
    if(lz(sha(enc.encode(pre+c)))>=bits){self.postMessage({c:c});return}
    if(c%50000===49999)self.postMessage({progress:c});
  }
  self.postMessage({error:'exhausted'});
};
