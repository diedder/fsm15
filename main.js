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
//                                 >>> STATUS-UEBERWACHUNG <<<                                      //
//                                                                                                  //
//     V1.0      2017-02-27     LB     Initiale Version zum internen Test                           //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////


//globale Statusvariable
var STATE;
var STATE_NEWDRIVE    = (1 << 1); //Neue Stati per Drive empfangen und verarbeitet
var STATE_NEWMAIL     = (1 << 2); //Neue Stati per Mail empfangen und verarbeitet
var STATE_NEWHTTPGET  = (1 << 3); //Neue Stati per GET empfangen und verarbeitet
var STATE_NEWHTTPPOST = (1 << 4); //Neue Stati per POST empfangen und verarbeitet
var STATE_SENDMAIL    = (1 << 5); //Neue Mails muessen gesendet werden
var STATE_ZERO        = STATE_NEWDRIVE | STATE_NEWMAIL | STATE_NEWHTTPGET | STATE_NEWHTTPPOST;
 

//HAUPTROUTINE (jede Minute)
function main() {
 
  //Status fuer neue Stati zuruecksetzen
  STATE &= ~STATE_ZERO;
  
  //Pruefen ob neue Statusmeldungen vorliegen
  newstatDrive();
  newstatMail();
  //ggf. vorhandene Mailsauftraege versenden
  SendMail();
}


//WARTUNGSROUTINE (am 1. des Monats)
function maintenance() {
 
  //gesendete Mails im Postfach loeschen (nach weiteren 30 Tagen wird der Papierkorb automatisch geleert)
  deletesentmails();
  //Papierkorb im Drive loeschen
  emptyThrash();
  //Logs bereingigen
  cleanupLogs();
}


//Papierkorb im Drive leeren
function emptyThrash() {
  Drive.Files.emptyTrash();
}

//gesendete Mails loeschen
function deletesentmails() {
  
  //Alle gesendeten Mails zur Statusuebersicht suchen
  var threads = GmailApp.search('from:me Gesamtübersicht Einsatzbereitschaft ');
  //Alle gefundenen Mails loeschen
  for (var i = 0; i < threads.length; i++) {
    threads[i].moveToTrash()
  }           
}

//Logdateien bereinigen, nur letze 1000 Logs behalten
function cleanupLogs() {
  
  //Wenn Roh-Log laenger als 1000 Eintraege die aeltesten (oben!) loeschen das nur 1000 uebrig bleiben
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileLogRaw'));
  var sheet = statusfile.getActiveSheet();
  if (sheet.getLastRow() > 1001) {
    sheet.deleteRows(2, sheet.getLastRow() - 1001);
  }
  //Wenn Statuslogliste laender als 1000 Eintraege dann die letzten (unten!) loeschen das nur 1000 uebrig bleiben
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileLogList'));  
  var sheet = statusfile.getActiveSheet();
  if (sheet.getLastRow() > 1001) {
    sheet.deleteRows(1002, sheet.getLastRow() - 1001);
  }
}

