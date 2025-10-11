#!/usr/bin/env bash
# uruchamia azurite i funkcje (zakłada, że masz azurite i func zainstalowane)

# start azurite in background (lokalny storage)
azurite --silent --location ./azurite_db --debug ./azurite_debug.log &

# start functions host
cd functions
# activate venv manually if chcesz
func start
