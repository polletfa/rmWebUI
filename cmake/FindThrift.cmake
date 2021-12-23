# - Find Thrift (a cross platform RPC lib/tool)
# Once done this will define
#
#  THRIFT_ROOT - Set this variable to the root installation of Thrift
#
# Variables defined by this module:
#
#  Thrift_FOUND - system has the Thrift library
#  Thrift_NB_FOUND - system has the Thrift non-blocking library
#  Thrift_VERSION - version number of the Thrift libraries that have been found
#  Thrift_INCLUDE_DIR - the Thrift include directory
#  Thrift_LIBRARY - The libraries needed to use Thrift
#  Thrift_LIB
#  Thrift_NB_LIB

# If THRIFT_ROOT was defined in the environment, use it.
if (NOT THRIFT_ROOT AND NOT $ENV{THRIFT_ROOT} STREQUAL "")
  set(THRIFT_ROOT $ENV{THRIFT_ROOT})
endif (NOT THRIFT_ROOT AND NOT $ENV{THRIFT_ROOT} STREQUAL "")

# find header and libraries
find_path(Thrift_INCLUDE_DIR NAMES Thrift.h HINTS ${THRIFT_ROOT}/include PATH_SUFFIXES thrift)
find_library(Thrift_LIB      NAMES thrift   HINTS ${THRIFT_ROOT}/lib)

if (Thrift_LIB AND Thrift_INCLUDE_DIR)
  set(Thrift_FOUND TRUE)
  set(Thrift_LIBRARY ${Thrift_LIB})

  if (NOT Thrift_FIND_QUIETLY)
    message(STATUS "Found thrift: ${Thrift_LIBRARY}")
  endif (NOT Thrift_FIND_QUIETLY)
else ()
  set(Thrift_FOUND FALSE)

  set(Thrift_ERROR_REASON "Unable to find the requested Thrift libraries.\n"
                          "Please set THRIFT_ROOT to the root directory containing Thrift.")
  if (Thrift_FIND_REQUIRED)
    message(SEND_ERROR "${Thrift_ERROR_REASON}")
  elseif (NOT Thrift_FIND_QUIETLY)
    message(STATUS "${Thrift_ERROR_REASON}")
  endif ()
endif ()

# find Non-blocking library
find_library(Thrift_NB_LIB NAMES thriftnb HINTS ${THRIFT_ROOT}/lib)

if (Thrift_NB_LIB)
  set(Thrift_NB_FOUND TRUE)
  set(Thrift_LIBRARY ${Thrift_LIBRARY} ${Thrift_NB_LIB})

  if (NOT Thrift_FIND_QUIETLY)
    message(STATUS "non-blocking: ${Thrift_NB_LIB}")
  endif (NOT Thrift_FIND_QUIETLY)
else ()
  set(Thrift_NB_FOUND FALSE)

  if (NOT Thrift_FIND_QUIETLY)
    message(STATUS "libevent is required for thrift broker support")
  endif (NOT Thrift_FIND_QUIETLY)
endif ()

# find executable
exec_program(thrift ARGS -version OUTPUT_VARIABLE Thrift_VERSION
             RETURN_VALUE Thrift_RETURN)

if (Thrift_VERSION MATCHES "^Thrift version")
  if(NOT Thrift_FIND_QUIETLY)
    message(STATUS "    compiler: ${Thrift_VERSION}")
  endif(NOT Thrift_FIND_QUIETLY)
endif ()

mark_as_advanced(Thrift_INCLUDE_DIR Thrift_LIB Thrift_NB_LIB Thrift_LIBRARY)
