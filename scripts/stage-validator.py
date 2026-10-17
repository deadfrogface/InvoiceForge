#!/usr/bin/env python3
"""Build-time acquisition; no Python or downloads at application runtime."""
import argparse, hashlib, pathlib, urllib.request, zipfile, io, json
SOURCES = {
 'validator.jar': ('https://github.com/itplr-kosit/validator/releases/download/v1.6.3/validator-1.6.3-standalone.jar','799e64befca97d4080e03608c80b85dd5a5ecc5f4ae4f35d1116ec2855b9a7c9'),
 'configuration.zip': ('https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/download/v2026-08-31/xrechnung-3.0.2-validator-configuration-2026-08-31.zip','2530cd107c414511c5d0462ec10f886910395abfca820db82e83d70bf01221a8'),
}
def download(url, expected):
 with urllib.request.urlopen(url,timeout=90) as response: data=response.read(150_000_001)
 if len(data)>150_000_000 or hashlib.sha256(data).hexdigest()!=expected: raise ValueError('Resource integrity check failed: '+url)
 return data

def stage(root):
 validator=root/'validator'; validator.mkdir(parents=True,exist_ok=True)
 for name,(url,digest) in SOURCES.items():
  data=download(url,digest)
  if name.endswith('.jar'): (validator/name).write_bytes(data)
  else:
   directory=validator/'configuration'; directory.mkdir(parents=True,exist_ok=True)
   with zipfile.ZipFile(io.BytesIO(data)) as archive:
    for entry in archive.infolist():
     name=pathlib.PurePosixPath(entry.filename.replace('\\','/'))
     if name.is_absolute() or '..' in name.parts or ':' in str(name): raise ValueError('Unsafe validator path')
     if entry.is_dir(): continue
     if entry.file_size>30_000_000 or (entry.external_attr>>16)&0o170000==0o120000: raise ValueError('Unsafe validator file')
     dest=directory.joinpath(*name.parts);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(archive.read(entry))
 (validator/'sources.json').write_text(json.dumps(SOURCES,indent=2))
 if not (validator/'configuration/scenarios.xml').is_file(): raise ValueError('Missing scenarios.xml')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--output',type=pathlib.Path,required=True);stage(p.parse_args().output)
