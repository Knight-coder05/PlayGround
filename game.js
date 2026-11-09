import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const ui = {
  floor: $('floor-number'), floorName: $('floor-name'), level: $('level'), coins: $('coins'), hpText: $('hp-text'), hpFill: $('hp-fill'), xpText: $('xp-text'), xpFill: $('xp-fill'), objective: $('objective-text'), enemyCounter: $('enemy-counter'), toast: $('toast'), banner: $('floor-banner'), lift: $('interact-prompt'), controlsHint: $('controls-hint'), mobileControls: $('mobile-controls'), start: $('center-notice'), levelup: $('levelup-modal'), boonOptions: $('boon-options'), over: $('gameover-modal'), summary: $('run-summary'), clear: $('floor-clear')
};
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11131b);
scene.fog = new THREE.FogExp2(0x11131b, 0.027);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
$('viewport').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xb9c5e1, 0x33231c, 1.35));
const moon = new THREE.DirectionalLight(0xffdfb1, 2.4);
moon.position.set(-5, 12, 8); moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024); moon.shadow.camera.left = -14; moon.shadow.camera.right = 14; moon.shadow.camera.top = 14; moon.shadow.camera.bottom = -14;
scene.add(moon);
const warm = new THREE.PointLight(0xff8845, 26, 13, 2); warm.position.set(-7, 3.2, -2); scene.add(warm);
const warm2 = new THREE.PointLight(0xffa45c, 20, 12, 2); warm2.position.set(7, 3.2, 1); scene.add(warm2);
const floorLight = new THREE.PointLight(0x7794ff, 7, 14, 2); floorLight.position.set(0, 3.8, -8); scene.add(floorLight);

const mats = {
  stone: new THREE.MeshStandardMaterial({ color: 0x35343a, roughness: .92 }), darkStone: new THREE.MeshStandardMaterial({ color: 0x211f25, roughness: .92 }), tile: new THREE.MeshStandardMaterial({ color: 0x444149, roughness: .9 }), gold: new THREE.MeshStandardMaterial({ color: 0xd7a35d, metalness: .55, roughness: .34, emissive: 0x351b08 }), ember: new THREE.MeshStandardMaterial({ color: 0xff9a42, emissive: 0xff6122, emissiveIntensity: 3 }), player: new THREE.MeshStandardMaterial({ color: 0x344c62, roughness: .75 }), cloth: new THREE.MeshStandardMaterial({ color: 0xb64d3e, roughness: .72 }), skin: new THREE.MeshStandardMaterial({ color: 0xe4b48b, roughness: .75 }), leather: new THREE.MeshStandardMaterial({ color: 0x493227, roughness: .88 }), blade: new THREE.MeshStandardMaterial({ color: 0xd5d9df, metalness: .75, roughness: .24 }), enemy: new THREE.MeshStandardMaterial({ color: 0x62815b, roughness: .8 }), enemyDark: new THREE.MeshStandardMaterial({ color: 0x334a3c, roughness: .86 }), enemyEye: new THREE.MeshStandardMaterial({ color: 0xffcf70, emissive: 0xff9d24, emissiveIntensity: 2 })
};
const boxGeo = new THREE.BoxGeometry(1,1,1);
function box(parent, mat, pos, scale, cast = true) { const m = new THREE.Mesh(boxGeo, mat); m.position.set(...pos); m.scale.set(...scale); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; }
function sphere(parent, mat, pos, scale) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 12), mat); m.position.set(...pos); m.scale.set(...scale); m.castShadow = true; parent.add(m); return m; }
const room = new THREE.Group(); scene.add(room);

