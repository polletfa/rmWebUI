# Search for the path containing library's headers
find_path(WiringPi_ROOT_DIR
    NAMES include/wiringPi.h
)

# Search for include directory
find_path(WiringPi_INCLUDE_DIR
    NAMES wiringPi.h
    HINTS ${WiringPi_ROOT_DIR}/include
)

# Search for library
find_library(WiringPi_LIBRARY
    NAMES wiringPi
    HINTS ${WiringPi_ROOT_DIR}/lib
)

# Conditionally set WiringPi_FOUND value
if(WiringPi_INCLUDE_DIR AND WiringPi_LIBRARY)
  set(WiringPi_FOUND TRUE)
else(WiringPi_INCLUDE_DIR AND WiringPi_LIBRARY)
  FIND_LIBRARY(WiringPi_LIBRARY NAMES wiringPi)
  include(FindPackageHandleStandardArgs)
  FIND_PACKAGE_HANDLE_STANDARD_ARGS(WiringPi DEFAULT_MSG 
    WiringPi_INCLUDE_DIR WiringPi_LIBRARY )
  MARK_AS_ADVANCED(WiringPi_INCLUDE_DIR WiringPi_LIBRARY)
endif(WiringPi_INCLUDE_DIR AND WiringPi_LIBRARY)

# Hide these variables in cmake GUIs
mark_as_advanced(
    WiringPi_ROOT_DIR
    WiringPi_INCLUDE_DIR
    WiringPi_LIBRARY
)
