# 🔧 Risoluzione Problemi Utente - Loginet

**Guida alla Risoluzione Problemi per Utenti**

**Versione:** 2.0
**Lingua:** Italiano
**Ultimo Aggiornamento:** 21 Novembre 2025

---

## 📖 Indice

1. [Problemi di Login](#problemi-di-login)
2. [Problemi con le Fatture](#problemi-con-le-fatture)
3. [Problemi con i Clienti](#problemi-con-i-clienti)
4. [Problemi di Esportazione](#problemi-di-esportazione)
5. [Problemi con il Calendario](#problemi-con-il-calendario)
6. [Problemi di Visualizzazione](#problemi-di-visualizzazione)
7. [Problemi di Prestazioni](#problemi-di-prestazioni)
8. [Quando Contattare l'Amministratore](#quando-contattare-lamministratore)

---

## Problemi di Login

### **Problema: "Nome utente o password non validi"**

**Sintomo:** Non riesco ad accedere, ricevo errore credenziali non valide

**Possibili Cause:**
1. Nome utente o password errati
2. CAPS LOCK attivo
3. Spazi extra prima/dopo username o password
4. Account bloccato (troppi tentativi falliti)

**Soluzioni:**

#### **Soluzione 1: Verifica Credenziali**
- ✅ Controlla di aver digitato correttamente username e password
- ✅ Verifica che CAPS LOCK sia **disattivato**
- ✅ Assicurati di non aver spazi extra all'inizio o alla fine
- ✅ Controlla se il nome utente è case-sensitive (maiuscole/minuscole)

#### **Soluzione 2: Reset Password**
1. Contatta il tuo **amministratore di sistema**
2. L'amministratore può resettare la tua password
3. Riceverai una nuova password temporanea
4. Cambia la password al primo accesso (se disponibile)

#### **Soluzione 3: Account Bloccato**
- Se hai fatto troppi tentativi falliti, l'account potrebbe essere bloccato
- Attendi **15-30 minuti** e riprova
- Oppure contatta l'amministratore per sbloccare l'account

---

### **Problema: "Sessione scaduta"**

**Sintomo:** Durante l'uso dell'applicazione, vengo riportato alla pagina di login

**Causa:** La sessione è scaduta per inattività

**Timeout Predefinito:** 30 minuti di inattività

**Soluzioni:**

#### **Soluzione 1: Effettua Nuovamente il Login**
- Inserisci nuovamente le tue credenziali
- I tuoi dati sono al sicuro, non sono stati persi

#### **Soluzione 2: Resta Attivo**
- ✅ Muovi il mouse o clicca periodicamente
- ✅ Non lasciare l'applicazione inattiva per più di 30 minuti
- ✅ Salva il lavoro frequentemente

#### **Soluzione 3: Richiedi Timeout Più Lungo**
- Se lavori su operazioni lunghe, chiedi all'amministratore di aumentare il timeout sessione
- L'amministratore può configurare timeout più lunghi (es. 60 minuti)

---

### **Problema: La pagina di login non si carica**

**Sintomo:** Browser mostra errore "Impossibile raggiungere il sito"

**Possibili Cause:**
1. Server spento o non raggiungibile
2. Problema di rete
3. URL errato

**Soluzioni:**

#### **Soluzione 1: Verifica URL**
- Controlla di aver digitato correttamente l'indirizzo
- Esempio corretto: `http://server/Index.html`
- Prova ad accedere da Preferiti/Bookmark se disponibile

#### **Soluzione 2: Verifica Connessione Rete**
- ✅ Controlla che il computer sia connesso alla rete
- ✅ Prova ad aprire altri siti web per verificare la connessione
- ✅ Verifica che il WiFi/cavo di rete sia connesso

#### **Soluzione 3: Contatta l'Amministratore**
- Il server potrebbe essere spento o in manutenzione
- Verifica con i colleghi se hanno lo stesso problema
- Contatta l'amministratore IT

---

## Problemi con le Fatture

### **Problema: Non riesco a creare una nuova fattura**

**Sintomo:** Il pulsante "Nuova Fattura" non funziona o ricevo un errore

**Possibili Cause:**
1. Permessi insufficienti (ruolo Visitor)
2. Campi obbligatori mancanti
3. Problema tecnico temporaneo

**Soluzioni:**

#### **Soluzione 1: Verifica Permessi**
- **Ruolo Visitor:** Può solo visualizzare, non creare
- **Ruolo User:** Può creare e modificare
- **Ruolo Admin:** Può fare tutto

Controlla il tuo ruolo con l'amministratore se necessario.

#### **Soluzione 2: Compila Tutti i Campi Obbligatori**
Campi obbligatori per creare una fattura:
- ✅ **Cliente** (seleziona dalla lista)
- ✅ **Numero Fattura** (univoco)
- ✅ **Data** (formato corretto)
- ✅ **Importo** (numero valido)
- ✅ **Stato** (seleziona dalla lista)

#### **Soluzione 3: Ricarica la Pagina**
- Premi **F5** o clicca il pulsante Aggiorna del browser
- Riprova a creare la fattura
- Se il problema persiste, contatta l'amministratore

---

### **Problema: La fattura che ho creato non appare nell'elenco**

**Sintomo:** Ho creato una fattura ma non la vedo nella lista

**Possibili Cause:**
1. Filtri attivi che nascondono la fattura
2. Ordinamento che sposta la fattura fuori dalla vista
3. La fattura non è stata salvata correttamente

**Soluzioni:**

#### **Soluzione 1: Controlla i Filtri**
- Clicca **"Azzera Filtri"** o **"Mostra Tutte"**
- Verifica che il filtro anno/mese includa la data della fattura
- Controlla che il filtro stato includa lo stato della fattura

#### **Soluzione 2: Cambia Ordinamento**
- Prova ad ordinare per **Data** (decrescente) per vedere le più recenti
- Oppure ordina per **Numero Fattura**
- Usa la **Ricerca Rapida** per trovare la fattura per numero o cliente

#### **Soluzione 3: Verifica Salvataggio**
- Controlla se hai ricevuto un messaggio di conferma dopo la creazione
- Se non hai ricevuto conferma, la fattura potrebbe non essere stata salvata
- Riprova a crearla

---

### **Problema: Non posso modificare una fattura esistente**

**Sintomo:** Il pulsante "Modifica" non funziona o non è visibile

**Possibili Cause:**
1. Permessi insufficienti
2. Fattura in stato "Pagata" o "Annullata" (protezione dati)
3. Problema tecnico

**Soluzioni:**

#### **Soluzione 1: Verifica Permessi**
- Solo **User** e **Admin** possono modificare fatture
- **Visitor** può solo visualizzare
- Contatta l'amministratore per upgrade del ruolo se necessario

#### **Soluzione 2: Stato Fattura**
- Alcune fatture potrebbero essere bloccate per protezione dati
- Se la fattura è **Pagata**, potrebbe richiedere permessi Admin per modifiche
- Contatta l'amministratore se devi modificare una fattura bloccata

#### **Soluzione 3: Usa Pulsante Corretto**
- Cerca l'icona **matita** 📝 nella riga della fattura
- Oppure fai doppio clic sulla riga della fattura
- Se non vedi il pulsante, verifica i tuoi permessi

---

### **Problema: Non riesco a eliminare una fattura**

**Sintomo:** Il pulsante "Elimina" non funziona o non è visibile

**Nota:** Loginet usa **Soft Delete** - le fatture non vengono eliminate fisicamente

**Possibili Cause:**
1. Permessi insufficienti (solo Admin può eliminare)
2. Fattura già eliminata
3. Protezione dati

**Soluzioni:**

#### **Soluzione 1: Verifica Permessi**
- Solo **Admin** può eliminare fatture
- Se sei User o Visitor, contatta l'amministratore

#### **Soluzione 2: Soft Delete vs Hard Delete**
- Le fatture "eliminate" sono marcate come cancellate ma non rimosse
- Questo protegge i dati storici
- L'amministratore può recuperare fatture eliminate se necessario

#### **Soluzione 3: Contatta l'Amministratore**
- Spiega quale fattura vuoi eliminare e perché
- L'amministratore può procedere con l'eliminazione

---

## Problemi con i Clienti

### **Problema: Non riesco a creare un nuovo cliente**

**Sintomo:** Il form "Nuovo Cliente" non si salva o ricevo errori

**Possibili Cause:**
1. Campi obbligatori mancanti
2. Nome cliente già esistente (duplicato)
3. Formato email non valido

**Soluzioni:**

#### **Soluzione 1: Compila Campi Obbligatori**
Campi obbligatori per creare un cliente:
- ✅ **Nome Cliente** (minimo 2 caratteri, massimo 200)
- ✅ **Email** (formato valido, es. nome@example.com)

Campi opzionali:
- Telefono
- Indirizzo
- Note

#### **Soluzione 2: Verifica Nome Univoco**
- Il nome cliente deve essere **univoco**
- Se esiste già un cliente con lo stesso nome, riceverai errore
- Usa un nome leggermente diverso (es. "Azienda ABC - Milano" invece di "Azienda ABC")

#### **Soluzione 3: Verifica Formato Email**
Esempi validi:
- ✅ `mario.rossi@example.com`
- ✅ `info@azienda.it`
- ❌ `mario.rossi` (manca @dominio)
- ❌ `mario@` (manca dominio)

---

### **Problema: L'autocomplete clienti non funziona**

**Sintomo:** Quando digito nel campo cliente, non vedo suggerimenti

**Possibili Cause:**
1. Nessun cliente corrisponde alla ricerca
2. Devi digitare almeno 2 caratteri
3. Problema temporaneo di rete

**Soluzioni:**

#### **Soluzione 1: Digita Più Caratteri**
- L'autocomplete si attiva dopo **almeno 2 caratteri**
- Esempio: Digita "AB" per vedere "ABC S.r.l.", "Abaco", ecc.

#### **Soluzione 2: Prova Ricerca Diversa**
- Prova con l'inizio del nome (es. "AC" invece di "CA")
- L'autocomplete cerca clienti che **iniziano** con le lettere digitate

#### **Soluzione 3: Ricarica la Pagina**
- Premi **F5** per ricaricare
- Riprova l'autocomplete
- Se ancora non funziona, puoi comunque creare il cliente manualmente

---

### **Problema: Non trovo un cliente che so essere nel sistema**

**Sintomo:** Cerco un cliente ma non appare nei risultati

**Possibili Cause:**
1. Filtri attivi
2. Cliente eliminato (soft delete)
3. Nome digitato in modo diverso

**Soluzioni:**

#### **Soluzione 1: Usa Ricerca Completa**
- Vai al menu **"Clienti"**
- Usa la **barra di ricerca** in alto
- Prova a cercare per:
  - Nome completo
  - Parte del nome
  - Email
  - Telefono

#### **Soluzione 2: Controlla Filtri**
- Clicca **"Azzera Filtri"** per vedere tutti i clienti
- Verifica che non ci siano filtri attivi che nascondono il cliente

#### **Soluzione 3: Cliente Eliminato**
- Se il cliente è stato eliminato, potrebbe non apparire nelle ricerche standard
- Contatta l'amministratore per verificare se il cliente è stato eliminato
- L'amministratore può ripristinare clienti eliminati se necessario

---

## Problemi di Esportazione

### **Problema: L'esportazione non inizia**

**Sintomo:** Clicco "Esporta" ma non succede nulla

**Possibili Cause:**
1. Nessun dato da esportare (filtri troppo restrittivi)
2. Popup bloccati dal browser
3. Problema temporaneo

**Soluzioni:**

#### **Soluzione 1: Verifica che ci Siano Dati**
- Controlla che ci siano risultati visibili nella tabella
- Se la tabella è vuota, modifica i filtri per includere più dati
- Prova a esportare con **"Mostra Tutte"**

#### **Soluzione 2: Abilita Popup**
- Il browser potrebbe bloccare il download
- Cerca l'icona di popup bloccato nella barra indirizzi
- Clicca e seleziona **"Consenti sempre popup da questo sito"**
- Riprova l'esportazione

#### **Soluzione 3: Ricarica la Pagina**
- Premi **F5** per ricaricare
- Imposta nuovamente i filtri se necessario
- Riprova l'esportazione

---

### **Problema: Il file esportato è vuoto o incompleto**

**Sintomo:** Il file scaricato non contiene tutti i dati attesi

**Possibili Cause:**
1. Filtri attivi che limitano i dati esportati
2. Esportazione interrotta
3. Formato file non supportato dal programma di apertura

**Soluzioni:**

#### **Soluzione 1: Controlla i Filtri Prima di Esportare**
- I dati esportati corrispondono ai filtri attivi
- Se vuoi esportare **tutte** le fatture, usa **"Mostra Tutte"**
- Se vuoi solo un periodo specifico, imposta i filtri corretti

#### **Soluzione 2: Verifica Download Completato**
- Controlla che il download sia completato al 100%
- Guarda nella barra download del browser
- Non interrompere il download prima del completamento

#### **Soluzione 3: Usa il Programma Corretto**
Formati esportazione:
- **CSV**: Apri con Excel, LibreOffice Calc, Notepad
- **Excel**: Apri con Microsoft Excel o LibreOffice Calc

Se il file sembra vuoto, prova ad aprirlo con un programma diverso.

---

### **Problema: L'esportazione contiene caratteri strani (ç, è, à)**

**Sintomo:** Caratteri accentati mostrati come � o ??

**Causa:** Problema di codifica caratteri (encoding)

**Soluzioni:**

#### **Soluzione 1: Importa con UTF-8**
Se stai importando un CSV in Excel:
1. Apri Excel
2. Vai a **Dati** → **Da Testo/CSV**
3. Seleziona il file
4. In **Codifica File**, seleziona **UTF-8**
5. Clicca **Carica**

#### **Soluzione 2: Usa LibreOffice**
- LibreOffice Calc gestisce UTF-8 automaticamente
- Apri il file CSV con LibreOffice invece di Excel
- Salvalo come file Excel se necessario

---

## Problemi con il Calendario

### **Problema: Il calendario non carica**

**Sintomo:** La vista calendario resta vuota o mostra errore

**Possibili Cause:**
1. Nessuna fattura nel periodo visualizzato
2. Problema di caricamento dati
3. JavaScript disabilitato

**Soluzioni:**

#### **Soluzione 1: Cambia Mese/Anno**
- Usa le frecce **◀ ▶** per navigare mesi diversi
- Verifica che ci siano fatture nel periodo selezionato
- Torna al mese corrente con il pulsante **"Oggi"**

#### **Soluzione 2: Ricarica la Pagina**
- Premi **F5** per ricaricare
- Attendi qualche secondo per il caricamento
- Se persiste, contatta l'amministratore

#### **Soluzione 3: Verifica JavaScript**
- Il calendario richiede JavaScript attivo
- Controlla che JavaScript sia abilitato nel browser
- Se usi estensioni come NoScript, aggiungi il sito alle eccezioni

---

### **Problema: Le fatture non appaiono nel calendario**

**Sintomo:** Il calendario si carica ma non mostra fatture

**Possibili Cause:**
1. Nessuna fattura nel periodo visualizzato
2. Filtri stato attivi
3. Date fatture non valide

**Soluzioni:**

#### **Soluzione 1: Verifica Periodo**
- Controlla che stai visualizzando il mese corretto
- Le fatture appaiono in base alla **Data Fattura**
- Usa la navigazione **Anno** e **Mese** per trovare il periodo corretto

#### **Soluzione 2: Controlla Filtri Stato**
- Il calendario potrebbe mostrare solo stati specifici
- Verifica che i filtri stato includano le fatture che cerchi
- Prova a disabilitare tutti i filtri

#### **Soluzione 3: Vai alla Vista Lista**
- Clicca sul menu **"Fatture"** per vedere la vista lista
- Verifica che le fatture esistano nel sistema
- Controlla che abbiano date valide

---

## Problemi di Visualizzazione

### **Problema: La pagina sembra rotta o layout errato**

**Sintomo:** I pulsanti sono fuori posto, il testo si sovrappone, layout confuso

**Possibili Cause:**
1. Browser non compatibile o troppo vecchio
2. Cache browser corrotta
3. Zoom browser impostato in modo errato

**Soluzioni:**

#### **Soluzione 1: Svuota Cache Browser**

**Chrome/Edge:**
1. Premi **Ctrl + Shift + Canc**
2. Seleziona **"Immagini e file memorizzati nella cache"**
3. Clicca **"Cancella dati"**
4. Ricarica la pagina (F5)

**Firefox:**
1. Premi **Ctrl + Shift + Canc**
2. Seleziona **"Cache"**
3. Clicca **"Cancella adesso"**
4. Ricarica la pagina (F5)

#### **Soluzione 2: Ripristina Zoom Browser**
- Premi **Ctrl + 0** (zero) per ripristinare zoom 100%
- Oppure usa menu browser → Zoom → **Ripristina**

#### **Soluzione 3: Aggiorna Browser**
Browser supportati:
- ✅ **Chrome** 90+ (raccomandato)
- ✅ **Firefox** 88+
- ✅ **Edge** 90+
- ❌ **Internet Explorer** (NON supportato)

Scarica l'ultima versione del browser se necessario.

---

### **Problema: I pulsanti non rispondono ai clic**

**Sintomo:** Clicco sui pulsanti ma non succede nulla

**Possibili Cause:**
1. JavaScript disabilitato
2. Estensioni browser che interferiscono
3. Pagina non completamente caricata

**Soluzioni:**

#### **Soluzione 1: Attendi Caricamento Completo**
- Assicurati che la pagina sia completamente caricata
- Guarda l'indicatore di caricamento del browser (icona che ruota)
- Riprova dopo il caricamento completo

#### **Soluzione 2: Disabilita Estensioni**
- Estensioni come AdBlock potrebbero interferire
- Prova in **Modalità Incognito/Privata** (estensioni di solito disabilitate)
  - Chrome: **Ctrl + Shift + N**
  - Firefox: **Ctrl + Shift + P**
- Se funziona in incognito, disabilita le estensioni una alla volta per trovare quella problematica

#### **Soluzione 3: Verifica JavaScript**
- JavaScript deve essere abilitato
- Vai alle impostazioni browser → Privacy → Impostazioni sito
- Verifica che JavaScript sia **Consentito**

---

## Problemi di Prestazioni

### **Problema: L'applicazione è molto lenta**

**Sintomo:** Le pagine impiegano molto tempo a caricare, i clic rispondono lentamente

**Possibili Cause:**
1. Connessione internet lenta
2. Troppi dati da caricare
3. Server sovraccarico
4. Computer lento

**Soluzioni:**

#### **Soluzione 1: Verifica Connessione**
- Testa la velocità della tua connessione internet
- Prova ad aprire altri siti per confrontare
- Se la rete è lenta, contatta il supporto IT

#### **Soluzione 2: Usa Filtri per Limitare Dati**
- Non caricare **tutte** le fatture contemporaneamente
- Usa filtri **Anno** e **Mese** per limitare i risultati
- Carica solo i dati necessari

#### **Soluzione 3: Chiudi Tab Inutilizzate**
- Troppi tab aperti rallentano il browser
- Chiudi tab non necessarie
- Riavvia il browser se necessario

#### **Soluzione 4: Contatta l'Amministratore**
- Se tutti gli utenti hanno lo stesso problema, potrebbe essere un problema server
- L'amministratore può verificare le prestazioni del server
- Potrebbe essere necessario ottimizzare il database

---

## Quando Contattare l'Amministratore

Contatta l'amministratore di sistema quando:

### **Problemi di Accesso**
- ❌ Non riesci ad accedere dopo più tentativi
- ❌ Hai dimenticato la password
- ❌ Il tuo account è bloccato
- ❌ Hai bisogno di permessi aggiuntivi (upgrade ruolo)

### **Problemi Tecnici**
- ❌ La pagina mostra errori tecnici (errore 500, 404, ecc.)
- ❌ I dati non si salvano o scompaiono
- ❌ Funzionalità critiche non funzionano (es. non puoi creare fatture)
- ❌ Il calendario o altre funzionalità non si caricano

### **Problemi con i Dati**
- ❌ Hai bisogno di recuperare una fattura eliminata
- ❌ Hai bisogno di eliminare dati sensibili
- ❌ I dati sembrano corrotti o errati
- ❌ Hai bisogno di importare dati da sistemi esterni

### **Richieste Funzionalità**
- ❌ Hai bisogno di accesso a funzionalità Admin
- ❌ Hai bisogno di modificare impostazioni sistema
- ❌ Vuoi richiedere nuove funzionalità

### **Problemi di Prestazioni Persistenti**
- ❌ L'applicazione è sempre molto lenta (non solo occasionalmente)
- ❌ Timeout frequenti
- ❌ Errori ripetuti

---

## Informazioni da Fornire all'Amministratore

Quando contatti l'amministratore, fornisci:

1. **Descrizione del Problema**
   - Cosa stavi cercando di fare?
   - Cosa è successo invece?

2. **Passi per Riprodurre**
   - Passo 1: Ho aperto la pagina X
   - Passo 2: Ho cliccato sul pulsante Y
   - Passo 3: Ho ricevuto l'errore Z

3. **Messaggio di Errore**
   - Copia e incolla il messaggio di errore esatto
   - Se possibile, fai uno screenshot

4. **Informazioni Browser**
   - Quale browser stai usando? (Chrome, Firefox, Edge)
   - Quale versione? (vai a Menu → Aiuto → Informazioni su Chrome/Firefox)

5. **Quando è Successo**
   - Data e ora approssimativa
   - È la prima volta o succede ripetutamente?

---

## Documentazione Correlata

### **Guide Utente:**
- [Guida Rapida (IT)](USER_GUIDE_QUICKSTART_IT.md) - Inizia in 15 minuti
- [Manuale Utente Completo (IT)](USER_GUIDE_DETAILED_IT.md) - Guida completa
- [FAQ (IT)](FAQ_IT.md) - Domande frequenti

### **Amministratori:**
- [Guida Setup Wizard (IT)](../09-setup-settings/SETUP_WIZARD_GUIDE_IT.md)
- [Guida Impostazioni (IT)](../09-setup-settings/SETTINGS_GUIDE_IT.md)

---

## Riepilogo

**Questa guida copre i problemi più comuni per utenti Loginet:**
- ✅ Login e sessioni
- ✅ Gestione fatture e clienti
- ✅ Esportazione dati
- ✅ Calendario
- ✅ Problemi visualizzazione e prestazioni

**Ricorda:**
- Prova le soluzioni suggerite in ordine
- Salva il lavoro frequentemente
- Contatta l'amministratore per problemi persistenti
- Fornisci dettagli quando segnali un problema

**La maggior parte dei problemi può essere risolta con:**
- ✅ Ricarica pagina (F5)
- ✅ Svuota cache browser
- ✅ Verifica filtri attivi
- ✅ Controlla permessi ruolo

---

**[⬆ Torna all'inizio](#-risoluzione-problemi-utente---loginet)**

**[🏠 Torna all'indice documentazione](../README.md)**
