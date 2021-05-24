import json
from setuptools import setup
from pathlib import Path
from itertools import chain


with open('package.json') as f:
    package = json.load(f)

package_name = package["name"].replace(" ", "_").replace("-", "_")
base = Path(package_name)

files = [f"{package_name}/{f.name}" for f in chain(base.glob('*.js'), base.glob('*.json'), base.glob('*.map'))]

setup(
    name=package_name,
    version=package["version"],
    author=package['author'],
    author_email="sam@sgratzl.com",
    url=package['homepage'],
    packages=[package_name],
    data_files=[
          (package_name, files),
          ('', ['package.json']),
    ],
    license=package['license'],
    description=package.get('description', package_name),
    install_requires=[],
    classifiers = [
        'Framework :: Dash',
    ],
)
