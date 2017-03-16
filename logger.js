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
//    Durchgefuehrte Aktionen in Dateien protokollieren                                             //
//                                                                                                  //
//     V1.0      2017-02-27     LB     Initiale Version zum internen Test                           //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////


//Statusveraenderungen bei Bearbeitung in Roh-Logfile schreiben
function LogfileRaw(KeyName, NewState, TimeStamp, Trigger) {
  
  //Wenn Logging der Rohdaten nicht explizit eingeschaltet ist beenden
  if (PropertiesService.getScriptProperties().getProperty('LogRaw') != 'ON') {return}
  
  //Logfile oeffnen
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileLogRaw'));
  var sheet = statusfile.getActiveSheet();

  //Neue Zeile schreiben
  sheet.appendRow([KeyName, TimeStamp , NewState, Trigger]);
}


//Statusveraenderungen in Kurzlog fuer angezeigte Liste schreiben
function LogfileList(TimeStamp, msg) {
  
  //Logfile oeffnen
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileLogList'));  
  var sheet = statusfile.getActiveSheet();
  
  //Neue Zeile oben einfuegen und mit Werten beschreiben
  var values = [[TimeStamp, msg]];
  sheet.insertRows(2);
  var range = sheet.getRange(2, 1, 1, 2);
  range.setValues(values);
}