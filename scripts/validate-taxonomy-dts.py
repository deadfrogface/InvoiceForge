#!/usr/bin/env python3
"""Validate real GAAP/GCD DTS offline. This is not German filing/business-rule validation."""
import argparse
import json
import pathlib
import subprocess
import sys
import tempfile


def validate(entrypoint, log):
    result = subprocess.run([
        sys.executable, '-m', 'arelle.CntlrCmdLine', '--file', str(entrypoint),
        '--validate', '--internetConnectivity', 'offline', '--logFile', str(log),
    ], capture_output=True, text=True, timeout=120, check=False)
    if result.returncode != 0 or not log.exists():
        raise ValueError('XBRL validator failed: ' + result.stderr[-2000:])
    records = json.loads(log.read_text(encoding='utf-8'))['log']
    errors = [item for item in records if item.get('level') in ('error', 'critical', 'fatal')]
    if errors:
        raise ValueError('\n'.join(item.get('message', {}).get('text', str(item)) for item in errors))
    if not any('validated in ' in item.get('message', {}).get('text', '') for item in records):
        raise ValueError('No completed XBRL validation reported')
    return records


def main(root):
    with tempfile.TemporaryDirectory(prefix='invoiceforge-dts-') as temporary:
        work = pathlib.Path(temporary)
        # Negative control ensures errors are not mistaken for successful CLI exit codes.
        invalid = work / 'invalid.xsd'
        invalid.write_text('<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" targetNamespace="urn:test"><xs:element name="broken" type="xs:NotARealType"/></xs:schema>')
        try:
            validate(invalid, work / 'negative.json')
        except ValueError:
            print('Invalid schema correctly rejected')
        else:
            raise ValueError('Validator accepted the invalid-schema negative control')
        for version, date in [('6.9', '2025-04-01'), ('6.10', '2026-04-01')]:
            for module, suffix in [('de-gaap-ci', '-shell-fiscal'), ('de-gcd', '-shell')]:
                name = module + '-' + date
                entry = root / version / name / (name + suffix + '.xsd')
                if not entry.is_file():
                    raise ValueError('Required taxonomy entrypoint missing: ' + str(entry))
                validate(entry, work / (version + '-' + module + '.json'))
                print(version + ': ' + module + ' DTS validated offline')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1] / 'vendor/taxonomies')
    args = parser.parse_args()
    main(args.root)