function buildRoom(floor) {
  while (room.children.length) { const c = room.children.pop(); c.geometry?.dispose(); }
  const tint = [0x444149,0x3e4148,0x484039,0x393e47,0x484044][(floor-1)%5];
  const floorMat = new THREE.MeshStandardMaterial({color:tint,roughness:.94});
  const slab = new THREE.Mesh(new THREE.BoxGeometry(22,.6,22),floorMat); slab.position.set(0,-.42,0); slab.receiveShadow=true; room.add(slab);
  for(let x=-10;x<=10;x+=2) for(let z=-10;z<=10;z+=2){
    const tile=new THREE.Mesh(boxGeo,((x+z)%4===0)?mats.darkStone:mats.tile);tile.position.set(x,-.1,z);tile.scale.set(1.94,.09,1.94);tile.receiveShadow=true;room.add(tile);
    if((x*3+z+floor)%17===0){const crack=new THREE.Mesh(boxGeo,new THREE.MeshStandardMaterial({color:0x211e21}));crack.position.set(x+.25,-.047,z);crack.scale.set(.62,.012,.035);crack.rotation.y=.5;room.add(crack);}
  }
  // Heavy perimeter walls and corner columns
  for (const [x,z,sx,sz] of [[0,-11,22,1],[0,11,22,1],[-11,0,1,22],[11,0,1,22]]) {
    box(room,mats.darkStone,[x,1.7,z],[sx,4,sz]);
    const innerZ = z < -5 ? z+0.54 : z > 5 ? z-.54 : z;
    const innerX = x < -5 ? x+.54 : x > 5 ? x-.54 : x;
    if(Math.abs(x)>5) for(let y=-.2;y<4;y+=1.2) box(room,mats.stone,[innerX,y,z],[.16,.08,22]);
    if(Math.abs(z)>5) for(let y=-.2;y<4;y+=1.2) box(room,mats.stone,[x,y,innerZ],[22,.08,.16]);
  }
  for(const x of [-9.7,9.7]) for(const z of [-9.7,9.7]){
    box(room,mats.stone,[x,1.65,z],[1.2,4.4,1.2]);box(room,mats.tile,[x,3.8,z],[1.5,.3,1.5]);
    const flame=new THREE.Mesh(new THREE.ConeGeometry(.22,.62,8),mats.ember);flame.position.set(x>0?x-.9:x+.9,2.1,z>0?z-.9:z+.9);room.add(flame);
  }
  // North lift dais, glowing runes, and arch
  box(room,mats.darkStone,[0,.15,-8.8],[3.3,.42,3.1]);box(room,mats.gold,[0,.38,-8.8],[2.5,.08,2.5],false);
  const portal=new THREE.Mesh(new THREE.TorusGeometry(1.08,.09,8,36),new THREE.MeshStandardMaterial({color:0x8e6cc5,emissive:0x4b2f80,emissiveIntensity:1.5,metalness:.4}));portal.position.set(0,1.7,-9.6);room.add(portal);
  const core=new THREE.Mesh(new THREE.CircleGeometry(.84,32),new THREE.MeshBasicMaterial({color:0x5d4a9a,transparent:true,opacity:.48,side:THREE.DoubleSide}));core.position.set(0,1.7,-9.55);room.add(core);
  for(const x of [-1.5,1.5]){box(room,mats.stone,[x,1.9,-9.5],[.3,3.8,.4]);box(room,mats.gold,[x,3.85,-9.5],[.5,.2,.6]);}
  const liftGlow=new THREE.PointLight(0x9775ff,5,8,2);liftGlow.position.set(0,2,-8.5);room.add(liftGlow);
  // Scattered broken masonry
  for(let i=0;i<10;i++){const a=i*2.4+floor;const rock=box(room,mats.darkStone,[Math.cos(a)*(6+((i*7)%3)),.12,Math.sin(a)*(6+((i*5)%3))],[.45+(.2*(i%2)),.22,.38]);rock.rotation.y=a*.45;}
}

const player = new THREE.Group(); scene.add(player);
const body = new THREE.Group(); player.add(body);
const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.34,.55,4,8),mats.player); torso.position.y=.95; torso.castShadow=true; body.add(torso);
const head=sphere(body,mats.skin,[0,1.65,0],[.26,.29,.26]);
const hood=new THREE.Mesh(new THREE.ConeGeometry(.3,.48,8),mats.cloth);hood.position.set(0,1.88,0);hood.rotation.x=.12;hood.castShadow=true;body.add(hood);
box(body,mats.cloth,[0,.92,-.27],[.53,.65,.13]).rotation.x=-.12;
const belt=box(body,mats.leather,[0,.72,0],[.62,.12,.58]);
const armL=new THREE.Group(),armR=new THREE.Group();armL.position.set(-.37,1.25,0);armR.position.set(.37,1.25,0);body.add(armL,armR);
const upper=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.38,3,6),mats.player);upper.position.y=-.2;upper.rotation.z=.12;armL.add(upper);
const upper2=upper.clone();armR.add(upper2);
const weapon=new THREE.Group();weapon.position.set(.02,-.4,.02);armR.add(weapon);
const blade=new THREE.Mesh(new THREE.BoxGeometry(.11,.1,.78),mats.blade);blade.position.set(0,-.12,.37);weapon.add(blade);
const hilt=box(weapon,mats.gold,[0,-.12,-.04],[.32,.08,.12],false);hilt.rotation.y=.2;
const pom=sphere(weapon,mats.gold,[0,-.12,-.14],[.1,.1,.1]);
player.position.set(0,0,3.8);

