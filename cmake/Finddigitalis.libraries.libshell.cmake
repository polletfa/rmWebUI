# Search for the path containing library's headers
find_path(digitalis.libraries.libshell_ROOT_DIR
    NAMES include/digitalis/libraries/libshell/Shell.hpp
)

# Search for include directory
find_path(digitalis.libraries.libshell_INCLUDE_DIR
    NAMES digitalis/libraries/libshell/Shell.hpp
    HINTS ${digitalis.libraries.libshell_ROOT_DIR}/include
)

# Search for library
find_library(digitalis.libraries.libshell_LIBRARY
    NAMES digitalis.libraries.libshell
    HINTS ${digitalis.libraries.libshell_ROOT_DIR}/lib
)

# Conditionally set digitalis.libraries.libshell_FOUND value
if(digitalis.libraries.libshell_INCLUDE_DIR AND digitalis.libraries.libshell_LIBRARY)
  set(digitalis.libraries.libshell_FOUND TRUE)
else(digitalis.libraries.libshell_INCLUDE_DIR AND digitalis.libraries.libshell_LIBRARY)
  FIND_LIBRARY(digitalis.libraries.libshell_LIBRARY NAMES digitalis.libraries.libshell)
  include(FindPackageHandleStandardArgs)
  FIND_PACKAGE_HANDLE_STANDARD_ARGS(digitalis.libraries.libshell DEFAULT_MSG 
    digitalis.libraries.libshell_INCLUDE_DIR digitalis.libraries.libshell_LIBRARY )
  MARK_AS_ADVANCED(digitalis.libraries.libshell_INCLUDE_DIR digitalis.libraries.libshell_LIBRARY)
endif(digitalis.libraries.libshell_INCLUDE_DIR AND digitalis.libraries.libshell_LIBRARY)

# Hide these variables in cmake GUIs
mark_as_advanced(
    digitalis.libraries.libshell_ROOT_DIR
    digitalis.libraries.libshell_INCLUDE_DIR
    digitalis.libraries.libshell_LIBRARY
)
