"""CLI seam: explicit selection must never fall back to a paid model."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

RUNNER = Path(__file__).with_name('opencode-125.py')

class ProbeCLI(unittest.TestCase):
    def test_model_is_required(self):
        result = subprocess.run(['python3', str(RUNNER)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 2)
        self.assertIn('--model', result.stderr)

    def test_empty_discovery_is_inconclusive(self):
        with tempfile.TemporaryDirectory() as scratch:
            cli = Path(scratch) / 'opencode'
            cli.write_text("#!/usr/bin/env python3\nimport sys\nprint('opencode-go/claude-haiku-5-5' if sys.argv[1] == 'models' else '{\"data\": []}')\n")
            cli.chmod(0o755)
            result = subprocess.run(['python3', str(RUNNER), '--model', 'opencode-go/claude-haiku-5-5'], env={**os.environ, 'OPENCODE_125_CLI':str(cli)}, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('Discovery control failed', result.stderr)

    def test_discovery_activates_plugins_before_listing(self):
        with tempfile.TemporaryDirectory() as scratch:
            cli = Path(scratch) / 'opencode'
            cli.write_text('#!/usr/bin/env python3\nimport sys, time\nfrom pathlib import Path\nmarker=Path(__file__).with_name(\'activated\')\nif sys.argv[1]==\'models\': print(\'opencode-go/claude-haiku-5-5\')\nelif sys.argv[1]==\'serve\': time.sleep(120)\nelif \'/api/agent\' in sys.argv: marker.touch(); print(\'{"data": []}\')\nelif \'/api/skill\' in sys.argv:\n print(\'{"data": []}\')\n if not marker.exists(): sys.exit(3)\n')
            cli.chmod(0o755)
            result = subprocess.run(['python3', str(RUNNER), '--model', 'opencode-go/claude-haiku-5-5'], env={**os.environ, 'OPENCODE_125_CLI':str(cli)}, capture_output=True, text=True)
            self.assertTrue(cli.with_name('activated').exists(), result.stderr)
            root = Path(result.stdout.splitlines()[0])
            self.assertFalse((root/'gate-q1.stdout').exists())

    def test_selected_go_model_reaches_neutral_request(self):
        with tempfile.TemporaryDirectory() as scratch:
            cli = Path(scratch) / 'opencode'
            cli.write_text('''#!/usr/bin/env python3
import sys, json
if sys.argv[1] == 'models': print('opencode-go/claude-haiku-5-5')
elif sys.argv[1] == 'run':
 print(json.dumps({'type':'error','selected':sys.argv[sys.argv.index('--model')+1]}))
 sys.exit(1)
''')
            cli.chmod(0o755)
            result = subprocess.run(['python3', str(RUNNER), '--model', 'opencode-go/claude-haiku-5-5'], env={**os.environ, 'OPENCODE_125_CLI':str(cli)}, capture_output=True, text=True)
            root = Path(result.stdout.splitlines()[0])
            self.assertIn('opencode-go/claude-haiku-5-5', (root/'normal-control.stdout').read_text())
            self.assertFalse((root/'gate-q1.stdout').exists())
            self.assertNotEqual(result.returncode, 0)

if __name__ == '__main__': unittest.main()
