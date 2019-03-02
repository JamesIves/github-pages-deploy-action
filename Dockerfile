FROM node:10

LABEL "com.github.actions.name"="Deploy to Github Pages"
LABEL "com.github.actions.description"="Runs an optional build command and then pushes the branch to gh-pages."
LABEL "com.github.actions.icon"="github"
LABEL "com.github.actions.color"="#192022"

LABEL "repository"="http://github.com/JamesIves/gh-pages-github-action"
LABEL "homepage"="http://github.com/JamesIves/gh-pages-gh-action"
LABEL "maintainer"="James Ives <iam@jamesiv.es>"

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
