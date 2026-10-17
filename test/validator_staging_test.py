import importlib.util, pathlib, tempfile, unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('stage_validator',pathlib.Path(__file__).parents[1]/'scripts/stage-validator.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class Response:
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self,limit):return b'changed bytes'
class ValidatorStagingTests(unittest.TestCase):
 def test_changed_resource_is_rejected(self):
  with patch.object(module.urllib.request,'urlopen',return_value=Response()):
   with self.assertRaisesRegex(ValueError,'integrity'):module.download('https://github.com/example/resource','0'*64)
if __name__=='__main__':unittest.main()
