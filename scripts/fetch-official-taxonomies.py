#!/usr/bin/env python3
"""Fetch official E-Bilanz XBRL taxonomy ZIPs at build time, never at end-user runtime."""
import argparse, hashlib, html.parser, io, json, pathlib, re, urllib.parse, urllib.request, zipfile
BASE="https://www.esteuer.de/download/"
SOURCES={"6.9":"taxonomie_20250618/","6.10":"taxonomie_20260615/"}
class Links(html.parser.HTMLParser):
 def __init__(self): super().__init__(); self.urls=[]
 def handle_starttag(self,tag,attrs):
  if tag=="a":
   url=dict(attrs).get("href","")
   if url: self.urls.append(url)
def download(url,max_bytes=150_000_000):
 with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"InvoiceForge-build/1.0"}),timeout=90) as r:
  if urllib.parse.urlparse(r.geturl()).hostname!="www.esteuer.de": raise ValueError("Untrusted redirect")
  data=r.read(max_bytes+1)
  if len(data)>max_bytes: raise ValueError("Official archive exceeds size limit")
  return data
def stage(version,target):
 page=urllib.parse.urljoin(BASE,SOURCES[version])
 links=Links();links.feed(download(page,5_000_000).decode("utf-8","replace"))
 candidates=[urllib.parse.urljoin(page,x) for x in links.urls if re.search(r"(?i)\.zip(?:\?.*)?$",x)]
 if not candidates: raise ValueError("No ZIP downloads found on official taxonomy directory")
 target.mkdir(parents=True,exist_ok=True)
 count=0
 for url in candidates:
  if urllib.parse.urlparse(url).hostname!="www.esteuer.de": raise ValueError("Untrusted taxonomy URL")
  data=download(url)
  with zipfile.ZipFile(io.BytesIO(data)) as archive:
   for member in archive.infolist():
    if member.is_dir(): continue
    name=pathlib.PurePosixPath(member.filename.replace("\\","/"))
    if name.is_absolute() or ".." in name.parts: raise ValueError("Unsafe archive path")
    if (member.external_attr>>16)&0o170000==0o120000: raise ValueError("Symlink forbidden")
    if member.file_size>20_000_000: raise ValueError("Oversized taxonomy entry")
    if not name.suffix.lower() in {".xsd",".xml",".xbrl",".xlink",".txt",".json"}: continue
    dest=target/pathlib.Path(urllib.parse.urlparse(url).path).stem/name
    dest.parent.mkdir(parents=True,exist_ok=True)
    content=archive.read(member)
    if dest.exists() and dest.read_bytes()!=content: raise ValueError("Duplicate path with different contents")
    dest.write_bytes(content);count+=1
 if not count or not list(target.rglob("*.xsd")): raise ValueError("No XBRL schemas staged")
 print(f"Staged {count} taxonomy files for {version}")
if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("--version",choices=SOURCES.keys(),required=True);p.add_argument("--output",required=True)
 args=p.parse_args();stage(args.version,pathlib.Path(args.output))
