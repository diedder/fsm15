/*
Copyright 2017 Lars Bremer

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                  //
//    Statusmeldungen ueber HTTP bearbeiten (HTTP GET und POST)                                     //
//                                                                                                  //
//     V1.0      2017-02-27     LB     Initiale Version zum internen Test                           //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////


//POST-Anfragen zur Statusaenderung bearbeiten
function doPost(e) {

  //Parameter fuer neuen Status einlesen
  var newstate = e.parameter['newstate'];
  //Pruefen ob gueltiger Status und ein Keyname uebergeben wurde
  if ((newstate == 'S2' ||  newstate == 'S3' || newstate == 'S6') && e.parameter['keyname']) {
    //Keyname aus Parameteruebergabe auslesen
    var keyname = e.parameter['keyname'];
    // Wenn Status geaendert werden konnte OK-Meldung zurueckgeben
    if (newstatHTTP(keyname, newstate, 'POST')) {        
      return ContentService.createTextOutput('OK - ' + keyname + ' -> ' + newstate);
    }
  }
  //Bei fehlenden Daten oder Fehlermeldung zurueckgeben
  return ContentService.createTextOutput('ERROR')
}


//GET-Anfragen zur Anzeige von Websiten bearbeiten
function doGet(e) {
  
  //Progammname fuer Websitentitel einlesen
  var name = PropertiesService.getScriptProperties().getProperty('Name');
  
  //Wenn kein Parameter 'Page' vorhanden Standardseite mit Einsatzbereitschaft anzeigen
  if (!e.parameter['page']) {
    return HtmlService.createTemplateFromFile('web-site_standby')
     .evaluate()
     .setTitle(name + ' - ' + 'Einsatzbereitschaft')
     .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }
  
  //Wenn Parameter vorhanden diese auswerten
  switch (e.parameter['page']) {
    //Website im Einsatz von Vorlgae erzeugen und ausgeben
    case 'onduty':
      return HtmlService.createTemplateFromFile('web-site_onduty')
       .evaluate()
       .setTitle(name + ' - ' + 'Einsatz Bestätigt')
       .setSandboxMode(HtmlService.SandboxMode.IFRAME);
      break;
      
    //Website mit Statusmeldungen von Vorlgae erzeugen und ausgeben
    case 'log':
      return HtmlService.createTemplateFromFile('web-site_log')
       .evaluate()
       .setTitle(name + ' - ' + 'Statusprotokoll')
       .setSandboxMode(HtmlService.SandboxMode.IFRAME);
      break;
      
    //Website im Einsatz von Vorlage erzeugen und ausgeben
    case 'newstate':     
      //Parameter fuer neuen Status einlesen
      var newstate = e.parameter['newstate'];
      //Pruefen ob gueltiger Status und ein Keyname uebergeben wurde
      if ((newstate == 'S2' ||  newstate == 'S3' || newstate == 'S6') && e.parameter['keyname']) {
        //Seite von Vorlage erzeugen und Variable fuer neuen Status setzen
        var site = HtmlService.createTemplateFromFile('web-site_newstate-ok');
        site.newstate = newstate;
        //Keyname aus Parameteruebergabe auslesen
        var keyname = e.parameter['keyname'];
        // Wenn Status geaendert werden konnte OK Seite erstellen und anzeigen
        if (newstatHTTP(keyname, newstate, 'GET')) {        
          return site.evaluate()
          .setTitle(name + ' - ' + 'Neue Statusmeldung')
          .setSandboxMode(HtmlService.SandboxMode.IFRAME);
          break;
        }
      }
      //Bei fehlenden Daten oder wenn Status nicht geandert werdenkonnte Fehlersite anzeigen
      return HtmlService.createTemplateFromFile('web-site_newstate-err')
       .evaluate()
       .setTitle(name + ' - ' + 'FEHLER')
       .setSandboxMode(HtmlService.SandboxMode.IFRAME);
      break;
      
    //Standardmaessig Website mit Einsatzbereitschaft von Vorlgae erzeugen und ausgeben
    default:
      return HtmlService.createTemplateFromFile('web-site_standby')
       .evaluate()
       .setTitle(name + ' - ' + 'Einsatzbereitschaft')
       .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }
}


//Adresse des Web-Interfaces (Hautpseite) bestimmen
function getWebUrl() {

  var url = ScriptApp.getService().getUrl();
 return url;
}

