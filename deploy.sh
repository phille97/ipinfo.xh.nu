#!/bin/bash

set -xe

rsync -av src/ root@chungus3.xh.nu:/opt/ipinfo-xh/html/
