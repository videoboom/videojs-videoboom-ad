function xmlParser(xmlString) {
  const dom = new DOMParser();
  const xml = dom.parseFromString(xmlString, "text/xml");
  const json = xmlToJson(xml, "");
  return JSON.parse(json);
}
function xmlToJson(xml, tab) {
  const NODE_ELEMENT = 1;
  const TEXT_ELEMENT = 3;
  const CDATA_ELEMENT = 4;
  const DOCUMENT_ELEMENT = 9;
  var X = {
    toObj: function(xml) {
      var obj = {};
      if (xml.nodeType == NODE_ELEMENT) {
        if (xml.attributes.length) setAttributes(xml, obj);
        if (xml.firstChild) {
          // element has child nodes ..
          var textChild = 0,
            cdataChild = 0,
            hasElementChild = false;
          for (var n = xml.firstChild; n; n = n.nextSibling) {
            if (n.nodeType == NODE_ELEMENT) hasElementChild = true;
            else if (n.nodeType == TEXT_ELEMENT && notHaveWhiteSpaceText(n))
              textChild++;
            else if (n.nodeType == CDATA_ELEMENT) cdataChild++;
          }

          if (hasElementChild) {
            if (textChild < 2 && cdataChild < 2) {
              // structured element with evtl. a single text or/and cdata node ..
              X.removeWhite(xml);
              for (var n = xml.firstChild; n; n = n.nextSibling) {
                if (n.nodeType == TEXT_ELEMENT)
                  obj["#text"] = X.escape(n.nodeValue);
                else if (n.nodeType == CDATA_ELEMENT)
                  obj["#cdata"] = X.escape(n.nodeValue);
                else if (obj[n.nodeName]) {
                  // multiple occurence of element ..
                  if (obj[n.nodeName] instanceof Array)
                    obj[n.nodeName][obj[n.nodeName].length] = X.toObj(n);
                  else obj[n.nodeName] = [obj[n.nodeName], X.toObj(n)];
                } // first occurence of element..
                else obj[n.nodeName] = X.toObj(n);
              }
            } else {
              obj["#text"] = X.escape(X.innerXml(xml));
            }
          } else if (textChild) {
            obj["#text"] = X.escape(X.innerXml(xml));
          } else if (cdataChild) {
            // cdata
            if (cdataChild > 1) obj["#text"] = X.escape(X.innerXml(xml));
            else
              for (var n = xml.firstChild; n; n = n.nextSibling)
                obj["#text"] = X.escape(n.nodeValue);
          }
        }
        if (!xml.attributes.length && !xml.firstChild) obj = null;
      } else if (xml.nodeType == DOCUMENT_ELEMENT) {
        obj = X.toObj(xml.documentElement);
      }
      return obj;
    },
    toJson: function(o, name, ind) {
      var json = name ? '"' + name + '"' : "";
      if (o instanceof Array) {
        for (var i = 0, n = o.length; i < n; i++)
          o[i] = X.toJson(o[i], "", ind + "\t");
        json +=
          (name ? ":[" : "[") +
          (o.length > 1
            ? "\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind
            : o.join("")) +
          "]";
      } else if (o == null) json += (name && ":") + "null";
      else if (typeof o == "object") {
        var arr = [];
        for (var m in o) arr[arr.length] = X.toJson(o[m], m, ind + "\t");
        json +=
          (name ? ":{" : "{") +
          (arr.length > 1
            ? "\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind
            : arr.join("")) +
          "}";
      } else if (typeof o == "string")
        json += (name && ":") + '"' + o.toString() + '"';
      else json += (name && ":") + o.toString();
      return json;
    },
    innerXml: function(node) {
      var s = "";
      if ("innerHTML" in node) s = node.innerHTML;
      else {
        var asXml = function(n) {
          var s = "";
          if (n.nodeType == 1) {
            s += "<" + n.nodeName;
            for (var i = 0; i < n.attributes.length; i++)
              s +=
                " " +
                n.attributes[i].nodeName +
                '="' +
                (n.attributes[i].nodeValue || "").toString() +
                '"';
            if (n.firstChild) {
              s += ">";
              for (var c = n.firstChild; c; c = c.nextSibling) s += asXml(c);
              s += "</" + n.nodeName + ">";
            } else s += "/>";
          } else if (n.nodeType == 3) s += n.nodeValue;
          else if (n.nodeType == 4) s += "<![CDATA[" + n.nodeValue + "]]>";
          return s;
        };
        for (var c = node.firstChild; c; c = c.nextSibling) s += asXml(c);
      }
      return s;
    },
    escape: function(txt) {
      return txt
        .replace(/[\\]/g, "\\\\")
        .replace(/[\"]/g, '\\"')
        .replace(/[\n]/g, "\\n")
        .replace(/[\r]/g, "\\r");
    },
    removeWhite: function(e) {
      e.normalize();
      for (var n = e.firstChild; n; ) {
        if (n.nodeType == 3) {
          // text node
          if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
            // pure whitespace text node
            var nxt = n.nextSibling;
            e.removeChild(n);
            n = nxt;
          } else n = n.nextSibling;
        } else if (n.nodeType == 1) {
          // element node
          X.removeWhite(n);
          n = n.nextSibling;
        } // any other node
        else n = n.nextSibling;
      }
      return e;
    }
  };
  if (xml.nodeType == 9)
    // document node
    xml = xml.documentElement;
  var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
  return (
    "{\n" +
    tab +
    (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) +
    "\n}"
  );

  function notHaveWhiteSpaceText(n) {
    return n.nodeValue.match(/[^ \f\n\r\t\v]/);
  }

  function setAttributes(xml, o) {
    for (var i = 0; i < xml.attributes.length; i++)
      o["@" + xml.attributes[i].nodeName] = (
        xml.attributes[i].nodeValue || ""
      ).toString();
  }
}
export default xmlParser;
