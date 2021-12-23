# Get sources and headers
foreach(ext ${SOURCES_TYPE})
  file(GLOB_RECURSE _SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/*.${ext}")
  list(APPEND SOURCES ${_SOURCES})
endforeach()
foreach(ext ${HEADERS_TYPE})
  file(GLOB_RECURSE _PUBLIC_HEADERS "${CMAKE_CURRENT_SOURCE_DIR}/public/*.${ext}")
  list(APPEND PUBLIC_HEADERS ${_PUBLIC_HEADERS})
endforeach()

# Add target
if(TARGET_TYPE STREQUAL lib_shared)
  #
  # lib_shared
  #
  add_library(${TARGET_NAME} SHARED ${SOURCES})
  
elseif(TARGET_TYPE STREQUAL lib_static)
  #
  # lib_static
  #
  add_library(${TARGET_NAME} STATIC ${SOURCES})

elseif(TARGET_TYPE STREQUAL lib_headers)
  #
  # lib_headers
  #
  add_custom_target(${TARGET_NAME} 
	COMMAND echo "Nothing to build for lib_headers target.")

elseif(TARGET_TYPE STREQUAL exe)
  #
  # exe
  #
  add_executable(${TARGET_NAME} ${SOURCES})
  
elseif(TARGET_TYPE STREQUAL arduino_firmware)
  #
  # arduino_firmware
  #
  file(GLOB_RECURSE ARDUINO_CORE_SRC 
	${ARDUINO_PATH}/cores/arduino/*.S
	${ARDUINO_PATH}/cores/arduino/*.c
	${ARDUINO_PATH}/cores/arduino/*.cpp
	)

  set(CMAKE_C_COMPILER avr-gcc)
  set(CMAKE_CXX_COMPILER avr-g++)
  set(CMAKE_OBJCOPY avr-objcopy)
  set(CMAKE_OBJDUMP avr-objdump)
  set(CMAKE_RANLIB avr-ranlib)
  set(CMAKE_LINKER avr-ld)

  add_definitions(-mmcu=${MCU} -DF_CPU=${CPU_SPEED} -DARDUINO_AVR_${BOARD_TYPE} -DARDUINO_ARCH_AVR)
  add_definitions(-c -Os -Wall)
  add_definitions(-fno-exceptions -ffunction-sections -fdata-sections)

  set(CMAKE_SHARED_LIBRARY_LINK_C_FLAGS "")   # remove -rdynamic for C
  set(CMAKE_SHARED_LIBRARY_LINK_CXX_FLAGS "") # remove -rdynamic for CXX
  set(CMAKE_EXE_LINKER_FLAGS "-Os -Wl,--gc-sections -mmcu=${MCU}")

  list(APPEND _INCLUDE_DIRS ${ARDUINO_PATH}/cores/arduino)
  list(APPEND _INCLUDE_DIRS ${ARDUINO_PATH}/variants/${PIN_VARIANT})

  add_executable(${TARGET_NAME} ${ARDUINO_CORE_SRC} ${SOURCES})

  find_program(AR_AVRDUDE NAMES avrdude)

  add_custom_target(${TARGET_NAME}-upload 
	COMMAND ${CMAKE_OBJCOPY} -j .text -j .data -O ihex ${TARGET_NAME} ${TARGET_NAME}.hex
	COMMAND ${AR_AVRDUDE} -C${AR_AVRDUDE_CFG} -F -p${MCU} -c${PROGRAMMER} -P${PORT} -b${PORT_SPEED} -D -Uflash:w:${TARGET_NAME}.hex:i
	DEPENDS ${TARGET_NAME}
	)

else()
  #
  # error
  #
  message(FATAL_ERROR "TARGET_TYPE \"${TARGET_TYPE}\" is unknown.\nShould be exe, lib_static or lib_shared.")  
endif()

set_target_properties(${TARGET_NAME} PROPERTIES TARGET_TYPE "${TARGET_TYPE}")

if(NOT TARGET_TYPE STREQUAL lib_headers)
  # Definitions
  foreach(def ${DEFINITIONS})
    list(APPEND _DEFINITIONS "-D${def}")
  endforeach()
  add_definitions(-DPROJECT_NAME="${TARGET_NAME}"
                  -DPROJECT_VERSION_MAJOR=${PROJECT_VERSION_MAJOR}
                  -DPROJECT_VERSION_MINOR=${PROJECT_VERSION_MINOR}
                  -DPROJECT_VERSION_PATCH=${PROJECT_VERSION_PATCH}
                  -DPROJECT_VERSION_STATUS="${PROJECT_VERSION_STATUS}"
                  ${_DEFINITIONS})
  
  # Dependencies
  if(DEPENDENCIES)
    add_dependencies(${TARGET_NAME} ${DEPENDENCIES})
  endif()
  foreach(DEP ${DEPENDENCIES})
    get_target_property(DEP_TYPE ${DEP} TARGET_TYPE)
    if(DEP_TYPE STREQUAL lib_shared OR DEP_TYPE STREQUAL lib_static)
      list(APPEND DEPENDENCIES_LIB ${DEP})
    else()
      get_target_property(DEP_SOURCE ${DEP} SOURCE_DIR)
      list(APPEND _INCLUDE_DIRS ${DEP_SOURCE}/public)
    endif()
  endforeach()
  
  foreach(lib ${LIBRARIES})
    list(APPEND _INCLUDE_DIRS ${${lib}_INCLUDES})
    list(APPEND _INCLUDE_DIRS ${${lib}_INCLUDE_DIR})
    list(APPEND _INCLUDE_DIRS ${${lib}_INCLUDE_DIRS})
    list(APPEND _LIBRARIES ${${lib}_LIBS})
    list(APPEND _LIBRARIES ${${lib}_LIBRARY})
    list(APPEND _LIBRARIES ${${lib}_LIBRARIES})
  endforeach()
  include_directories(${_INCLUDE_DIRS}
                      /usr/include
                      /usr/local/include 
  )
  target_include_directories(${TARGET_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}
                                            PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/public)
  target_link_libraries(${TARGET_NAME} ${_LIBRARIES} ${DEPENDENCIES_LIB})
endif(NOT TARGET_TYPE STREQUAL lib_headers)
  
# Library version for shared libraries
if(TARGET_TYPE STREQUAL lib_shared)
   set_target_properties(${TARGET_NAME} PROPERTIES
                         VERSION ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}.${PROJECT_VERSION_PATCH}
                         SOVERSION ${PROJECT_VERSION_MAJOR})
endif()

# Export
if(TARGET_TYPE STREQUAL lib_shared)
  install(TARGETS ${TARGET_NAME}
                   LIBRARY DESTINATION lib)
elseif(TARGET_TYPE STREQUAL lib_static)
  install(TARGETS ${TARGET_NAME}
                   ARCHIVE DESTINATION lib)
elseif(TARGET_TYPE STREQUAL exe)
  install(TARGETS ${TARGET_NAME} RUNTIME DESTINATION bin)
# arduino_firmware: no install (use upload instead)
# lib_headers: only headers to install (see below)
endif()

if(TARGET_TYPE STREQUAL lib_shared OR TARGET_TYPE STREQUAL lib_static OR TARGET_TYPE STREQUAL lib_headers)
  foreach ( file ${PUBLIC_HEADERS} )
    get_filename_component( fdir "${file}" DIRECTORY )
    string(LENGTH "${CMAKE_CURRENT_SOURCE_DIR}/public/" start)
    string(SUBSTRING "${fdir}" ${start} -1 dir)
    install( FILES ${file} DESTINATION include/${dir} )
  endforeach()
endif()
                
