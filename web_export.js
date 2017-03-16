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
//    Daten fuer Websiten aus Datei laden und zur Anzeige uebergeben                                //
//                                                                                                  //
//     V1.0      2017-02-27     LB     Initiale Version zum internen Test                           //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////


//Zusammenfassungdaten der Bereitschaft einlesen
function getSummaryStandby() {
 
  //Datei oeffnen und Daten aus dem entsprechenden Blatt einlesen und zurueckgebeb
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileMain'))
  var sheet = statusfile.setActiveSheet(statusfile.getSheetByName(PropertiesService.getScriptProperties().getProperty('SheetStandBy')));
  var summary = sheet.getRange(1, 1, 2, 4).getDisplayValues();
  return summary
}


//Liste der Bereitschaft einlesen
function getListStandby() {
  
  //Datei oeffnen und Daten aus dem entsprechenden Blatt einlesen und zurueckgebeb
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileMain'))
  var sheet = statusfile.setActiveSheet(statusfile.getSheetByName(PropertiesService.getScriptProperties().getProperty('SheetStandBy')));
  var summarylist = sheet.getRange(4, 1, sheet.getLastRow()-3, 5).getDisplayValues();
  return summarylist
}


//Zusammenfassungdaten im Einsatz einlesen
function getSummaryOnDuty() {
 
  //Datei oeffnen und Daten aus dem entsprechenden Blatt einlesen und zurueckgebeb
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileMain'))
  var sheet = statusfile.setActiveSheet(statusfile.getSheetByName(PropertiesService.getScriptProperties().getProperty('SheetOnDuty')));
  var summary = sheet.getRange(1, 1, 3, 4).getDisplayValues();
  return summary
}


//Liste im Einsatz einlesen
function getListOnDuty() {
  
  //Datei oeffnen und Daten aus dem entsprechenden Blatt einlesen und zurueckgebeb
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileMain'))
  var sheet = statusfile.setActiveSheet(statusfile.getSheetByName(PropertiesService.getScriptProperties().getProperty('SheetOnDuty')));
  var summarylist = sheet.getRange(5, 1, sheet.getLastRow()-4, 4).getDisplayValues();
  return summarylist
}


//Liste mit Statuslogs einlesen (nur letzte 50)
function getLogData() {
  
  //Wenn Logsite deaktivert nur Meldung ausgeben
  if (PropertiesService.getScriptProperties().getProperty('LogList') != 'ON') {
    var loglist = [['---', 'Die Anzeige von Logmeldungen wurde vom Administrator deaktiviert']];
    return loglist
  }
  
  //Datei oeffnen und Daten aus dem entsprechenden Blatt einlesen und zurueckgebeb
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileLogList'))
  var lastrow = statusfile.getActiveSheet().getLastRow();
  if (lastrow > 51) {lastrow = 51};
  var loglist = statusfile.getActiveSheet().getRange(2, 1, lastrow -1, 2).getDisplayValues();
  return loglist
}