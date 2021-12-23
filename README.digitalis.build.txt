** Build

   ./digitalis.build release

   Intermediate files are generated in _build/ and targets in _install/.

** Generate documentation

   ./digitalis.build doxygen

   The documentation is generated in _install/.

** Install (for executables, static libraries, header libraries)

   sudo ./digitalis.build install

   This will install everything from the _install directory into /usr/local/.

** Upload to microcontroller (for firmwares)

   ./digitalis.build upload <NAME_OF_TARGET>

   e.g.
   ./digitalis.build upload main

   This assumes the device can be accessed through /dev/ttyUSB0. You can change
   this in the CMakeLists.txt of the target.

** More

   You can display all available commands with ./digitalis.build.
   The git repository for digitalis.build (required for create, add and updatebuild)
   is defined in .digitalis.build
   
