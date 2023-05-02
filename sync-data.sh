echo "Starting wiki sync"

if [ "$GITHUB_PROJECT" == "" ]; then
				echo "Error: GIT_PROJECT is not set"
				exit 1;
fi

if [ "$DATA_DIR" == "" ]; then
				echo "Error: DATA_DIR is not set"
				exit 1;
fi

set -e

# clear and create new tmp directory
rm -rf tmp || true
mkdir tmp
cd tmp

# clone the repository
git clone --depth 1 https://github.com/$GITHUB_PROJECT.wiki.git .

cd ..
rm -rf tmp/.git
mv tmp/* $DATA_DIR 

rm -rf tmp

echo "Wiki sync complete"
