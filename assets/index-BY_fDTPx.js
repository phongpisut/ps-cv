import{_ as o}from"./index-DYu7F8jh.js";async function i(t,a=!0){await t.addParticleUpdater("outModes",async e=>{const{OutOfCanvasUpdater:r}=await o(()=>import("./OutOfCanvasUpdater-U0wLkQL0.js"),__vite__mapDeps([0,1,2]));return new r(e)},a)}export{i as loadOutModesUpdater};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/OutOfCanvasUpdater-U0wLkQL0.js","assets/index-DYu7F8jh.js","assets/index-CQCcdimo.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
