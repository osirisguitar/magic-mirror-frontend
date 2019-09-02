#!/bin/bash

docker build -t osirisguitar/magicmirror:$1 .
docker push osirisguitar/magicmirror:$1
