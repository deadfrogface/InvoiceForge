import importlib.util
import io
import pathlib
import tempfile
import unittest
from unittest.mock import patch
import zipfile

spec = importlib.util.spec_from_file_location('fetch', pathlib.Path(__file__).parents[1] / 'scripts/fetch-official-taxonomies.py')
fetch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fetch)

def archive(entries):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w') as z:
        for name, content in entries:
            z.writestr(name, content)
    return stream.getvalue()

class TaxonomyFetchTests(unittest.TestCase):
    def test_only_official_version_archive_is_selected(self):
        html = ''.join(f'<a href="{name}">file</a>' for name in [
            'german-gaap-taxonomy-v6.9-2025-04-01-xbrl.zip',
            'preview.zip', 'comparison.zip', 'german-gaap-taxonomy-v6.10-2026-04-01-xbrl.zip'])
        self.assertEqual(len(fetch.archive_links('6.9', html)), 1)
        self.assertIn('v6.9-', fetch.archive_links('6.9', html)[0])
        with self.assertRaises(ValueError):
            fetch.archive_links('6.10', '<a href="preview.zip">preview</a>')
    def test_rejects_untrusted_url_before_network(self):
        for url in ['http://www.esteuer.de/x', 'https://evil.invalid/x', 'https://user@www.esteuer.de/x']:
            with self.assertRaises(ValueError):
                fetch.download(url)
    def test_valid_schema_is_extracted(self):
        with tempfile.TemporaryDirectory() as root:
            target = pathlib.Path(root)
            self.assertEqual(fetch.extract_archive(archive([('gaap/a.xsd', '<schema/>')]), target), 1)
            self.assertEqual((target / 'gaap/a.xsd').read_text(), '<schema/>')
    def test_rejects_traversal_duplicates_special_and_oversize(self):
        for entries in [[('../out.xsd', 'x')], [('C:/out.xsd', 'x')], [('a.xsd','x'), ('A.xsd','y')], [('payload.exe','x')]]:
            with tempfile.TemporaryDirectory() as root, self.assertRaises(ValueError):
                fetch.extract_archive(archive(entries), pathlib.Path(root))
        link = zipfile.ZipInfo('link.xsd'); link.create_system = 3; link.external_attr = 0o120777 << 16
        with tempfile.TemporaryDirectory() as root, self.assertRaises(ValueError):
            fetch.extract_archive(archive([(link, 'outside')]), pathlib.Path(root))
        with tempfile.TemporaryDirectory() as root, patch.object(fetch, 'MAX_EXPANDED', 1), self.assertRaises(ValueError):
            fetch.extract_archive(archive([('a.xsd', 'too large')]), pathlib.Path(root))
    def test_failed_staging_leaves_no_output(self):
        with tempfile.TemporaryDirectory() as root:
            target = pathlib.Path(root) / '6.9'
            page = b'<a href="german-gaap-taxonomy-v6.9-2025-04-01-xbrl.zip">x</a>'
            with patch.object(fetch, 'download', side_effect=[page, b'not a ZIP']):
                with self.assertRaises(zipfile.BadZipFile): fetch.stage('6.9', target)
            self.assertFalse(target.exists())
            self.assertEqual(list(pathlib.Path(root).iterdir()), [])
    def test_success_records_archive_hash_and_refuses_overwrite(self):
        with tempfile.TemporaryDirectory() as root:
            target = pathlib.Path(root) / '6.9'
            page = b'<a href="german-gaap-taxonomy-v6.9-2025-04-01-xbrl.zip">x</a>'
            data = archive([('a.xsd', '<schema/>')])
            with patch.object(fetch, 'download', side_effect=[page, data]): fetch.stage('6.9', target)
            self.assertIn(fetch.hashlib.sha256(data).hexdigest(), (target / 'provenance.json').read_text())
            with patch.object(fetch, 'download', return_value=page), self.assertRaises(ValueError): fetch.stage('6.9', target)

    def test_publisher_package_extracts_all_xbrl_and_preserves_disclaimer(self):
        prefix = 'german-gaap-taxonomy-test'
        data = archive([(prefix+'/xbrl/gaap/a.xsd', '<schema/>'),
                        (prefix+'/xbrl/gcd/gcd.xml', '<linkbase/>'),
                        (prefix+'/disclaimer/XBRL-de_Disclaimer.pdf', b'%PDF-license'),
                        (prefix+'/excel/visual.xlsx', b'not runtime data')])
        publisher = {'url':'https://www.xbrl.de/test.zip', 'root':prefix,
                     'sha256':fetch.hashlib.sha256(data).hexdigest()}
        with tempfile.TemporaryDirectory() as root, patch.dict(fetch.PUBLISHER, {'6.9':publisher}):
            target=pathlib.Path(root)/'6.9'
            with patch.object(fetch, 'download', return_value=data):
                fetch.stage('6.9', target, source='publisher')
            self.assertTrue((target/'gaap/a.xsd').exists())
            self.assertTrue((target/'gcd/gcd.xml').exists())
            self.assertTrue((target/'XBRL-de_Disclaimer.pdf').exists())
            self.assertFalse((target/'excel').exists())
    def test_publisher_archive_must_match_pinned_hash(self):
        with tempfile.TemporaryDirectory() as root, patch.object(fetch, 'download', return_value=b'changed archive'):
            target=pathlib.Path(root)/'6.9'
            with self.assertRaisesRegex(ValueError, 'SHA-256 mismatch'):
                fetch.stage('6.9', target, source='publisher')
            self.assertFalse(target.exists())

if __name__ == '__main__': unittest.main()
