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
//    Mails nach Statusveraenderung dynamisch erstellen und versenden                               //
//                                                                                                  //
//     V1.0      2017-02-27     LB     Initiale Version zum internen Test                           //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////

//Neue Mails ersetllen und versenden
function SendMail() {
  
  //Spaltendefinition fuer Tabelle
  var colMail  = 11;  //Mailadresse
  
  //Zeitstempel erstellen
  var timeStamp = Utilities.formatDate(new Date(),Session.getScriptTimeZone() , 'dd.MM.yy HH:mm');
  
  //StatusTabelle oeffnen und Spalte mit den Mailadressen  einlesen
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileMain'))
  var sheet = statusfile.setActiveSheet(statusfile.getSheetByName(PropertiesService.getScriptProperties().getProperty('SheetMembers')));
  var data = sheet.getRange(2, colMail, sheet.getLastRow()).getValues();
  
  //Alle Daten zeilenweise durchgehen Mailadressen zusammenhaengen
  var mailadresses = '';
  for (var i = 0; i < data.length; i++) {
    if(data[i][0] != '') {
      mailadresses += data[i][0].toString() + ",";
    }
  }
  
  //Zusammenfassungsliste aus Datei laden und in Variablen schreiben fuer Inhalt der Mail
  var sheet = statusfile.setActiveSheet(statusfile.getSheetByName(PropertiesService.getScriptProperties().getProperty('SheetStandBy')));
  var summary = sheet.getRange(1, 1, 2, 4).getValues();
  var summarylist = sheet.getRange(4, 1, sheet.getLastRow()-3, 4).getValues();
  //Mailtexte erzeugen
  var mailbody = composeMessage(summary, summarylist, timeStamp);
  var mailbodyHTML = composeMessageHTML(summary, summarylist, timeStamp);
  
  //Zwischenspeicherdateien suchen fuer die Mails verschickt werden sollen
  var files = DriveApp.getFilesByName('MAIL');
  while (files.hasNext()) {
    var file = files.next();
    //Inhalt der Datei als Betreff fuer die Mail nutzen
    var doc = DocumentApp.openById(file.getId());
    var mailsubject = doc.getBody().getText();
   
    //Mail senden
    GmailApp.sendEmail('', mailsubject, mailbody, {
      bcc: mailadresses,
      name: PropertiesService.getScriptProperties().getProperty('Name'),
      htmlBody: mailbodyHTML,
      noReply: true});
    
    //verarbeitete Datei loeschen
    file.setTrashed(true);
    //Status fuer unversendete Mails zuruecksetzen
    STATE &= ~STATE_SENDMAIL;
  }
}


//Reine Text-Mail erzeugen
function composeMessage(summary, summarylist, timestamp){
  
  //Ueberschrift mit aktueller Zeit
  var message = 'Gesamtübersicht Einsatzbereitschaft (Stand ' + timestamp + ') :\n\n\n';
  //Gesamtuebersicht der Stati / Anzahl
  message += 'Gesamtsummen Einsatzkräfte:\n';
  message += summary[1][0] + '   ' + summary[1][1] + ' (' + summary[1][2] + ' MA / ' + summary[1][3] + ' PA)\n';
  message += summary[0][0] + '   ' + summary[0][1] + '\n';
  //einzelne Namen mit Stati und Funktionen als Liste
  message += '\n\n' + 'Übersicht Einsatzkräfte:'  
  for(var j=0; j<summarylist.length; ++j){
    message += '\n' + summarylist[j][0] + ' --> ' + summarylist[j][1] + ' (' + summarylist[j][2] + ' / ' + summarylist[j][3] + ')';
  }
  //Fusszeile
  message += '\n\n' + 'Erzeugt durch ' + PropertiesService.getScriptProperties().getProperty('Name') + '\n';
  return message;
}


