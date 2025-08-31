#!/bin/bash

export GIT_REPOSITORY__URL="$GIT_REPOSITORY__URL"


# Clone the repo (default branch)
git clone "$GIT_REPOSITORY__URL" /home/appi/output

# Checkout branch if specified
if [ -n "$GIT_BRANCH" ]; then
	cd /home/appi/output
	git fetch origin "$GIT_BRANCH"
	git checkout "$GIT_BRANCH"
	cd /home/appi
fi

# Checkout commit if specified
if [ -n "$GIT_COMMIT" ]; then
	cd /home/appi/output
	git checkout "$GIT_COMMIT"
	cd /home/appi
fi

exec node script.js