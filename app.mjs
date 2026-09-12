import { JumpCounter } from './counter.mjs';
const $ = id => document.getElementById(id);
const video=$('video'), canvas=$('overlay'), ctx=canvas.getContext('2d'), counter=new JumpCounter();
let model, stream, running=false, busy=false, facing='user', lastFrame=-1, raf, elapsed=0, since=0;
const status = text => $('status').textContent=text;
function pause() { if(running) elapsed+=performance.now()-since; running=false; $('start').textContent='Resume session'; counter.recalibrate(); }
function stopCamera() { pause(); cancelAnimationFrame(raf); stream?.getTracks().forEach(t=>t.stop()); stream=null; video.srcObject=null; ctx.clearRect(0,0,canvas.width,canvas.height); $('empty').style.display='flex'; $('start').disabled=true; $('flip').disabled=true; $('off').disabled=true; $('enable').disabled=false; $('badge').textContent='CAMERA OFF'; }
async function enableCamera() {
  if(busy) return; busy=true; $('enable').disabled=true; $('flip').disabled=true;
  try {
    if(!isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('Camera requires an HTTPS website (or localhost).');
    status('Allow camera access when your browser asks…');
    stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:640},height:{ideal:480},frameRate:{ideal:30}}});
    video.srcObject=stream; await video.play();
    $('empty').style.display='none'; video.style.transform=facing==='user'?'scaleX(-1)':''; canvas.style.transform=video.style.transform;
    status('Loading on-device pose tracker…');
    if(!model) {
      const { FilesetResolver, PoseLandmarker }=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs');
      const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
      model=await PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'},runningMode:'VIDEO',numPoses:1});
    }
    $('badge').textContent='CAMERA READY'; $('start').disabled=false; $('flip').disabled=false; $('off').disabled=false; lastFrame=-1;
    stream.getVideoTracks()[0].addEventListener('ended',()=>{stopCamera();status('Camera disconnected. Enable it to continue.');},{once:true});
    status('Ready. Start your session, then stand still.'); loop();
  } catch(e) { stopCamera(); status(e.name==='NotAllowedError'?'Camera access denied. Allow camera access in browser settings, then retry.':`Could not start: ${e.message}`); }
  finally {busy=false;}
}
function loop() {
  if(!stream) return;
  try {
    if(video.readyState>=2 && video.currentTime!==lastFrame) {
      lastFrame=video.currentTime;
      const now=performance.now(), result=model.detectForVideo(video,now), p=result.landmarks[0];
      canvas.width=video.videoWidth; canvas.height=video.videoHeight; ctx.clearRect(0,0,canvas.width,canvas.height);
      const ids=[0,11,12,23,24,27,28];
      const visible=p && ids.every(i=>p[i].visibility>.65 && p[i].x>.02 && p[i].x<.98 && p[i].y>.02 && p[i].y<.98);
      if(visible) {ctx.fillStyle='#ccf785'; for(const i of ids){ctx.beginPath();ctx.arc(p[i].x*canvas.width,p[i].y*canvas.height,5,0,Math.PI*2);ctx.fill();}}
      if(running) {
        if(!visible) { counter.recalibrate(); status('Tracking lost — keep your full body in view.'); }
        else {
          const threshold=[.022,.015,.009][Number($('sensitivity').value)-1];
          counter.update((p[23].y+p[24].y)/2,now,threshold);
          $('count').textContent=counter.count;
          status(counter.base===null?'Stand still for 2 seconds to calibrate…':'Tracking your jumps · keep the phone still');
          $('hint').textContent=counter.base===null?'Finding your baseline…':'You’re finding your rhythm.';
        }
      }
    }
  } catch(e) {stopCamera();status(`Tracker stopped: ${e.message}. Try enabling the camera again.`);return;}
  raf=requestAnimationFrame(loop);
}
$('enable').onclick=enableCamera;
$('start').onclick=()=>{if(running){pause();status('Paused. Resume whenever you’re ready.');}else{counter.recalibrate();running=true;since=performance.now();$('start').textContent='Pause session';}};
$('reset').onclick=()=>{pause();elapsed=0;counter.reset();$('count').textContent='0';$('start').textContent='Start session';$('hint').textContent='One jump at a time.';status(stream?'Count reset. Start a new session.':'Enable your camera to begin');};
$('off').onclick=()=>{stopCamera();status('Camera off. Your count is kept until you reset or close the page.');};
$('flip').onclick=async()=>{stopCamera();facing=facing==='user'?'environment':'user';await enableCamera();};
$('sensitivity').oninput=()=>{$('sensitivityValue').textContent=['Low','Medium','High'][Number($('sensitivity').value)-1];counter.recalibrate();};
setInterval(()=>{const seconds=Math.floor((elapsed+(running?performance.now()-since:0))/1000);$('timer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;$('pace').textContent=seconds?Math.round(counter.count/seconds*60):0;},250);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCamera();status('Camera stopped while the app was in the background. Enable it to continue.');}});
window.addEventListener('pagehide',stopCamera);
