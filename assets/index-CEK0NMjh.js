import{_ as o}from"./index-BVnG-nKw.js";async function i(t,a=!0){await t.addParticleUpdater("outModes",async e=>{const{OutOfCanvasUpdater:r}=await o(()=>import("./OutOfCanvasUpdater-CP5G3JMv.js"),__vite__mapDeps([0,1,2]));return new r(e)},a)}export{i as loadOutModesUpdater};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/OutOfCanvasUpdater-CP5G3JMv.js","assets/index-BVnG-nKw.js","assets/index-B1ZMKTyL.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
