﻿# CMakeList.txt : Top-level CMake project file, do global configuration
# and include sub-projects here.
#
cmake_minimum_required(VERSION 3.10)
project(NetworkApp)

set(CMAKE_CXX_STANDARD 17)

add_executable(NetworkApp src/main.cpp src/network.cpp)

