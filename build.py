"""Builds the app into this folder: one index.html with CSS, JS and font inlined, plus icons, manifest and service worker."""
import base64, shutil, subprocess, pathlib

root = pathlib.Path(__file__).parent
src, dist = root / "src", root


font = base64.b64encode((src / "unbounded.woff2").read_bytes()).decode()
html = (src / "index.html").read_text()
html = html.replace("/*FONT*/", "data:font/woff2;base64," + font)
html = html.replace("/*CSS*/", (src / "style.css").read_text())
html = html.replace("/*JS*/", (src / "app.js").read_text())
(dist / "index.html").write_text(html)

for name in ("manifest.json", "sw.js"):
    shutil.copy(src / name, dist / name)

for size in (180, 192, 512):
    subprocess.run(["rsvg-convert", "-w", str(size), "-h", str(size), str(src / "icon.svg"), "-o", str(dist / f"icon-{size}.png")], check=True)

print("built", sorted(p.name for p in dist.iterdir()))
