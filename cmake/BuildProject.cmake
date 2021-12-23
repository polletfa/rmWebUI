# Find includes in corresponding build directories
set(CMAKE_INCLUDE_CURRENT_DIR ON)

# Install prefix
set(CMAKE_INSTALL_PREFIX ${PROJECT_SOURCE_DIR}/_install)

# Set C++ standard to C++11
if(CMAKE_COMPILER_IS_GNUCXX)
  SET(CMAKE_CXX_FLAGS "-std=c++11")
endif()

# Copyright
add_definitions(-DCOPYRIGHT="${COPYRIGHT}")

# System information
add_definitions(-DSYSTEM="${CMAKE_SYSTEM}"
                -DPROCESSOR="${CMAKE_SYSTEM_PROCESSOR}")

# Debug/Release
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -Wall -g -D_DEBUG")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -Wall -DNDEBUG")

# Packages
foreach(pkg ${PACKAGES})
  find_package(${pkg} REQUIRED)
endforeach()

# Subdirectories
foreach(dir ${TARGETS})
  add_subdirectory(${dir})
endforeach()
