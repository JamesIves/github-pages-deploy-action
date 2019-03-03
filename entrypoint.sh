#!/bin/sh -l
if [ -z "$BRANCH" ]
then
  echo "You must provide the action with a branch name it should deploy to, for example gh-pages or docs."
  exit 1
fi

if [ -z "$FOLDER" ]
then
  echo "You must provide the action with the folder name in the repository where your compiled page lives."
  exit 1
fi

if [ -z "$ACCESS_TOKEN" ]
then
  echo "You must provide the action with a GitHub Personal Access Token secret in order to deploy."
  exit 1
fi

if [[ "$FOLDER" == "/" ]]; then
  FOLDER=$GITHUB_WORKSPACE
else


## Initializes Variables
REPOSITORY_PATH="https://${ACCESS_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" && \

# Installs Git.
apt-get update && \
apt-get install -y git && \

# Re-directs to the the Github workspace.
cd $GITHUB_WORKSPACE && \

# Configures Git and checks out the base branch.
git init && \
git config --global user.email "${COMMIT_EMAIL:-GITHUB_ACTOR@users.noreply.github.com}" && \
git config --global user.name "${COMMIT_NAME:-GITHUB_ACTOR}" && \
git checkout "${BASE_BRANCH:-master}" && \

# Builds the project if applicable.
echo "Running build scripts... $BUILD_SCRIPT"
eval "$BUILD_SCRIPT"

# Commits the data to Github.
git add -f $FOLDER && \
git commit -m "Deploying to ${FOLDER} - $(date +"%T")" && \
git push $REPOSITORY_PATH `git subtree split --prefix $FOLDER master`:$BRANCH --force 

