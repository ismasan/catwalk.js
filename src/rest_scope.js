Catwalk.RestScope = Catwalk.Scope.setup({
  init: function () {
    this._super.apply(this, arguments)
  },
  
  // Attempt Ajax to server
  add: function (model) {
    var _super = this._super, self = this;
    // Check for required options
    if(this.options.resource_url == undefined) throw "REST Scopes must define resource_url";
    // Make request
    // request must return boolean
    var verb = 'POST',
        url = this.options.resource_url;
        
    if(this._isNewRecord(model)) {
      verb = 'PUT';
      url = [url, model.attr(this._uniqueIdField())].join('/');
    }
    this._request(verb, url, model, function (success, data) {
      if(success) {
        model.attr(data || {})
        _super.call(self, model);
      }
      else this._errorTriggers(model, data)
    });

    return this;
  },
  
  _uniqueIdField: function () {
    return this.options.unique_id_field || 'id'
  },
  
  // Scope defines what constitutes a new record, since that depends on the persistance layer
  _isNewRecord: function (model) {
    return model.attr(this._uniqueIdField()) !== undefined;
  },
  
  // Handle persistence errors.
  // Data is expected to be a simple object, possibly server provided errors
  _errorTriggers: function (model, data) {
    this.trigger('error', [model]);
    // This will trigger 'change' on model, possibly removing model from this scope
    model.attr(data || {}).trigger('error');
  },
  
  // Default JSON parser
  json: JSON,
  
  // Ajax Persistence
  _request: function (verb, url, model, callback) {
    var self = this;
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open(verb, url, true);
    xhr.setRequestHeader("Content-Type", (this.options.content_type || "application/x-www-form-urlencoded"));
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var data = self.json.parse(xhr.responseText);
        Catwalk.log(verb, data, xhr.status)
        if (xhr.status > 199 && xhr.status < 300) {
          callback(true, data);
        } else {
          callback(false, data);
        }
      }
    };
    Catwalk.log('Ajax:', verb, url, model.serializableAttributes());
    xhr.send(self.json.stringify(model.serializableAttributes()));
  }
});