const de = {
  common: {
    loading: 'Laden ...',
    ok: 'OK',
    okay: 'Okay',
    cancel: 'Abbrechen',
    yes: 'Ja',
    no: 'Nein',
    error: 'Fehler',
    info: 'Information',
    understood: 'Verstanden',
  },
  ballotImport: {
    title: 'Wahlschein',
    importButton: 'Wahlschein importieren',
  },
  ballotExport: {
    title: 'Wahlschein exportieren',
    titleShort: 'Wahlschein',
    description:
      'Für jede gespeicherte Wahl kann der Wahlschein als PDF gespeichert werden.',
    empty: 'Keine gespeicherten Wahlscheine.',
    ariaLabel: 'Wahlschein exportieren: {{title}}',
    buttonTitle: 'Wahlschein als PDF speichern',
    confirmTitle: 'Wahlschein exportieren',
    securityQuestion:
      'Solange der Wahlschein nur in dieser App liegt, ist er im sicheren Speicher geschützt. Mit dem Export verlässt er diesen Bereich. Danach kann die App keine Sicherheit mehr für die Datei übernehmen. Geben Sie die PDF nicht weiter und bewahren Sie sie sorgfältig auf. Möchten Sie den Wahlschein wirklich exportieren?',
    exportErrorMessage: 'Der Wahlschein konnte nicht exportiert werden.',
    fallbackElectionTitle: 'Wahl {{electionId}}',
  },
  importDialog: {
    title: '{{item}} importieren.',
    chooseOption: 'Wähle eine Option:',
    scanQr: 'QR-Code scannen',
    uploadPdf: 'PDF hochladen',
    uploadPdfs: 'PDF(s) hochladen',
  },
  messageDialog: {
    okay: 'Okay',
  },
  messageDialogWithNotify: {
    notifyHint:
      'Wenn Sie möchten, können Sie sich benachrichtigen lassen, wenn diese Wahl endet.',
    notifyToggleLabel: 'Benachrichtige mich!',
  },
  questionDialog: {
    title: 'Frage',
  },
  providerPicker: {
    title: 'Authorization Provider',
    selectButton: 'Provider auswählen',
  },
  masterKey: {
    title: 'Masterkey',
    setup: {
      none: 'Sie haben noch keinen Masterkey.',
      create: 'Masterkey erstellen',
      import: 'Masterkey importieren',
    },
    management: {
      present: 'Sie haben bereits einen Masterkey erstellt.',
      export: 'Masterkey exportieren',
      delete: 'Masterkey löschen',
    },
    export: {
      titleShort: 'Wahlschlüssel',
      confirmTitle: 'Wahlschlüssel exportieren',
      securityQuestion:
        'Solange der Wahlschlüssel nur in dieser App liegt, ist er im sicheren Speicher geschützt. Mit dem Export verlässt er diesen Bereich. Danach kann die App keine Sicherheit mehr für die Datei übernehmen. Geben Sie die PDF nicht weiter und bewahren Sie sie sorgfältig auf. Möchten Sie den Wahlschlüssel wirklich exportieren?',
      errorMessage: 'Der Wahlschlüssel konnte nicht exportiert werden.',
      fileName: 'wahlschluessel-{{date}}',
    },
    popup: {
      text:
        'Der Masterkey dient zur sicheren Verwaltung Ihrer Identität und wird für sensible Aktionen innerhalb der App benötigt.',
    },
    importFlow: {
      item: 'Masterschlüssel',
      successTitle: 'Masterkey Import',
      successMessage: 'Import erfolgreich!',
      deleteTitle: 'Masterschlüssel löschen',
      deleteQuestion:
        'Masterschlüssel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      createError: 'Master-Key konnte nicht erstellt werden.',
      invalidPdf: 'Bitte eine PDF-Datei wählen.',
      missingPdfData:
        'In dieser PDF wurden keine Schlüsseldaten gefunden. Bitte die exportierte Wahlschlüssel-PDF verwenden.',
      unreadablePdf: 'Die PDF konnte nicht gelesen werden.',
      invalidPayload:
        'Dieser Inhalt enthält keinen Masterschlüssel. Bitte den Export-QR-Code verwenden.',
      saveError: 'Der Masterschlüssel konnte nicht gespeichert werden.',
      unreadableData: 'Die Schlüsseldaten konnten nicht gelesen werden.',
    },
  },
  userSettings: {
    ballotPopup: {
      title: 'Wahlschein',
      text:
        'Importieren Sie Ihre bestehenden Wahlscheine, um diese direkt wiederzuverwenden. Bitte beachten Sie, dass der Wahlschein zu Ihrem Masterschlüssel passen muss. Der Wahlschein berechtigt Sie zur Teilnahme an einer Wahl.',
    },
    providerPopup: {
      title: 'Authorization Provider',
      text:
        'Hier können später externe Authentifizierungsanbieter zur Identifikation und Autorisierung ausgewählt werden.',
    },
  },
  ballotImportFlow: {
    item: 'Wahlschein',
    title: 'Wahlschein-Import',
    successSingle: 'Import erfolgreich.',
    successMultiple: '{{count}} Wahlscheine erfolgreich importiert.',
    partialSuccess: '{{count}} Wahlschein(e) erfolgreich importiert.',
    noneSuccessful:
      'Keiner der {{total}} Importe war erfolgreich:\n\n{{failures}}',
    partialError:
      'Bei {{failedCount}} von {{total}} Datei(en) ist ein Fehler aufgetreten:\n\n{{failures}}',
    invalidPayload:
      'Der Inhalt ist kein gültiger Wahlschein. Bitte den Export-QR dieser Wahl verwenden.',
    unreadableData: 'Die Daten konnten nicht gelesen werden.',
    mismatch: 'Passt nicht zu Ihrem Wahlschlüssel.',
    noMasterKey: 'Kein Wahlschlüssel vorhanden.',
    saveError: 'Wahlschein konnte nicht gespeichert werden.',
    noPdfData: 'Keine Wahlschein-Daten in der PDF.',
    invalidContent: 'Kein gültiger Wahlschein-Inhalt.',
    notPdf: 'Keine PDF-Datei.',
    unreadablePdf: 'PDF konnte nicht gelesen werden.',
  },
  electionDetail: {
    byAuthor: 'Von {{author}}',
    participation: 'Wahlbeteiligung',
    authorized: 'Berechtigt',
    registered: 'Registriert',
    votes: 'Stimmen',
    period: 'Zeitraum',
    registration: 'Registrierung',
    voting: 'Abstimmung',
    participateNow: 'Jetzt an Wahl teilnehmen',
    registrationStartsSoon: 'Registrierungsphase beginnt bald',
    registerNow: 'Jetzt registrieren',
    unavailable: 'Abstimmung ist aktuell nicht verfügbar',
    phase: {
      ended: 'Beendet',
      voting: 'Abstimmung läuft',
      registration: 'Registrierung läuft',
      upcoming: 'Noch nicht gestartet',
      planned: 'Geplant',
    },
    resultsPublishedNotice: 'Die Ergebnisse dieser Wahl: ',
    resultsPendingNotice: 'Die Ergebnisse dieser Wahl sind noch nicht verfügbar.',
  },
  electionDetailView: {
    invalidElectionId: 'Ungültige Election-ID.',
  },
  registration: {
    creatingBallot: 'Wahlschein wird erstellt ...',
    invalidElectionId: 'Ungültige Wahl-ID',
    electionNotFound: 'Wahl nicht gefunden',
    registrationClosed:
      'Die Registrierungsfrist ist abgelaufen. Ohne einen auf diesem Gerät bereits erstellten Wahlschein ist eine Registrierung nicht mehr möglich.',
    authorizationFailed:
      'Autorisierung beim Authorization Provider ist fehlgeschlagen. Bitte erneut versuchen.',
    redirectCountdown: 'Weiterleitung zu {{provider}} in {{seconds}} Sekunden ...',
    authorizing: 'Autorisierung bei {{provider}} ...',
    authorized: 'Erfolgreich autorisiert',
    incompleteElectionData: 'Election Daten unvollständig',
    ballotCreateError: 'Wahlschein konnte nicht erstellt werden.',
    createMasterKeyError: 'Master-Key konnte nicht erstellt werden.',
  },
  voting: {
    notYetPossible: 'Abstimmung noch nicht möglich',
    forElection: 'für die Abstimmung:',
    notice: 'Hinweis',
    notStartedDescription:
      'Die Abstimmung hat noch nicht begonnen. Sie können erst ab dem folgenden Zeitpunkt wählen:',
    reminderLabel: 'Erinnerung zum Wahlbeginn',
    reminderSaving: 'Wird gespeichert ...',
    ballotTitle: 'Stimmzettel',
    ballotDescription:
      'Für jede Frage haben Sie eine Stimme. Sie können Ihre Stimme bis zum Ende des Wahlzeitraums ändern.',
    reviewHint: 'Überprüfen Sie Ihre Stimmen vor der Abgabe.',
    submitting: 'Wird übermittelt ...',
    submit: 'Stimmzettel abgeben',
    submitStatus:
      'Bitte warten. Die Transaktion läuft; die Bestätigung über den Index kann kurz dauern.',
    ballotMissing:
      'Wahlzettel konnte nicht erkannt werden. Bitte versuchen Sie es erneut.',
    successTitle: 'Stimme übermittelt',
    successMessage:
      'Die Transaktion war erfolgreich. Sie können sie im Block-Explorer einsehen:',
    invalidElectionId: 'Ungültige Wahl-ID',
    missingCredentials: 'Keine Voting-Credentials vorhanden',
    missingPublicKey: 'Kein Public Key vorhanden',
    sendError: 'Fehler beim Senden des Votes',
  },
  votingReminder: {
    startInPast: 'Der Wahlbeginn liegt bereits in der Vergangenheit.',
    notificationsDenied:
      'Benachrichtigungen sind nicht erlaubt. Bitte in den Systemeinstellungen aktivieren.',
    channelName: 'Abstimmungen',
    channelDescription: 'Erinnerungen zum Wahlbeginn',
    notificationTitle: 'Abstimmung hat begonnen',
    notificationBody: 'Sie können jetzt bei "{{title}}" abstimmen.',
    scheduleError: 'Die Erinnerung konnte nicht eingerichtet werden.',
    cancelError:
      'Die Erinnerung konnte nicht ausgeschaltet werden. Bitte erneut versuchen oder die Benachrichtigungsberechtigung in den Systemeinstellungen prüfen.',
  },
  votingEndedNotify: {
    pastEnd: 'Das Ende der Abstimmung liegt bereits in der Vergangenheit.',
    notificationTitle: 'Abstimmung beendet',
    notificationBody:
      'Die Wahl „{{title}}“ ist beendet. Die Ergebnisse werden in Kürze veröffentlicht.',
    scheduleError: 'Die Benachrichtigung konnte nicht eingerichtet werden.',
  },
  electionList: {
    empty: 'Aktuell sind keine Wahlen verfügbar.',
  },
  homePage: {
    tabs: {
      upcoming: 'anstehend',
      pending: 'Registrierung zu',
      running: 'laufend',
      finished: 'abgeschlossen',
    },
    searchPlaceholder: 'Wahl suchen',
  },
  votingCountdown: {
    startsIn: 'Abstimmung beginnt in',
    voteNow: 'Jetzt abstimmen!',
    day: 'Tag',
    days: 'Tage',
  },
  qrScan: {
    title: 'QR-Code scannen',
    hint: 'Halten Sie den Code ruhig im Rahmen.',
    cameraError:
      'Kamera konnte nicht gestartet werden. Bitte Berechtigung erteilen oder in den Einstellungen erlauben.',
  },
  voteHistory: {
    empty: 'Sie haben an noch keiner Wahl teilgenommen.',
    registered: 'Hierfür sind Sie registriert:',
    voted: 'Hier haben Sie bereits abgestimmt:',
  },
  importService: {
    invalidJson: 'QR-Code enthält kein gültiges JSON.',
    invalidFormat: 'QR-Code hat kein gültiges Import-Format.',
  },
} as const;

export default de;
