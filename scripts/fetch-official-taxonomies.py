#!/usr/bin/env python3
"""Stage official XBRL ZIPs at build time, with verified TLS and atomic output."""
import argparse
import hashlib
import html.parser
import io
import json
import pathlib
import re
import shutil
import ssl
import tempfile
import urllib.parse
import urllib.request
import zipfile

BASE = 'https://www.esteuer.de/download/'
SOURCES = {'6.9': 'taxonomie_20250618/', '6.10': 'taxonomie_20260615/'}
MAX_ARCHIVE = 150_000_000
MAX_EXPANDED = 300_000_000
MAX_ENTRY = 20_000_000
MAX_ENTRIES = 10000

class Links(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a' and dict(attrs).get('href'):
            self.urls.append(dict(attrs)['href'])

def trusted_url(url):
    parsed = urllib.parse.urlparse(url)
    if (parsed.scheme != 'https' or parsed.hostname != 'www.esteuer.de'
            or parsed.username or parsed.password or parsed.port not in (None, 443)):
        raise ValueError('Untrusted taxonomy URL: ' + url)
    return url

class OfficialRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        trusted_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def download(url, max_bytes=MAX_ARCHIVE, ca_file=None):
    trusted_url(url)
    # Optional additional CA bundle must be explicitly supplied. Verification stays enabled.
    context = ssl.create_default_context()
    if ca_file:
        context.load_verify_locations(cafile=ca_file)
    opener = urllib.request.build_opener(OfficialRedirect(), urllib.request.HTTPSHandler(context=context))
    request = urllib.request.Request(url, headers={'User-Agent': 'InvoiceForge-build/1.0'})
    with opener.open(request, timeout=30) as response:
        trusted_url(response.geturl())
        data = response.read(max_bytes + 1)
        if len(data) > max_bytes:
            raise ValueError('Official archive exceeds size limit')
        return data

def archive_links(version, page_html):
    page = urllib.parse.urljoin(BASE, SOURCES[version])
    links = Links()
    links.feed(page_html)
    # Do not mix preview, comparison, layout and Excel archives into the official DTS.
    pattern = re.compile(r'german-gaap-taxonomy-v' + re.escape(version) + r'-\d{4}-\d{2}-\d{2}-xbrl\.zip$')
    urls = sorted({urllib.parse.urljoin(page, href) for href in links.urls
                   if pattern.fullmatch(pathlib.PurePosixPath(urllib.parse.urlparse(href).path).name)})
    if len(urls) != 1:
        raise ValueError('Expected exactly one official non-preview XBRL archive')
    return [trusted_url(url) for url in urls]

def extract_archive(data, target):
    """Extract an already downloaded archive only into a fresh private staging directory."""
    seen = set()
    total = 0
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        if len(archive.infolist()) > MAX_ENTRIES:
            raise ValueError('Too many archive entries')
        for member in archive.infolist():
            raw = member.filename.replace('\\', '/')
            name = pathlib.PurePosixPath(raw)
            if (name.is_absolute() or '..' in name.parts or ':' in raw
                    or any(p in ('', '.') for p in raw.rstrip('/').split('/'))):
                raise ValueError('Unsafe archive path')
            kind = (member.external_attr >> 16) & 0o170000
            if kind not in (0, 0o100000, 0o040000):
                raise ValueError('Archive symlink or special file forbidden')
            if member.is_dir():
                continue
            key = str(name).casefold()
            if key in seen:
                raise ValueError('Duplicate archive path')
            seen.add(key)
            total += member.file_size
            if member.file_size > MAX_ENTRY or total > MAX_EXPANDED:
                raise ValueError('Expanded archive exceeds size limit')
            if name.suffix.lower() not in {'.xsd', '.xml', '.xbrl', '.xlink', '.txt', '.json'}:
                raise ValueError('Unexpected taxonomy file: ' + str(name))
            dest = target.joinpath(*name.parts)
            dest.parent.mkdir(parents=True, exist_ok=True)
            # ZipFile verifies CRC; size limits are checked before decompression.
            dest.write_bytes(archive.read(member))
    if not list(target.rglob('*.xsd')):
        raise ValueError('No XBRL schemas staged')
    return len(seen)

def stage(version, target, ca_file=None):
    page = urllib.parse.urljoin(BASE, SOURCES[version])
    urls = archive_links(version, download(page, 5_000_000, ca_file).decode('utf-8', 'replace'))
    target = pathlib.Path(target).absolute()
    if target.exists() or target.is_symlink():
        raise ValueError('Output already exists; refusing to replace an existing taxonomy')
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = pathlib.Path(tempfile.mkdtemp(prefix='.taxonomy-', dir=target.parent))
    try:
        data = download(urls[0], ca_file=ca_file)
        count = extract_archive(data, temporary)
        provenance = {'version': version, 'source': urls[0],
                      'archiveSha256': hashlib.sha256(data).hexdigest(), 'fileCount': count}
        (temporary / 'provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
        temporary.rename(target)
        print(f'Staged {count} taxonomy files for {version}')
    finally:
        if temporary.exists():
            shutil.rmtree(temporary)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--version', choices=SOURCES, required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--ca-file', help='Additional verified CA bundle; never disables TLS verification')
    args = parser.parse_args()
    stage(args.version, pathlib.Path(args.output), args.ca_file)
