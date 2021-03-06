  //---------------------------------
  // from prototype.js
  Object.extend = function(destination, source) {
      for (var property in source) {   
          destination[property] = source[property];
      }
      return destination;
  };
  //---------------------------------
 

$(function(){

  var SIZE = 32 * 25;
  var PSIZE = SIZE / 25;
  var chrs,effects;
  var count = 0;

  var canv = $('#canv');
  canv.attr("width", SIZE);
  canv.attr("height", SIZE);
  var ctx = canv[0].getContext('2d')

  var chip = new Image();
  chip.src = 'img/98.png';

  ctx.fillStyle = "black";
  ctx.fillRect(0,0,SIZE,SIZE);
  function choice(arr){
    var r = Math.random() * arr.length;
    return arr[r | 0];
  }

  function Effect(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dead = false;
    this.count = 10;
  };
  Effect.prototype.draw = function(){
    if(this.count == 0){
      this.dead = true;
    }else{
      this.count --;
    }
    ctx.fillStyle = 'rgba(255,255,255,' + (this.count / 10) + ')';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  function Piece(){
  }
  Piece.prototype = {
    prepare:function(){},
    runX:function(){},
    hitX:function(){},
    runY:function(){},
    hitY:function(){},
    draw:function(){},
    isHit:function(p){
      var r = Math.min(this.x + this.w, p.x + p.w);
      var l = Math.max(this.x, p.x);
      var b = Math.min(this.y + this.h, p.y + p.h);
      var t = Math.max(this.y, p.y);

      if(r - l > 0 && b - t > 0){
        return true;
      }
      return false;
    }
  }

  function MapPiece(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dead = false;
    this.hit = true;
  }
  Object.extend(MapPiece.prototype, Piece.prototype);
  MapPiece.prototype.draw = function(){
    ctx.fillStyle = 'rgb(100,10,0)';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#0f0';
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.stroke();
  };

  function DeadPiece(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dead = false;
    this.hit = true;
  }
  Object.extend(DeadPiece.prototype, Piece.prototype);
  DeadPiece.prototype.draw = function(){
    ctx.fillStyle = 'rgb(200,0,0)';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#f00';
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.stroke();
  };
  function JumpPiece(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dead = false;
    this.hit = true;
  }
  Object.extend(JumpPiece.prototype, Piece.prototype);
  JumpPiece.prototype.draw = function(){
    ctx.fillStyle = 'rgb(0,200,0)';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#0f0';
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.stroke();
  };

  function MoverPiece(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dead = false;
    this.hit = false;
    this.mx = 0;
    this.my = 0;
  }
  Object.extend(MoverPiece.prototype, Piece.prototype);
  MoverPiece.prototype.draw = function(){
    ctx.fillStyle = 'rgb(0,20,0)';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#ff0';
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.stroke();
  };


  function ActionPiece(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this.ax = 0;
    this.ay = 0;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.hit = true;
  }
  Object.extend(ActionPiece.prototype, Piece.prototype);
  ActionPiece.prototype.prepare = function(){
    if(Math.random() > 0.9){
      this.vx = ((Math.random() * 3 | 0) - 1) * Math.random() * 3;
    }
    if(Math.random() > 0.999){
      this.vy = -10;
    }
    if(this.ay == 0){
      this.ay = 1;
    }
  };
  ActionPiece.prototype.runX = function(){
      this.vx += this.ax;
      if(Math.abs(this.vx) >= PSIZE){ // 速度上限
        this.vx = this.vx/Math.abs(this.vx) * (PSIZE - 1)
      }
      this.x += this.vx;
  };
  ActionPiece.prototype.runY = function(){
      this.vy += this.ay;
      if(Math.abs(this.vy) >= PSIZE){ // 速度上限
        this.vy = this.vy/Math.abs(this.vy) * (PSIZE - 1)
      }
      this.y += this.vy;
  };
  ActionPiece.prototype.hitX = function(p){ // X移動後にpに衝突
    if(p instanceof DeadPiece){
      this.dead = true;
      effects.push(new Effect(this.x, this.y, this.w, this.h));
    }
    if(p.hit){
      if(this.vx > 0){
        this.x = p.x - this.w;
      }else{
        this.x = p.x + p.w;
      }
    }

    if(p instanceof JumpPiece){
      //this.vy = -50;
    }
    if(p instanceof MoverPiece){
      if(p.mx != 0){
        this.ax = p.mx
      }
    }
 
  };
  ActionPiece.prototype.hitY = function(p){ // Y移動後にpに衝突
    if(p instanceof DeadPiece){
      this.dead = true;
      effects.push(new Effect(this.x, this.y, this.w, this.h));
    }

    if(p.hit){
      if(this.vy > 0){
        this.vy = 0; // 失速
        this.y = p.y - this.h;
      }else{
        this.vy = 0; // 失速
        this.y = p.y + p.h;
      }
    }

    if(p instanceof JumpPiece){
      this.vy = -30;
    }
    if(p instanceof MoverPiece){
      //if(p.my != 0){
        this.ay = p.my;
      //}
    }
 
  };
  ActionPiece.prototype.draw = function(){
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#660';
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.stroke();
 
  };

  function ChrPiece(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this.ax = 0;
    this.ay = 0;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.hit = true;

    this.baloon = false;
    this.bcount = 0;
    this.btext = "";
  }
  Object.extend(ChrPiece.prototype, ActionPiece.prototype);
  ChrPiece.prototype.prepare = function(){
    ActionPiece.prototype.prepare.apply(this,arguments);
    if(Math.random() > 0.999){
      this.baloon = true;
      this.bcount = 100;
      this.btext = choice([
          'おなかすいた',
          'プログラムかこう！',
          'JavaScriptで遊ぼう',
          '足がつかれた・・',
          'ココは一体、、',
          'わーい',
          'ちこく、ちこく〜',
          '素数を数えよう・・',
          'うー、なんだここ・・',
          '誰かに見られてる？',
          'コード書きすぎた・・',
          'あ、 新しいアイデア！',
          '今日は何しようかな？',
          ])
    }
    if(this.bcount != 0){
      this.bcount --;
      if(this.bcount == 0){
        this.baloon = false;
      }
    }
  }
  ChrPiece.prototype.draw = function(){
    /*
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#660';
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.stroke();
    */

    if(this.vx < 0){
      ctx.drawImage(chip, 32 * ((count/5|0) %3), 32, 32, 32, (this.x|0) - 8, (this.y|0), this.w + 16, this.h);
    }else{
      ctx.drawImage(chip,  32 * ((count/5|0) %3), 32 * 2, 32, 32, (this.x|0) - 8, (this.y|0), this.w + 16, this.h);
    }
 
    if(this.baloon){
      ctx.fillStyle = 'rgba(200,200,200,0.8)';
      ctx.fillRect(this.x, this.y - 30, 120, 20);
      ctx.beginPath();
      ctx.moveTo(this.x + 10, this.y - 10);
      ctx.lineTo(this.x + 10, this.y);
      ctx.lineTo(this.x + 10 + 10, this.y - 10);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.fillText(this.btext,this.x + 3, this.y - 15);
    }
  };


  function VMovePiece(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.ax = 0;
    this.ay = 0;
    this.vx = 0;
    this.vy = 3;
 
    this.dead = false;
    this.hit = true;
  }
  Object.extend(VMovePiece.prototype, ActionPiece.prototype);
  VMovePiece.prototype.prepare = function(){}
 
  VMovePiece.prototype.hitY = function(p){
    if(this.vy > 0){
      this.vy = -3; // 失速
      this.y = p.y - this.h;
    }else{
      this.vy = 3; // 失速
      this.y = p.y + p.h;
    }
  }
  VMovePiece.prototype.draw = function(){
    ctx.fillStyle = 'rgb(0,0,100)';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#0ff';
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.stroke();

  };


 
  function initMap(){
    var m;
    var tmp = [];
    /*
    for(var i = 0; i < SIZE / PSIZE; i ++){
      for(var j = 0; j < SIZE / PSIZE; j ++){
        tmp.push(new MapPiece(i * PSIZE, j * PSIZE, PSIZE - 2, PSIZE - 2));
      }
    }
    */
    tmp.push(new MapPiece(0, 0, SIZE, PSIZE));
    tmp.push(new MapPiece(0, 0, PSIZE, SIZE));
    tmp.push(new MapPiece(SIZE - PSIZE, 0, PSIZE, SIZE));

    tmp.push(new MapPiece(SIZE - PSIZE * 3, PSIZE * 3, PSIZE, SIZE - PSIZE * 7));
    tmp.push(new MapPiece(0, SIZE - PSIZE, SIZE - PSIZE * 2, PSIZE));
    tmp.push(new JumpPiece(SIZE - PSIZE * 2, SIZE - PSIZE, PSIZE, PSIZE));

    //tmp.push(m = new MoverPiece(SIZE - PSIZE * 2, PSIZE * 2, PSIZE, SIZE - PSIZE*3));
    //m.my = -5;
    //tmp.push(m = new MoverPiece(PSIZE, SIZE - PSIZE * 2, SIZE - PSIZE * 3, PSIZE));
    //m.mx = 1;
    //tmp.push(m = new MoverPiece(PSIZE, PSIZE, SIZE - PSIZE * 2, PSIZE));
    //m.mx = -1;
 
    return tmp;
  }
  function randMap(){
    var r,r2,p,p2,p3,flag, flag2,flag3,r3,r4;
    for(var i = 0; i < 2 * SIZE / PSIZE; i ++){
      r = Math.floor(Math.random() * SIZE/PSIZE);
      r2 = Math.floor(Math.random() * SIZE/PSIZE);
      r3 = Math.floor(Math.random() * 20) + 1;
      p = new MapPiece(r * PSIZE, r2 * PSIZE, r3 * PSIZE, PSIZE/2);
      flag = hitCheck(p);
      if(!flag){
        chrs.push(p);
      }
    }
  }
  function randSpecial(){
    for(var i = 0; i < SIZE / PSIZE / 5; i ++){
      r = Math.floor(Math.random() * SIZE/PSIZE);
      r2 = Math.floor(Math.random() * SIZE/PSIZE);

      p = new DeadPiece(r * PSIZE, r2 * PSIZE, PSIZE, PSIZE);
      flag = hitCheck(p);
      if(!flag){
        chrs.push(p);
      }
 
    }
    for(var i = 0; i < SIZE / PSIZE / 5; i ++){
      r = Math.floor(Math.random() * SIZE/PSIZE);
      r2 = Math.floor(Math.random() * SIZE/PSIZE);

      p = new VMovePiece(r * PSIZE, r2 * PSIZE, PSIZE, PSIZE);
      flag = hitCheck(p);
      if(!flag){
        chrs.push(p);
      }
 
    }
 
    for(var i = 0; i < SIZE / PSIZE; i ++){
      r = Math.floor(Math.random() * SIZE/PSIZE);
      r2 = Math.floor(Math.random() * SIZE/PSIZE);
      r3 = Math.floor(Math.random() * 20) + 1;
      r4 = Math.floor(Math.random() * 20) + 1;

      p = new JumpPiece(r * PSIZE, r2 * PSIZE, PSIZE, PSIZE);
      p2 = new MapPiece((r - r4) * PSIZE, r2 * PSIZE, r4 * PSIZE, PSIZE/2);
      p3 = new MapPiece((r + 1) * PSIZE, r2 * PSIZE, r3 * PSIZE, PSIZE/2);
      flag = hitCheck(p);
      flag2 = hitCheck(p2);
      flag3 = hitCheck(p3);
      if(!flag && !flag2 && !flag3){
        chrs.push(p);
        chrs.push(p2);
        chrs.push(p3);
      }
    }
  }
  function randChr(){
    var ret = [];
    var r,r2,p,flag;
    for(var i = 0; i < 5 * SIZE / PSIZE; i ++){
      r = Math.floor(Math.random() * SIZE/PSIZE);
      r2 = Math.floor(Math.random() * SIZE/PSIZE);
      p = new ChrPiece(r * PSIZE, r2 * PSIZE, PSIZE/2, PSIZE);
      flag = hitCheck(p);
      if(!flag){
        p.ay = 1;
        chrs.push(p);
      }
    }
  }


  function map(ar,f){
    for(var i = 0; i < ar.length; i ++){
      f(ar[i]);
    }
  }
  function drawChrs(){
    map(chrs, function(p){
      p.draw()
    });
  }
  function drawEffect(){
    map(effects, function(p){
      p.draw()
    });
  }



  function del(){
    var ret = [];
    map(chrs, function(p){
      if(!p.dead){
        ret.push(p);
      }
    });
    chrs = ret;
  }
  function delEffect(){
    var ret = [];
    map(effects, function(p){
      if(!p.dead){
        ret.push(p);
      }
    });
    effects = ret;
  }
 
  function run(){
    map(chrs, function(p){
      p.prepare();
      p.runX();
      hitXCheck(p)
      p.runY();
      hitYCheck(p)
    });
  }
  function hitCheck(target){
    var flag = false;
    map(chrs, function(p){
      if(p != target && target.isHit(p)){
        flag = true;
      }
    });
    return flag;
  }
  function hitXCheck(target){
    map(chrs, function(p){
      if(p != target && target.isHit(p)){
        target.hitX(p);
      }
    });
  }
  function hitYCheck(target){
    map(chrs, function(p){
      if(p != target && target.isHit(p)){
        target.hitY(p);
      }
    });
  }


  chrs = initMap();
  effects = [];
  randSpecial(chrs);
  randMap(chrs);
  randChr(chrs);
  
  var WAIT = 50;
  function tick(){
    count ++;
    ctx.fillStyle = '#121';
    ctx.fillRect(0,0,SIZE,SIZE);
    del();
    delEffect();
    run();
    drawChrs();
    drawEffect();
    setTimeout(function(){tick()}, WAIT);
  }
  setTimeout(function(){tick()}, WAIT);

  // クリックすると発生する
  canv.bind('click',function(e){
    var x = e.offsetX;
    var y = e.offsetY;
    p = new ChrPiece(x, y, PSIZE/2, PSIZE);
    flag = hitCheck(p);
    if(!flag){
      p.ay = 1;
      chrs.push(p);
    }
 
  })
});
