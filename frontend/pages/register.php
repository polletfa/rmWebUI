<!-- -------------------------------------------------

   rmWebUI - Web interface for the reMarkable(R) cloud.

   (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
   MIT License (see LICENSE file)
  
  --------------------------------------------------- -->
<div class="row">
  <div class="col">
    <p>The application is not yet registered. Login to <a href="https://my.remarkable.com" target="_blank">the reMarkable&reg; cloud</a> and retrieve a one-time code from <a href="https://my.remarkable.com/device/desktop/connect" target="_blank">this address</a> (the code is valid for 5 minutes):</p>
  </div>
</div>
<div class="row g-3 align-items-center">
  <div class="col-auto">
    <label for="code" class="col-form-label">One-time code</label>
  </div>
  <div class="col-auto">
    <input type="text" id="code" class="form-control"></input>
  </div>
  <div class="col-auto">
    <button type="submit" class="btn btn-primary" onclick="app.pages.register.registerApp();" id="register-btn">Register</button>
  </div>
</div>
<script><?php require_once __DIR__."/register.js" ?></script>
