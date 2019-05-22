#!/usr/bin/env sh
set -ex

base_docker_compose() {
    docker-compose -f docker-compose.yml -f ./migration-tests/docker-compose.migration-tests.yml "$@"
}

pre_docker_compose() {
    base_docker_compose -f ./migration-tests/docker-compose.pre-migration-tests.yml "$@"
}

post_docker_compose() {
    base_docker_compose -f ./migration-tests/docker-compose.post-migration-tests.yml "$@"
}

cleanup() {
    # base_docker_compose logs full1
    base_docker_compose down -v
    exit ${exit_code:-1}
}

trap cleanup EXIT INT QUIT TERM


# build and start all services from base image
base_docker_compose up -d --build

echo "Running pre-migration tests"
pre_docker_compose build tests
pre_docker_compose run --rm tests
# pre_docker_compose up --build --exit-code-from tests tests
echo "Finished running pre-migration tests"

# stop and restart full1 with post config so it migrates, without affecting the other nodes
echo "Starting migration"
base_docker_compose stop full1
post_docker_compose up -d --build full1
echo "Migration complete"

echo "Now the node will take some time to sync up to the best block"
echo "Running post-migration tests"
post_docker_compose build tests
post_docker_compose run --rm tests
# post_docker_compose up --build --exit-code-from tests tests
echo "Finished running post-migration tests"

exit_code=$?
