echo "Starting wiki sync"

if [ -f .env ]; then
	echo "Loading environment variables from .env file"
	eval $(egrep -v '^#' .env | xargs)
fi


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

# extract metadata and save it in a separate file
for FILE in $(find . -name '*.md'); do
	echo "Created meta data for file:" $FILE
	git log -1 --pretty=format:'%an@%cI' -- $FILE > $FILE.meta
done

cd ..
# clear the data directory
rm -rf $DATA_DIR/*

rm -rf tmp/.git
mv tmp/* $DATA_DIR 

rm -rf tmp

echo "Wiki sync complete"
