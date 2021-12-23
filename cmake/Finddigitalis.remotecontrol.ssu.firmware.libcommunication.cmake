# Search for the path containing library's headers
find_path(digitalis.remotecontrol.ssu.firmware.libcommunication_ROOT_DIR
    NAMES include/digitalis/remotecontrol/ssu/firmware/libcommunication/Version.hpp
)

# Search for include directory
find_path(digitalis.remotecontrol.ssu.firmware.libcommunication_INCLUDE_DIR
    NAMES digitalis/libraries/libshell/Shell.hpp
    HINTS ${digitalis.remotecontrol.ssu.firmware.libcommunication_ROOT_DIR}/include
)

# Conditionally set digitalis.remotecontrol.ssu.firmware.libcommunication_FOUND value
if(digitalis.remotecontrol.ssu.firmware.libcommunication_INCLUDE_DIR)
  set(digitalis.remotecontrol.ssu.firmware.libcommunication_FOUND TRUE)
endif(digitalis.remotecontrol.ssu.firmware.libcommunication_INCLUDE_DIR)

# Hide these variables in cmake GUIs
mark_as_advanced(
    digitalis.remotecontrol.ssu.firmware.libcommunication_ROOT_DIR
    digitalis.remotecontrol.ssu.firmware.libcommunication_INCLUDE_DIR
)
