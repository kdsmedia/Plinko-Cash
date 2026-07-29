export const PLINKO_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    html,body{width:100%;height:100%;overflow:hidden;background:#0a0f1d}
    canvas{display:block}
  </style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = window.innerWidth;
  var H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(dpr, dpr);

  var ROWS = 20;
  var PIN_R = Math.max(3.5, W * 0.009);
  var BALL_R = Math.max(6, W * 0.014);
  var TOP_PAD = H * 0.08;
  var BOT_PAD = H * 0.13;

  var BUCKET_DEFS = [
    {label:"5x",mult:5,color:"#eab308",type:"number"},
    {label:"10x",mult:10,color:"#ea580c",type:"number"},
    {label:"20x",mult:20,color:"#ea580c",type:"number"},
    {label:"ZONK",mult:0,color:"#ef4444",type:"zonk"},
    {label:"25x",mult:25,color:"#f97316",type:"number"},
    {label:"50x",mult:50,color:"#dc2626",type:"number"},
    {label:"ADS",mult:30,color:"#8b5cf6",type:"ads"},
    {label:"75x",mult:75,color:"#b91c1c",type:"number"},
    {label:"100x",mult:100,color:"#991b1b",type:"number"},
    {label:"ADS",mult:50,color:"#8b5cf6",type:"ads"},
    {label:"125x",mult:125,color:"#7f1d1d",type:"number"},
    {label:"ADS",mult:50,color:"#8b5cf6",type:"ads"},
    {label:"150x",mult:150,color:"#fbbf24",type:"number"},
    {label:"ZONK",mult:0,color:"#ef4444",type:"zonk"},
    {label:"25x",mult:25,color:"#f97316",type:"number"},
    {label:"ADS",mult:30,color:"#8b5cf6",type:"ads"},
    {label:"20x",mult:20,color:"#ea580c",type:"number"},
    {label:"10x",mult:10,color:"#eab308",type:"number"},
    {label:"5x",mult:5,color:"#eab308",type:"number"}
  ];

  var BW = W / BUCKET_DEFS.length;
  var buckets = BUCKET_DEFS.map(function(b,i){
    return {x:i*BW,width:BW,label:b.label,mult:b.mult,color:b.color,type:b.type,hitTime:0};
  });

  var pegs=[], balls=[], particles=[], goldenHits={};

  function initBoard(){
    pegs=[];
    var bh = H - TOP_PAD - BOT_PAD;
    var nc = BUCKET_DEFS.length;
    for(var r=0;r<ROWS;r++){
      var prog = r/Math.max(1,ROWS-1);
      var cnt = Math.round(3 + prog*(nc-2));
      var ry = TOP_PAD + (r+1)*bh/(ROWS+1);
      var sp = W/(nc+1);
      var sx = (W-(cnt-1)*sp)/2;
      for(var c=0;c<cnt;c++){
        pegs.push({
          x:sx+c*sp, y:ry, r:PIN_R,
          golden:((r+c)%7===0)||(Math.random()<0.12),
          hitTime:0
        });
      }
    }
  }

  window.dropBall = function(type, bet){
    var sx = W/2 + (Math.random()*8-4);
    var cm = {standard:"#38bdf8",golden:"#fbbf24",splitter:"#c084fc",bomb:"#ef4444",magnet:"#10b981"};
    var id = Date.now()+"_"+Math.random();
    balls.push({
      id:id, type:type||"standard", x:sx, y:TOP_PAD-25,
      vx:(Math.random()-0.5)*0.8, vy:0.3+Math.random()*0.2,
      r:BALL_R, color:cm[type]||cm.standard,
      bet:bet||1, golden:type==="golden",
      splitter:type==="splitter", split:false, trail:[]
    });
    goldenHits[id]=0;
  };

  function spawn(x,y,color,n,txt){
    for(var i=0;i<(n||8);i++){
      var ang=Math.random()*Math.PI*2;
      var spd=1+Math.random()*3;
      particles.push({
        x:x,y:y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-1,
        color:color,r:1.5+Math.random()*2,a:1,life:0,
        max:16+Math.random()*18,txt:i===0?txt:null
      });
    }
  }

  function sendMsg(data){
    try{window.ReactNativeWebView.postMessage(JSON.stringify(data));}catch(e){}
  }

  function onMsg(e){
    try{
      var d=JSON.parse(e.data);
      if(d.type==="DROP") window.dropBall(d.ballType||"standard",d.bet||1);
    }catch(e){}
  }
  window.addEventListener("message",onMsg);
  document.addEventListener("message",onMsg);

  function render(){
    var now=Date.now();
    var BY=H-BOT_PAD;

    ctx.fillStyle="#0a0f1d";
    ctx.fillRect(0,0,W,H);

    // subtle grid
    ctx.strokeStyle="rgba(30,41,59,0.22)";
    ctx.lineWidth=1;
    for(var gx=0;gx<=W;gx+=32){
      ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();
    }

    // pegs
    for(var pi=0;pi<pegs.length;pi++){
      var pg=pegs[pi];
      var hit=(now-pg.hitTime)<220;
      ctx.save();
      ctx.beginPath();
      ctx.arc(pg.x,pg.y,pg.r,0,Math.PI*2);
      if(pg.golden){
        ctx.fillStyle=hit?"#ffffff":"#fbbf24";
        ctx.shadowColor="#fbbf24";
        ctx.shadowBlur=hit?18:8;
      } else {
        ctx.fillStyle=hit?"#38bdf8":"#475569";
        ctx.shadowColor="#38bdf8";
        ctx.shadowBlur=hit?12:0;
      }
      ctx.fill();
      ctx.restore();
    }

    // balls
    var nb=[];
    for(var bi=0;bi<balls.length;bi++){
      var b=balls[bi];
      b.vy+=0.11; b.vx*=0.985; b.vy*=0.985;
      var spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
      if(spd>5.5){b.vx=b.vx/spd*5.5;b.vy=b.vy/spd*5.5;}
      if(b.type==="magnet") b.vx+=b.x<W/2?-0.08:0.08;
      b.x+=b.vx; b.y+=b.vy;

      b.trail.push({x:b.x,y:b.y});
      if(b.trail.length>8) b.trail.shift();
      for(var ti=0;ti<b.trail.length;ti++){
        var t=b.trail[ti];
        ctx.beginPath();
        ctx.arc(t.x,t.y,b.r*(ti/b.trail.length)*0.65,0,Math.PI*2);
        ctx.fillStyle=b.color;
        ctx.globalAlpha=(ti/b.trail.length)*0.2;
        ctx.fill();
      }
      ctx.globalAlpha=1;

      if(b.x-b.r<4){b.x=4+b.r;b.vx=Math.abs(b.vx)*0.7;}
      else if(b.x+b.r>W-4){b.x=W-4-b.r;b.vx=-Math.abs(b.vx)*0.7;}

      for(var pp=0;pp<pegs.length;pp++){
        var pg2=pegs[pp];
        var dx=b.x-pg2.x, dy=b.y-pg2.y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        var md=b.r+pg2.r;
        if(dist<md&&dist>0){
          var nx=dx/dist, ny=dy/dist;
          b.x=pg2.x+nx*md; b.y=pg2.y+ny*md;
          var dot=b.vx*nx+b.vy*ny;
          b.vx-=1.55*dot*nx-(Math.random()-0.5)*0.4;
          b.vy-=1.55*dot*ny-(Math.random()-0.5)*0.18;
          pg2.hitTime=now;
          if(pg2.golden){goldenHits[b.id]=(goldenHits[b.id]||0)+1;spawn(pg2.x,pg2.y,"#fbbf24",5,"+50");}
          if(b.type==="bomb"){
            spawn(pg2.x,pg2.y,"#ef4444",10);
            for(var oi=0;oi<balls.length;oi++){
              var ob=balls[oi];
              if(ob.id!==b.id){
                var ox=ob.x-pg2.x,oy=ob.y-pg2.y;
                var od=Math.sqrt(ox*ox+oy*oy);
                if(od<65&&od>0){ob.vx+=ox/od*3;ob.vy+=oy/od*3;}
              }
            }
          }
          break;
        }
      }

      if(b.type==="splitter"&&!b.split&&b.y>TOP_PAD+(H-TOP_PAD-BOT_PAD)*0.45){
        b.split=true;
        spawn(b.x,b.y,"#c084fc",8,"SPLIT!");
        for(var si=0;si<2;si++){
          var off=si===0?-1.6:1.6;
          var s={id:Date.now()+"_"+Math.random(),type:"splitter",x:b.x,y:b.y,
            vx:b.vx+off,vy:b.vy*0.9,r:b.r*0.85,color:b.color,
            bet:b.bet,golden:false,splitter:true,split:true,trail:[]};
          goldenHits[s.id]=0;
          nb.push(s);
        }
        continue;
      }

      if(b.y+b.r>=BY){
        var idx=Math.min(buckets.length-1,Math.max(0,Math.floor(b.x/BW)));
        var bk=buckets[idx];
        bk.hitTime=now;
        var mult=bk.mult;
        if(b.golden) mult*=2;
        var gc=goldenHits[b.id]||0;
        var payout=b.bet*mult+gc*50;
        delete goldenHits[b.id];
        spawn(b.x,BY,bk.color,12,mult>0?mult+"x":"ZONK");
        sendMsg({type:"BALL_LANDED",payout:payout,multiplier:mult,ballType:b.type,goldenPegsHit:gc,bucketType:bk.type});
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.fillStyle=b.color;
      ctx.shadowColor=b.color;
      ctx.shadowBlur=10;
      ctx.fill();
      ctx.restore();
      nb.push(b);
    }
    balls=nb;

    // buckets
    var fs=Math.max(5.5,BW*0.3);
    for(var bci=0;bci<buckets.length;bci++){
      var bk2=buckets[bci];
      var isHit=(now-bk2.hitTime)<300;
      ctx.save();
      ctx.fillStyle=isHit?"#ffffff":bk2.color;
      ctx.fillRect(bk2.x+0.5,BY,bk2.width-1,BOT_PAD-5);
      ctx.strokeStyle=isHit?"#fbbf24":"#0f172a";
      ctx.lineWidth=isHit?2:0.8;
      ctx.strokeRect(bk2.x+0.5,BY,bk2.width-1,BOT_PAD-5);
      ctx.fillStyle=isHit?"#000":(bk2.type==="ads"?"#fef08a":"#fff");
      ctx.font="bold "+fs+"px system-ui,sans-serif";
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.fillText(bk2.label,bk2.x+bk2.width/2,BY+(BOT_PAD-5)/2);
      ctx.restore();
    }

    // particles
    var np=[];
    for(var ppi=0;ppi<particles.length;ppi++){
      var p=particles[ppi];
      p.life++;p.x+=p.vx;p.y+=p.vy;p.a=1-p.life/p.max;
      if(p.life<p.max){
        ctx.save();ctx.globalAlpha=p.a;
        if(p.txt){
          ctx.fillStyle=p.color;
          ctx.font="bold 11px system-ui,sans-serif";
          ctx.textAlign="center";
          ctx.fillText(p.txt,p.x,p.y);
        } else {
          ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle=p.color;ctx.fill();
        }
        ctx.restore();
        np.push(p);
      }
    }
    particles=np;
    requestAnimationFrame(render);
  }

  initBoard();
  render();
})();
</script>
</body>
</html>`;
