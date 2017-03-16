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
//    Neue Statusinformationen verarbeiten                                                          //
//                                                                                                  //
//     V1.0      2017-02-27     LB     Initiale Version zum internen Test                           //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////


//Neues StatiDatei suchen und einzelne Eintraege auswerten
function newstatDrive() {
  
  //Zeitstempel erstellen
  var timeStamp = Utilities.formatDate(new Date(),Session.getScriptTimeZone() , 'dd.MM.yyyy HH:mm:ss');
  
  //Datei suchen, oeffnen und alle Daten auswaehlen
  var files = DriveApp.getFilesByName(PropertiesService.getScriptProperties().getProperty('FileInbox'));
  while (files.hasNext()) {
    var file = files.next();
    var spreadsheet = SpreadsheetApp.open(file);
    var sheet = spreadsheet.getActiveSheet();
    var data = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues();

    //Alle Daten zeilenweise durchgehen und neue Stati setzen und loggen
    for (var i = 0; i < data.length; i++) {
      ChangeState(data[i][0], data[i][1]);
      LogfileRaw(data[i][0], data[i][1], timeStamp, 'by Drive');
    }
    //verarbeitete Datei loeschen
    file.setTrashed(true);
    //Status setzen fuer neue Statusaenderungen per Dropbox
    STATE |= STATE_NEWDRIVE;
  }
}


//Neues StatiMail(s) suchen und abarbeiten
function newstatMail() {
  
  //Zeitstempel erstellen
  var timeStamp = Utilities.formatDate(new Date(),Session.getScriptTimeZone() , 'dd.MM.yyyy HH:mm:ss');
  
  //Filterkriterium fue die Mailadressem bauen
  
  var mailfilter = 'to:(' + PropertiesService.getScriptProperties().getProperty('mailS2') + 
                   ' OR ' + PropertiesService.getScriptProperties().getProperty('mailS3') + 
                   ' OR ' + PropertiesService.getScriptProperties().getProperty('mailS6') + ')';
  
  //Alle Unterhaltungen (Mails nach Betreff) an eine der Maildressen suchen
  var threads = GmailApp.search(mailfilter);
 
  //Alle gefundenen Unterhaltungne mit neuen Statusmeldungen durchgehen
  for (var i = 0; i < threads.length; i++) {
    //Einzelne Mails zu der Unterhaltung aufrufen und einzeln durchgehen
    var messages = GmailApp.getMessagesForThread(threads[i]);
    for (var j=0; j<messages.length; j++) {
      var email = messages[j];  
      //Absendernamen aus dem String extrahieren (bis zum '<'), Namenteile ohne Leerzeichen zusammensetzen und in Kleinbuchstaben umwandeln
      var names = email.getFrom().substring(0, email.getFrom().indexOf('<')).split(' ');
      var keyname = '';
      for (var k=0; k<names.length; k++) {
        keyname += names[k]
      }
      keyname = String.toLowerCase(keyname).trim();
      //Neuen Status aus der Zieladresse extrahieren (zwischen '+' und '@') und in Grossbuchstaben umwandeln
      var state = String.toUpperCase(email.getTo().substring(email.getTo().indexOf('+')+1, email.getTo().indexOf('@')));
      
      //Neuen Status setzen und Loggen
      ChangeState(keyname, state);
      LogfileRaw(keyname, state, timeStamp, 'by Mail');
      //behandelte Mail loeschen
      email.moveToTrash();
    }
    //Status setzen fuer neue Statusaenderungen per Mail
    STATE |= STATE_NEWMAIL;    
  }           
}


//Neues Status per Http verarbeiten
function newstatHTTP(keyname, NewState, httpType) {
  
  //Zeitstempel erstellen
  var timeStamp = Utilities.formatDate(new Date(),Session.getScriptTimeZone() , 'dd.MM.yyyy HH:mm:ss');  
  //Neuen Status setzen
  if (ChangeState(keyname, NewState) == 0) {return 0;};
  
  //Loggen uns Status setzen je nach HTTP-Typ
  if (httpType == 'GET') {
    LogfileRaw(keyname, NewState, timeStamp, 'by HTTP-GET'); 
    STATE |= STATE_NEWHTTPGET;    
  }
  if (httpType == 'POST') {
    LogfileRaw(keyname, NewState, timeStamp, 'by HTTP-POST'); 
    STATE |= STATE_NEWHTTPPOST;
  }
  return 1;
}