const enemies=[], drops=[], particles=[];
let floor=1, level=1, xp=0, xpNext=100, hp=100, maxHp=100, coins=0, damage=25, moveSpeed=4.2, attackCooldown=0, dashCooldown=0, dashTime=0, invuln=0, hitFlash=0, kills=0, running=false, paused=false, liftOpen=false, muted=false, attackAnim=0, toastTimer=0, lastTime=0, animTime=0, joystick={x:0,z:0}, pointerId=null;
const keys=new Set();
const names=['THE ASHEN GATE','THE SUNKEN VAULT','THE WIDOW’S HALL','THE CINDER CHOIR','THE DROWNED ARCH','THE LAST THRESHOLD'];
const FLOOR_TONES=[0x11131b,0x10151a,0x171219,0x10151c,0x181312];

function makeEnemy(boss=false){
  const g=new THREE.Group();const scale=boss?1.55:1;
  const skin=boss?new THREE.MeshStandardMaterial({color:0x87554c,roughness:.8}):mats.enemy;
  const dark=boss?new THREE.MeshStandardMaterial({color:0x422f35,roughness:.8}):mats.enemyDark;
  const torsoE=new THREE.Mesh(new THREE.CapsuleGeometry(.35*scale,.48*scale,3,7),dark);torsoE.position.y=.77*scale;torsoE.castShadow=true;g.add(torsoE);
  sphere(g,skin,[0,1.37*scale,0],[.3*scale,.32*scale,.27*scale]);
  const ears=new THREE.Mesh(new THREE.ConeGeometry(.14*scale,.42*scale,5),skin);ears.position.set(-.3*scale,1.42*scale,0);ears.rotation.z=.9;g.add(ears);const er=ears.clone();er.position.x=.3*scale;er.rotation.z=-.9;g.add(er);
  sphere(g,mats.enemyEye,[-.11*scale,1.4*scale,.23*scale],[.055*scale,.055*scale,.035*scale]);sphere(g,mats.enemyEye,[.11*scale,1.4*scale,.23*scale],[.055*scale,.055*scale,.035*scale]);
  for(const s of [-1,1]){const limb=new THREE.Mesh(new THREE.CapsuleGeometry(.105*scale,.4*scale,3,6),skin);limb.position.set(s*.39*scale,.77*scale,0);limb.rotation.z=-s*.18;g.add(limb);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.12*scale,.34*scale,3,6),dark);leg.position.set(s*.18*scale,.27*scale,0);g.add(leg);}
  if(boss){const crown=new THREE.Mesh(new THREE.ConeGeometry(.37,.55,5),mats.gold);crown.position.y=1.86*scale;g.add(crown);}
  scene.add(g);
  let angle=Math.random()*Math.PI*2, radius=5+Math.random()*3;
  g.position.set(Math.cos(angle)*radius,0,Math.sin(angle)*radius+.5);
  enemies.push({mesh:g,hp:boss?150+floor*14:45+floor*7,maxHp:boss?150+floor*14:45+floor*7,boss,attack:Math.random()*.7,walk:Math.random()*6,flash:0});
}
function spawnWave(){
  const boss=floor%3===0;const count=boss?1:Math.min(3+Math.floor((floor-1)/2),6);
  for(let i=0;i<count;i++)makeEnemy(boss);
  liftOpen=false;ui.lift.classList.remove('visible');ui.clear.classList.remove('show');
  ui.objective.textContent=boss?'Defeat the tower warden':'Clear the chamber';updateHUD();
}
function updateHUD(){
  ui.floor.textContent=String(floor).padStart(2,'0');ui.floorName.textContent=names[(floor-1)%names.length];ui.level.textContent=String(level).padStart(2,'0');ui.coins.textContent=coins;
  ui.hpText.textContent=`${Math.ceil(hp)} / ${maxHp}`;ui.hpFill.style.width=`${Math.max(0,hp/maxHp*100)}%`;ui.xpText.textContent=`${xp} / ${xpNext}`;ui.xpFill.style.width=`${xp/xpNext*100}%`;
  const remaining=enemies.length+(liftOpen?0:0);ui.enemyCounter.innerHTML=`${remaining} <small>${liftOpen?'LIFT OPEN':'REMAIN'}</small>`;
}
function showToast(message){ui.toast.textContent=message;ui.toast.classList.add('show');toastTimer=2.1;}
function sound(freq=420,duration=.08,type='sine',volume=.06){if(muted)return;try{const ctx=sound.ctx||(sound.ctx=new AudioContext());const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration);}catch{}}
function emit(pos,color=0xe6a45d,n=8){for(let i=0;i<n;i++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.045+Math.random()*.055,6,6),new THREE.MeshBasicMaterial({color,transparent:true}));mesh.position.copy(pos);scene.add(mesh);particles.push({mesh,vel:new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*3),life:.55+Math.random()*.45});}}
function dropLoot(pos){const group=new THREE.Group();const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.18,0),mats.gold);gem.position.y=.35;gem.castShadow=true;group.add(gem);const glow=new THREE.PointLight(0xffbb60,1.3,2);glow.position.y=.5;group.add(glow);group.position.copy(pos);scene.add(group);drops.push({mesh:group,kind:Math.random()<.23?'potion':'coin',age:0});}
function gainXP(n){xp+=n;while(xp>=xpNext){xp-=xpNext;level++;xpNext=Math.floor(xpNext*1.35);paused=true;showBoons();sound(660,.3,'sine',.09);}updateHUD();}
function showBoons(){ui.boonOptions.innerHTML='';const choices=[{icon:'♥',name:'Ironheart',desc:'+35 maximum vitality',take:()=>{maxHp+=35;hp=Math.min(maxHp,hp+35)}},{icon:'⚔',name:'Keen edge',desc:'+9 weapon damage',take:()=>damage+=9},{icon:'➤',name:'Fleetfoot',desc:'+0.7 movement speed',take:()=>moveSpeed+=.7}].sort(()=>Math.random()-.5);for(const b of choices){const button=document.createElement('button');button.className='boon';button.innerHTML=`<span class="boon-icon">${b.icon}</span><strong>${b.name}</strong><small>${b.desc}</small>`;button.onclick=()=>{b.take();paused=false;ui.levelup.classList.add('hidden');updateHUD();showToast(`${b.name} acquired`);};ui.boonOptions.appendChild(button);}ui.levelup.classList.remove('hidden');}
function killEnemy(e){const i=enemies.indexOf(e);if(i<0)return;enemies.splice(i,1);const p=e.mesh.position.clone();emit(p.clone().add(new THREE.Vector3(0,1,0)),e.boss?0xe89c56:0xb8c973,e.boss?24:12);scene.remove(e.mesh);dropLoot(p);kills++;gainXP(e.boss?90:35);coins+=e.boss?35:8;updateHUD();sound(e.boss?160:230,.12,'triangle',.07);if(enemies.length===0)clearFloor();}
function clearFloor(){liftOpen=true;ui.objective.textContent='The lift is waiting';ui.enemyCounter.innerHTML='↑ <small>LIFT OPEN</small>';ui.clear.classList.add('show');ui.clear.classList.remove('show');requestAnimationFrame(()=>ui.clear.classList.add('show'));setTimeout(()=>ui.clear.classList.remove('show'),2100);showToast('The tower yields. Find the lift.');sound(550,.35,'sine',.06);}
function attack(){if(!running||paused||attackCooldown>0)return;attackCooldown=.48;attackAnim=.28;sound(180,.1,'sawtooth',.045);
  let target=null,best=3.35;for(const e of enemies){const d=player.position.distanceTo(e.mesh.position);if(d<best){best=d;target=e;}}
  if(target){const dir=new THREE.Vector3().subVectors(target.mesh.position,player.position);dir.y=0;if(dir.lengthSq()>.01){player.rotation.y=Math.atan2(dir.x,dir.z);}
    target.hp-=damage;target.flash=.12;target.mesh.position.add(dir.normalize().multiplyScalar(.47));emit(target.mesh.position.clone().add(new THREE.Vector3(0,1,0)),0xffd18a,6);if(target.hp<=0)killEnemy(target);}
}
function dash(){if(!running||paused||dashCooldown>0)return;dashCooldown=1.15;dashTime=.19;invuln=.32;const d=moveVector();if(d.lengthSq()<.05)d.set(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));d.normalize();player.userData.dash=d;emit(player.position.clone().add(new THREE.Vector3(0,.8,0)),0x91a9c5,7);sound(270,.13,'triangle',.04);}
function moveVector(){let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x;let z=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+joystick.z;const v=new THREE.Vector3(x,0,z);if(v.length()>1)v.normalize();return v;}
function ascend(){if(!liftOpen||!running)return;floor++;scene.background.setHex(FLOOR_TONES[(floor-1)%FLOOR_TONES.length]);scene.fog.color.setHex(FLOOR_TONES[(floor-1)%FLOOR_TONES.length]);hp=Math.min(maxHp,hp+16);player.position.set(0,0,3.8);player.rotation.y=0;buildRoom(floor);spawnWave();ui.banner.innerHTML=`<span>ASCENSION ${String(floor).padStart(2,'0')}</span><strong>${names[(floor-1)%names.length]}</strong>`;ui.banner.classList.add('show');setTimeout(()=>ui.banner.classList.remove('show'),2100);showToast('A little warmth returns. +16 vitality');updateHUD();}
function gameOver(){running=false;ui.summary.textContent=`You reached floor ${floor}, earned ${coins} crowns, and defeated ${kills} creatures.`;ui.over.classList.remove('hidden');}
function startGame(){ui.start.classList.add('hidden');ui.over.classList.add('hidden');ui.levelup.classList.add('hidden');floor=1;level=1;xp=0;xpNext=100;hp=maxHp=100;coins=0;damage=25;moveSpeed=4.2;kills=0;running=true;paused=false;player.position.set(0,0,3.8);player.rotation.y=0;for(const e of enemies)scene.remove(e.mesh);enemies.length=0;for(const d of drops)scene.remove(d.mesh);drops.length=0;buildRoom(floor);spawnWave();ui.controlsHint.style.display=matchMedia('(pointer:coarse)').matches?'none':'';ui.mobileControls.style.display=matchMedia('(pointer:coarse)').matches?'flex':'';updateHUD();showToast('Find the enemies. The lift opens when they fall.');}

