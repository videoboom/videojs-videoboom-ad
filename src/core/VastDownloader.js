function vastDownloader(link) {
  return new Promise((resolve, reject) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        resolve(xmlHttp.responseText);
    };
    xmlHttp.open("GET", link, true); // true for asynchronous
    xmlHttp.send(null);
  });
}

export default vastDownloader;