//Status in der Liste aktualisieren und Log schreiben
function ChangeState (KeyName, NewState) {

  //Spatendefinitionen in der Tabelle  
  var colFirstName = 1;  //Vorname
  var colLastName  = 2;  //Nachname
  var colNewState  = 4;  //Neuer Status
  var colTimeStamp = 5;  //Aenderungezeit
  var colOldState  = 6;  //vorheriger Status
  var colKeyName   = 7;  //Schluesselname
  var colMailFlag  = 10;  //Mail versenden fuer den User
  
  //StatusTabelle oeffnen und Spalte mit den Schluesselnamen  einlesen
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileMain'))
  var sheet = statusfile.setActiveSheet(statusfile.getSheetByName(PropertiesService.getScriptProperties().getProperty('SheetMembers')));
  var data = sheet.getRange(2, colKeyName, sheet.getLastRow());

  //Zeile mit dem Schluesselnamen suchen
  var row = findrow(KeyName, data)
  if (row == null) {return 0;}

  //Zeitstempel erstellen
  var timeStamp = Utilities.formatDate(new Date(),Session.getScriptTimeZone() , 'dd.MM.yyyy HH:mm:ss');
  
  //Wenn gefunden neue Werte einsetzen
  sheet.getRange(row, colNewState).copyTo(sheet.getRange(row, colOldState));
  sheet.getRange(row, colNewState).setValue(NewState);
  sheet.getRange(row, colTimeStamp).setValue(timeStamp);

  //Namen einlesen und Logmeldung formattieren
  var FirstName = sheet.getRange(row, colFirstName).getDisplayValue();
  var LastName = sheet.getRange(row, colLastName).getDisplayValue();
  var msg = FirstName + ' ' + LastName + ' --> ' + NewState;
  LogfileList(timeStamp, msg);
  
  //Wenn keine Statusaenderung dann hier abbrechend und keine Mail senden
  if (sheet.getRange(row, colNewState).getDisplayValue() == sheet.getRange(row, colOldState).getDisplayValue()) {return 1;}
  
  //Pruefen ob Mails versendet werden muessen (Meldung von User mit Mail-Flag)
  if (sheet.getRange(row, colMailFlag).getDisplayValue() != '') {
    //Ja --> Neues Dokument erstellen
    var doc = DocumentApp.create('MAIL');
    //Meldung in File (Zwischenspeicher fuer spaetere Mails) schreiben
    doc.getBody().editAsText().insertText(0, PropertiesService.getScriptProperties().getProperty('Name') + ' - ' + timeStamp  + ' - ' + msg);    
    //speichern und in den korrekten Ordner schieben
    doc.saveAndClose();
    var docFile = DriveApp.getFileById(doc.getId());
    var folder = DriveApp.getFoldersByName('MAILS').next();
    folder.addFile(docFile);
    DriveApp.removeFile(docFile);
    //Status setzen damit Mails anschliessend versendet werden
    STATE |= STATE_SENDMAIL;
  }
  return 2;
}


//Einsatz zuruecksetzen, alle S3 Kraefte zurueck auf S2
function resetS3() {
   
  //Spatendefinitionen in der Tabelle  
  var colState     = 4;  //aktueller Status
  var colTimeStamp = 5;  //Aenderungezeit
  var colOldState  = 6;  //vorheriger Status
  
  //StatusTabelle oeffnen und Spalte mit dem aktuellen Status  einlesen
  var statusfile = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('FileMain'))
  var sheet = statusfile.setActiveSheet(statusfile.getSheetByName(PropertiesService.getScriptProperties().getProperty('SheetMembers')));
  var data = sheet.getRange(2, colState, sheet.getLastRow() -1).getDisplayValues();
  
  //Zeitstempel erstellen
  var timeStamp = Utilities.formatDate(new Date(),Session.getScriptTimeZone() , 'dd.MM.yyyy HH:mm:ss');
  
  //Alle Eintraege durchgehen und pruefen ob Status S3, dann ggf. auf S2 zuruecksetzen
  for (var i = 0; i < data.length; i++) {    
    if(data[i] == 'S3') {
      //Status neu setzen
      sheet.getRange(i+2, colState).copyTo(sheet.getRange(i+2, colOldState));
      sheet.getRange(i+2, colState).setValue('S2');
      sheet.getRange(i+2, colTimeStamp).setValue(timeStamp);
    }
  }
  
  //Logmeldung formattieren
  var msg = 'Einsatz zrückgesetzt, alle S3 -> S2';
  LogfileList(timeStamp, msg);
  
  //URL fuer Ruecksprung auf Bereitschaftssite erzeugen und zurueckgeben  
  var url = getWebUrl() + '?page=standby';
 return url;
}


//Uebergebene Spalte nach Wert durchsuchen und Reihennummer zurueckgeben 
function findrow(value, range) {
  var data = range.getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == value) {
       return range.getCell(i + 1,1).getRowIndex();
    }
  }
  return null;
}