buildRoom(floor);spawnWave();running=false;

// Keyboard and accessible pointer controls
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keys.add(k);if(k===' '||k==='j')attack();if(k==='shift'||k==='k')dash();if(k==='e'||k==='enter'){if(liftOpen)ascend();}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
$('begin-button').addEventListener('click',startGame);$('retry-button').addEventListener('click',startGame);$('attack-btn').addEventListener('pointerdown',e=>{e.preventDefault();attack();});$('dodge-btn').addEventListener('pointerdown',e=>{e.preventDefault();dash();});$('sound-button').addEventListener('click',()=>{muted=!muted;$('sound-button').innerHTML=muted?'♫ <span>SOUND OFF</span>':'♫ <span>SOUND ON</span>';if(!muted)sound(440,.1);});
const joy=$('joystick'),knob=$('joy-knob');
function joyMove(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.34,len=Math.hypot(dx,dy),scale=len>max?max/len:1;const x=dx*scale,y=dy*scale;knob.style.left=`calc(50% + ${x}px)`;knob.style.top=`calc(50% + ${y}px)`;joystick.x=x/max;joystick.z=y/max;}
joy.addEventListener('pointerdown',e=>{e.preventDefault();pointerId=e.pointerId;joy.setPointerCapture(pointerId);joyMove(e);});joy.addEventListener('pointermove',e=>{if(pointerId===e.pointerId)joyMove(e);});const joyEnd=e=>{if(pointerId===e.pointerId){pointerId=null;joystick.x=joystick.z=0;knob.style.left='50%';knob.style.top='50%';}};joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
ui.lift.addEventListener('pointerdown',e=>{e.preventDefault();ascend();});

