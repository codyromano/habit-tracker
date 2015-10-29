/**
* @module Ajax
* @author Cody Romano
*/
(function(exports) {
  'use strict';

  var Ajax = exports.Ajax = {};

  /**
  * @returns {String} A query string to be used with XMLHttpRequest
  */
  function getQueryString(params) {
    var query = [];
    for (var key in params) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
    return query.length ? query.join(';') : '';
  }

  /**
  * @desc Used in the Promise returned by Ajax.send 
  */
  function handleXMLHttpResponse(xmlHttp, resolve, reject, parseJSON) {
    var parsedResponse;

    // Wait for request to finish
    if (xmlHttp.readyState !== XMLHttpRequest.DONE) {
      return; 
    }
    // 200 = OK
    if (xmlHttp.status !== 200) {
      reject(xmlHttp.responseText, xmlHttp.status); 
    }
    if (parseJSON === false) {
      resolve(xmlHttp.responseText);
      return;
    }

    parsedResponse = JSON.parse(xmlHttp.responseText);
    resolve(parsedResponse);
  }

  Ajax.send = function(url, method, params, parseJSON) {
    var xmlHttp = new XMLHttpRequest();

    /* I can't think of an existing case where you wouldn't want to 
    parse JSON, but this provides extra flexibility for the future. */
    parseJSON = parseJSON || true; 

    if (method === 'POST') {
        xmlHttp.setRequestHeader('Content-type', 'application/' +
          'x-www-form-urlencoded');
    }

    // Parse request parameters if they exist
    if (typeof params === 'object' && Object.keys(params).length) {
      params = getQueryString(params);
    }

    return new Promise(function(resolve, reject) {
      xmlHttp.open(method, url);

      xmlHttp.onreadystatechange = handleXMLHttpResponse.bind(undefined,
        xmlHttp, resolve, reject, parseJSON);

      try {
        xmlHttp.send();
      } catch(e) {
        reject(e);
      }
    });
  };

  // TODO: Implement GET and POST as shortcuts for Ajax.send
  Ajax.get = function() {};
  Ajax.post = function() {};

})(window);
