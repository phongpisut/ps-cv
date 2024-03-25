import{_ as i}from"./index-BPSAVdRd.js";async function p(t,a=!0){await t.addParticleUpdater("opacity",async r=>{const{OpacityUpdater:e}=await i(()=>import("./OpacityUpdater-kZDu8Ret.js"),__vite__mapDeps([0,1,2]));return new e(r)},a)}export{p as loadOpacityUpdater};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/OpacityUpdater-kZDu8Ret.js","assets/index-BPSAVdRd.js","assets/index-B1ZMKTyL.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
