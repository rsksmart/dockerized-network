#!/usr/bin/env sh
set -ex

base_docker_compose() {
    docker-compose -f docker-compose.yml "$@"
}

tests_docker_compose() {
    base_docker_compose -f ./wasabi-opcodes/docker-compose.yml "$@"
}

cleanup() {
    # base_docker_compose logs miner
    base_docker_compose down -v
    exit ${exit_code:-1}
}

trap cleanup EXIT INT QUIT TERM


# build and start all services from base image
base_docker_compose up -d --build

echo "Running tests"
tests_docker_compose build tests
tests_docker_compose run --rm tests
echo "Finished running tests"

exit_code=$?
