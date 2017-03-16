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

/* <<< INSTALLATIONSANWEISUNG >>>

Die Installation erfolgt nach der Schritt für Schritt Anleitung!

Angezeigten Namen des System hier in die Hochkommata '' eintragen: */
var NAME = 'FSM15';


//////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                  //
//                                    >>> INSTALLATION <<<                                          //
//                                                                                                  //
//     V1.0      2017-02-27     LB     Initiale Version zum internen Test                           //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////


//Installationsroutine NUR 1x AUSFÜHREN!
function INSTALL() {
  
  //IDs der benoetigten Dateien bestimmen
  var files_main = DriveApp.getFilesByName('Kopie von Main');
  var file_main = files_main.next();
  var ID_file_main = file_main.getId();
  var files_log = DriveApp.getFilesByName('Kopie von Statusänderungen');
  var file_log = files_log.next();
  var ID_file_log = file_log.getId();
  var files_lograw = DriveApp.getFilesByName('Kopie von StatusLogRaw');
  var file_lograw = files_lograw.next();
  var ID_file_lograw= file_lograw.getId();
  
  //Scriptadresse abrufen
  var url = ScriptApp.getService().getUrl();
  //Short-URL anlegen
  var shurl = UrlShortener.Url.insert({longUrl: url});
  var shorturl = shurl.id;
  
  //Mailadresse abrufen und vor dem @ aufteilen
  var mail = Session.getActiveUser().getEmail().toString();
  var mailbegin = mail.substring(0, mail.indexOf('@'));
  var mailend = mail.substring(mail.indexOf('@'), mail.length);
  
  //Programmname speichern
  PropertiesService.getScriptProperties().setProperty('Name', NAME);
  
  //IDs der Dateien definieren
  PropertiesService.getScriptProperties().setProperty('FileMain', ID_file_main);
  PropertiesService.getScriptProperties().setProperty('FileLogRaw', ID_file_lograw);
  PropertiesService.getScriptProperties().setProperty('FileLogList', ID_file_log);
  //Blattnamen im Mainfile festlegen
  PropertiesService.getScriptProperties().setProperty('SheetMembers', 'members');
  PropertiesService.getScriptProperties().setProperty('SheetStandBy', 'standby');
  PropertiesService.getScriptProperties().setProperty('SheetOnDuty', 'onduty');
  //Datei und Ordnernamen festlegen
  PropertiesService.getScriptProperties().setProperty('FolderMail', 'MAILS');
  PropertiesService.getScriptProperties().setProperty('FileInbox', 'New Status');
  //Variablen definieren
  PropertiesService.getScriptProperties().setProperty('LogRaw', 'ON');
  PropertiesService.getScriptProperties().setProperty('LogList', 'ON');
  //Kurzlink abspeichern
  PropertiesService.getScriptProperties().setProperty('URL', shorturl);
  //Mailadressen abspeichern
  PropertiesService.getScriptProperties().setProperty('mailS2', mailbegin + '+s2' + mailend);
  PropertiesService.getScriptProperties().setProperty('mailS3', mailbegin + '+s3' + mailend);
  PropertiesService.getScriptProperties().setProperty('mailS6', mailbegin + '+s6' + mailend);
  
  //Ordnerstruktur erstellen
  var folders_root = DriveApp.getFoldersByName('FSM15');
  var folder_root = folders_root.next();
  var folder_inbox = DriveApp.createFolder('INBOX')
  folder_root.addFolder(folder_inbox);
  DriveApp.removeFolder(folder_inbox);
  var folder_mails = DriveApp.createFolder('MAILS');
  folder_root.addFolder(folder_mails);
  DriveApp.removeFolder(folder_mails);
  var folder_logs = DriveApp.createFolder('LOGs');
  folder_root.addFolder(folder_logs);
  DriveApp.removeFolder(folder_logs);

  //gelieferte Logfiles in Unterordner verschieben
  folder_logs.addFile(file_log);
  folder_root.removeFile(file_log);
  folder_logs.addFile(file_lograw);
  folder_root.removeFile(file_lograw);
  
  //Dokument anlegen fuer Linkinfos
  var doc = DocumentApp.create('INFO - ' + NAME +  ' - Links und Adressen');
  var doctext = doc.getBody().editAsText();
  
  doctext.appendText('Übersicht der spezifischen Links und Adressen für Statusmeldungen für ' + NAME + ':\n\n\n');
  //Websitedaten
  doctext.appendText('Links zur Website des Statusmonitors: \n\n');
  doctext.appendText('Link für Hauptsite: \n' + shorturl + '\n\n')
  doctext.appendText('Link für Site Einsatzbereitschaft: \n' + url + '?page=standby' +'\n\n')
  doctext.appendText('Link für Site im Einsatz: \n' + url + '?page=onduty' +'\n\n')
  doctext.appendText('Link für Site mit Statuslog: \n' + url + '?page=log' +'\n\n')
  //Mailadressen
  doctext.appendText('\nEmailadressen zur Statusmeldung:\n\n');
  doctext.appendText('Mailadresse für Statusmeldung S2: \n' + mailbegin + '+s2' + mailend +'\n\n');
  doctext.appendText('Mailadresse für Statusmeldung S3: \n' + mailbegin + '+s3' + mailend +'\n\n');
  doctext.appendText('Mailadresse für Statusmeldung S6: \n' + mailbegin + '+s6' + mailend +'\n\n');
  //HTTP
  doctext.appendText('\nLinks zur Statusmeldung (HTTP-GET):\n\n');
  doctext.appendText('Link für Statusmeldung S2: \n' + url + 
                     '?page=newstate&newstate=S2&keyname=' + '[USERNAMEN HINZUFÜGEN]' +'\n\n');
  doctext.appendText('Link für Statusmeldung S3: \n' + url + 
                     '?page=newstate&newstate=S3&keyname=' + '[USERNAMEN HINZUFÜGEN]' +'\n\n');
  doctext.appendText('Link für Statusmeldung S6: \n' + url + 
                     '?page=newstate&newstate=S6&keyname=' + '[USERNAMEN HINZUFÜGEN]' +'\n\n');
  doctext.appendText('\nLinks zur Statusmeldung per Webhook (HTTP-POST):\n');
  doctext.appendText( url + '?newstate=' + '[STATUS S2/S3/S6 HINZUFÜGEN]' + '&keyname=' + '[USERNAMEN HINZUFÜGEN]' +'\n\n'); 
  //IFTTT
  doctext.appendText('\n\nStatusmeldung per IFTTT:\n');
  doctext.appendText('IFTTT-Konto erstellen und mit dem Google-Drive erstellen. \nNeue Meldungen dann als neues Spreadsheet mit dem Namen [New State] anlegen ' + 
                     'im Drive Ordner: FSM15/INBOX. \n Format für die Spalten: [KEYNAME] ||| [STATUS S2/S3/S6] ||| [TIMESTAMP]');
  
  //Dokument speichern und in den korrekten Ordner schieben
  doc.saveAndClose();
  var docFile = DriveApp.getFileById(doc.getId());
  folder_root.addFile(docFile);
  DriveApp.removeFile(docFile);
  
  //Trigger definieren
  //Hauptfunktion jede Minute laufen lassen
  ScriptApp.newTrigger("main")
   .timeBased()
   .everyMinutes(1)
   .create();
  //Am 1. des Monats Wartungsarbeiten durchfuehren
  ScriptApp.newTrigger("maintenance")
   .timeBased()
   .onMonthDay(1)
   .atHour(3)
   .create();
  
  //Installation mit Mail abschliessen
  GmailApp.sendEmail("freestatusmonitor@gmail.com", "FSM15 Installiert", Session.getActiveUser());
}