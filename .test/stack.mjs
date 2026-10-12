/* Comprueba que dos bloques consecutivos del documento no se solapan (con lazy-load
   y revelados, el stitching de capturas puede engañar: aquí se mide el DOM real). */
import puppeteer from "puppeteer";
process.env.LD_LIBRARY_PATH="/tmp/al2023lib/lib:/home/user/.local/chromelibs/usr/lib/x86_64-linux-gnu:"+(process.env.LD_LIBRARY_PATH||"");
import fs from "node:fs";
const EXE = process.env.ZENQA_CHROME || ["/tmp/chromium", "/home/user/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome"].find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
const b=await puppeteer.launch({executablePath:EXE,args:["--no-sandbox","--disable-dev-shm-usage"]});
for (const [w,h] of [[390,844],[1440,900]]) {
  const p=await b.newPage(); await p.setViewport({width:w,height:h});
  for (const f of ["index.html","matcha.html","productos.html","recetas.html","nosotros.html"]) {
    await p.goto("http://127.0.0.1:8080/"+f,{waitUntil:"networkidle0"});
    await p.evaluate(async()=>{document.documentElement.style.scrollBehavior="auto";
      for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}
      scrollTo(0,0);
      // forzar que todas las imágenes hayan terminado
      await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;})));
      await new Promise(r=>setTimeout(r,300));});
    const out=await p.evaluate(()=>{
      const secs=[...document.querySelectorAll("main > *")];
      const bad=[];
      for(let i=0;i<secs.length-1;i++){
        const a=secs[i].getBoundingClientRect(), c=secs[i+1].getBoundingClientRect();
        const ov=Math.round(a.bottom+scrollY - (c.top+scrollY));
        if(ov>1) bad.push(`${secs[i].tagName}.${String(secs[i].className).slice(0,18)} pisa a ${secs[i+1].tagName}.${String(secs[i+1].className).slice(0,18)} por ${ov}px`);
      }
      // y solapamiento entre cualquier .buy y el bloque siguiente
      const buys=[...document.querySelectorAll(".buy")];
      for(const bu of buys){
        const r=bu.getBoundingClientRect();
        for(const el of document.querySelectorAll("main h2, main .tri__b, main .pgrid")){
          const q=el.getBoundingClientRect();
          if(q.top+scrollY < r.bottom+scrollY-1 && q.bottom+scrollY > r.top+scrollY+1 && Math.abs(q.left-r.left)<600 && q.width>0 && r.width>0 && !(q.top>=r.bottom-1)) bad.push("botones pisan "+el.tagName+"."+String(el.className).slice(0,14)+" por "+Math.round(r.bottom-q.top)+"px");
        }
      }
      return {bad: [...new Set(bad)].slice(0,6), n: secs.length};
    });
    console.log(`${w}×${h} ${f.padEnd(14)} ${out.n} bloques · ` + (out.bad.length?"SOLAPE:\n   - "+out.bad.join("\n   - "):"sin solapes"));
  }
  await p.close();
}
await b.close();
