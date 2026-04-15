export async function loadPage(path){
  const res = await fetch(path);
  const html = await res.text();

  document.getElementById("app").innerHTML = html;

  // load script page
  const script = document.createElement("script");
  script.type = "module";
  script.src = path.replace(".html", "/script.js");
  document.body.appendChild(script);
}