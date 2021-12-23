cmake_minimum_required(VERSION 3.0)
project(reMarkable.WebUI)

# Use digitalis.build changeversion or tag to modify the version
set(PROJECT_VERSION_MAJOR  0)
set(PROJECT_VERSION_MINOR  1)
set(PROJECT_VERSION_PATCH  0)
set(PROJECT_VERSION_STATUS develop)

set(COPYRIGHT              "2018, Fabien Pollet <polletfa@gmail.com>")

set(PACKAGES
)

set(TARGETS
)

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} ${CMAKE_CURRENT_SOURCE_DIR}/cmake)
include(BuildProject)
