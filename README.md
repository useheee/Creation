# Creation — Skip Studio

Mobile-first camera jump counter. Static HTML/CSS/JavaScript, no build step, account, backend or API key.

## Run

Serve this directory with a static server (for example `python3 -m http.server 8000`) and open localhost:8000 on that computer. Mobile camera access needs an HTTPS deployment; a phone visiting an HTTP LAN address will not work.

## Publish with GitHub Pages

In the repository: Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save. After deployment, the expected address is https://useheee.github.io/Creation/ . This repository does not automatically enable Pages.

## Use

Enable camera, grant permission, position phone 2–3 metres away, keep your entire body visible, start session, stand still for two seconds, then skip. Pause/resume, reset, switch camera or adjust sensitivity. Camera stops on backgrounding. Session counts live in memory only and disappear on reload.

## Privacy and limitations

MediaPipe Tasks Vision 0.10.22 and the pose model download from jsDelivr and Google. Frames are processed locally, not recorded or uploaded. No analytics. Downloads require internet. Source code is public.

This beta estimates complete upward-and-downward hip movement cycles. It does NOT detect the rope or distinguish successful rope clearance, double-unders, walking, squats or other bouncing. Best for regular two-foot skipping with one person and a stationary camera. Accuracy has not been validated on real skipping footage or physical phones. Performance varies by device; synchronous model inference may affect frame rate.

## Tests

`node counter.test.mjs`

Manual release checks: iPhone Safari and Android Chrome over HTTPS; camera allow/deny; CDN failure; flip; background/resume; full-body loss; count 50 regular jumps against a manual count; idle/squats false positives. These checks require a physical device.

## Development

Keep secrets and camera footage out of Git. Commit and push completed changes to this repository; local file changes alone are not a GitHub backup.
