# rmWebUI

rmWebUI is a simple web interface for the reMarkable&reg; cloud.

# Install

First run:

```
composer run deploy
```

This will create a `dist/` folder with all required files.

By default, notebooks are downloaded as a ZIP file containing the metadata and lines files in the proprietary format of reMarkable&reg;. rmWebUI is also capable of converting the files to PDF by using [rmrl](https://github.com/rschroll/rmrl). To use this feature, you will need to install Python 3.7 or further and rmrl on your webserver. Make sure you install rmrl either as root or as the user running the WebServer. You must then modify the file `config/config.php` to specify the command for running rmrl (typically it should be `python3 -m rmrl` but it may differ depending on your system configuration).

You can then copy the content of the `dist/` folder to your webserver. You will need PHP 7.2 or further.

Make sure the file `config/auth.token` is writable by the webserver.

# Register application

On the first run, you will be asked to register the application. This is required to access your files on the reMarkable&reg; cloud. Once the application is registered, you will never be asked again. If you want to register anew, clear the content of the file `config/auth.token`.

# Important security warning

rmWebUI doesn't implement any kind of authentication. Configure your webserver as needed to prevent unauthorized access, for example by using a .htaccess file. Make sure that the file `config/auth.token` is protected as well, since its content is all is needed to connect to your reMarkable&reg; cloud account.

# Todo

- Cache generated PDFs for quicker access
- Use a logger for the RemarkableAPI class
- Better error handling?
- Implement upload?

# License

&copy; 2021-2022 Fabien Pollet <polletfa@posteo.de>
rmWebUI is licensed under the MIT license. See the LICENSE file for details.

# Trademarks

reMarkable(R) is a registered trademark of reMarkable AS. rmWebUI is not affiliated with, or endorsed by, reMarkable AS. The use of “reMarkable” in this work refers to the company’s e-paper tablet product(s).