function update(dt){animTime+=dt;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show');}attackCooldown=Math.max(0,attackCooldown-dt);dashCooldown=Math.max(0,dashCooldown-dt);dashTime=Math.max(0,dashTime-dt);invuln=Math.max(0,invuln-dt);attackAnim=Math.max(0,attackAnim-dt);
  if(running&&!paused){const v=moveVector();if(dashTime>0)v.copy(player.userData.dash);if(v.lengthSq()>.002){player.position.x+=v.x*moveSpeed*(dashTime>0?3.5:1)*dt;player.position.z+=v.z*moveSpeed*(dashTime>0?3.5:1)*dt;if(dashTime<=0)player.rotation.y=Math.atan2(v.x,v.z);}
    player.position.x=THREE.MathUtils.clamp(player.position.x,-9.25,9.25);player.position.z=THREE.MathUtils.clamp(player.position.z,-9.2,9.4);
    body.position.y=v.lengthSq()>.002?Math.abs(Math.sin(animTime*11))*.06:0;body.rotation.z=v.lengthSq()>.002?Math.sin(animTime*5)*.035:0;armL.rotation.x=v.lengthSq()>.002?Math.sin(animTime*11)*.24:0;armR.rotation.x=attackAnim>0?-Math.sin(attackAnim/.28*Math.PI)*1.45:(v.lengthSq()>.002?Math.sin(animTime*11+Math.PI)*.24:0);
    weapon.rotation.x=attackAnim>0?-Math.sin(attackAnim/.28*Math.PI)*1.7:0;
    for(const e of [...enemies]){e.walk+=dt*5;const diff=new THREE.Vector3().subVectors(player.position,e.mesh.position);diff.y=0;const dist=diff.length();if(dist>1.45){diff.normalize();e.mesh.position.addScaledVector(diff,dt*(e.boss?1.2:1.55));e.mesh.rotation.y=Math.atan2(diff.x,diff.z);e.mesh.position.y=Math.abs(Math.sin(e.walk))*.035;}else{e.attack-=dt;if(e.attack<=0){e.attack=e.boss?1.05:1.3;if(invuln<=0){hp-=e.boss?14:8;invuln=.45;hitFlash=.2;emit(player.position.clone().add(new THREE.Vector3(0,1,0)),0xe56c5c,8);sound(90,.13,'sawtooth',.05);if(hp<=0){hp=0;updateHUD();gameOver();}}}}
      if(e.flash>0){e.flash-=dt;e.mesh.traverse(o=>{if(o.isMesh)o.material.emissive?.setHex(0x6a2616);});}else e.mesh.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissive.setHex(0x000000);});}
    for(const d of [...drops]){d.age+=dt;d.mesh.rotation.y+=dt*1.3;d.mesh.position.y=.12+Math.sin(d.age*3)*.1;const dist=player.position.distanceTo(d.mesh.position);if(dist<1.15){if(d.kind==='potion'){hp=Math.min(maxHp,hp+28);showToast('Restored vitality +28');sound(520,.18);}else{coins+=4;gainXP(8);sound(580,.06,'sine',.025);}scene.remove(d.mesh);drops.splice(drops.indexOf(d),1);updateHUD();}}
    const liftDist=Math.hypot(player.position.x,player.position.z+8.8);if(liftOpen&&liftDist<2.1){ui.lift.classList.add('visible');}else ui.lift.classList.remove('visible');
  }
  for(const p of [...particles]){p.life-=dt;p.mesh.position.addScaledVector(p.vel,dt);p.vel.y-=5*dt;p.mesh.material.opacity=Math.max(0,p.life);if(p.life<=0){scene.remove(p.mesh);particles.splice(particles.indexOf(p),1);}}
  const desired=new THREE.Vector3(player.position.x,player.position.y+10.2,player.position.z+12.8);camera.position.lerp(desired,1-Math.exp(-dt*3));camera.lookAt(player.position.x,0.3,player.position.z-1.1);
  // Camera-relative lift activation prompt remains close to the dais.
  warm.intensity=23+Math.sin(animTime*4)*3;warm2.intensity=18+Math.sin(animTime*3+2)*3;
}
function frame(t){requestAnimationFrame(frame);const dt=Math.min((t-lastTime)/1000||0,.04);lastTime=t;update(dt);renderer.render(scene,camera);}
requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));});