//HTML-Mail erzeugen
function composeMessageHTML(summary, summarylist, timestamp){
  
  //Beginn HTML Code
  var message = '<font face="Arial">';
  //Ueberschrift mit aktueller Zeit
  message += '<b><u>Gesamtübersicht Einsatzbereitschaft (Stand: ' + timestamp + '):</b></u><br><br>'; 
  
  //Gesamttabelle erzeugen
  message += '<br><b>Gesamtsummen Einsatzkräfte:</b><br>';
  message += '<table style="border-collapse:collapse" bordercolor=#000000 border=2 cellpadding=3>';
  //Gesamt S2
  message += '<tr style="font-weight:bold; background-color:#74DF00">' + 
             '<td align="right"><b>' + summary[1][0] + '</b></td>' +
             '<td align="center" width="20"><b>' + summary[1][1] + '</b></td></tr>';
  //S2 mit MA
  message += '<tr style="font-weight:normal; background-color:#9FF781; color:#848484">' +
             '<td align="right">' + summary[0][2] + '</td>' +
             '<td align="center" width="40">' + summary[1][2] + '</td></tr>';          
  //S2 mit PA
  message += '<tr style="font-weight:normal; background-color:#9FF781; color:#848484">' +
             '<td align="right">' + summary[0][3] + '</td>' +
             '<td align="center" width="40">' + summary[1][3] + '</td></tr>';
  //Gesamt S6
  message += '<tr style="font-weight:bold; background-color:#FA5858">' +
             '<td align="right">' + summary[0][0] + '</td>' +
             '<td align="center" width="20">' + summary[0][1] + '</td></tr>';
  message +='</table><br>';
  
  //Gesamtliste erzeugen
  message += '<br><b>Übersicht Einsatzkräfte:</b><br>';
  message += '<table style="border-collapse:collapse;" bordercolor=#000000 border = 2 cellpadding = 3>';
  //Überschrift der Tabelle
  message += '<th style="background-color:black; color:white; font-weight:bold">Name</th>';
  message += '<th style="background-color:black; color:white; font-weight:bold">Status</th>';
  message += '<th style="background-color:black; color:white; font-weight:bold">MA</th>';
  message += '<th style="background-color:black; color:white; font-weight:bold">PA</th>';
  
  //Einzelnde Eintraege der Liste
  for(var j=0; j<summarylist.length; ++j){
    //Je nach Status Hintergrundfarbe waehlen
    if (summarylist[j][1] == 'S2') {message += '<tr style="background-color:#74DF00">'};
    if (summarylist[j][1] == 'S3') {message += '<tr style="background-color:#FACC2E">'};
    if (summarylist[j][1] == 'S6') {message += '<tr style="background-color:#FA5858">'};
    //Namen und Status
    message += '<td>' + summarylist[j][0] + '</td><td align="center">' + summarylist[j][1] + '</td>';
    //Funktionen
    message += '<td align="center">' + summarylist[j][2] + '</td><td align="center">' + summarylist[j][3] + '</td></tr>';
  }
  message += '</table>';
  
  //Link zur Website anzeigen
  message += '<br><a href="' + getWebUrl() + '?page=standby">zur Übersicht</a><br><br>';
  
  //Link fuer Statusmeldungen per Mail anzeigen
  message += '<a href="mailto:' + PropertiesService.getScriptProperties().getProperty('mailS2') + '">' +
             'Mich auf Status S2 melden</a><br>';
  message += '<a href="mailto:' + PropertiesService.getScriptProperties().getProperty('mailS3') + '">' +
             'Mich auf Status S3 melden</a><br>';
  message += '<a href="mailto:' + PropertiesService.getScriptProperties().getProperty('mailS6') + '">' +
             'Mich auf Status S6 melden</a><br>';
  
  //Fusszeile
  message += '<br><i>Erzeugt durch ' + PropertiesService.getScriptProperties().getProperty('Name') + '</i><br>';
  message += '</font>';
  
  return message;
}