# ❓ Domande Frequenti (FAQ) - Loginet

**Sistema di Gestione Fatture**

**Versione:** 2.0
**Ultimo aggiornamento:** 21 Novembre 2025

---

## 📚 Indice Categorie

1. [Login e Accesso](#-login-e-accesso)
2. [Fatture](#-fatture)
3. [Clienti](#-clienti)
4. [Esportazione Dati](#-esportazione-dati)
5. [Utenti e Permessi](#-utenti-e-permessi)
6. [Calendario](#-calendario)
7. [Problemi Tecnici](#-problemi-tecnici)
8. [Sicurezza](#-sicurezza)
9. [Funzionalità Generali](#-funzionalità-generali)

---

## 🔐 Login e Accesso

### **Q: Ho dimenticato la password. Come posso recuperarla?**

**A:** Attualmente **non c'è una funzione di recupero password self-service**. Devi:
1. Contattare l'**amministratore del sistema**
2. L'amministratore può **resettare la tua password** dalla sezione Utenti
3. Ti verrà comunicata la nuova password

**💡 Suggerimento:** Usa un password manager (LastPass, 1Password, Bitwarden) per non dimenticare le password.

---

### **Q: Posso cambiare la mia password?**

**A:** Sì, ma dipende dalla versione:
- Chiedi all'amministratore di **modificare il tuo utente** e impostare una nuova password
- Se è disponibile una funzione "Cambia Password" nel menu, usala direttamente

---

### **Q: Perché vedo "Sessione scaduta"?**

**A:** La tua sessione è scaduta dopo un periodo di inattività o dopo la scadenza naturale (tipicamente 30 giorni con "Ricordami", 1 giorno senza).

**Soluzione:** Fai nuovamente login. I tuoi dati sono salvi.

---

### **Q: Posso accedere da smartphone/tablet?**

**A:** **Sì!** Loginet ha un'interfaccia **responsive** (si adatta allo schermo).

**Browser consigliati:**
- iOS: Safari, Chrome
- Android: Chrome, Firefox
- Connessione: Internet o rete aziendale

---

### **Q: Il pulsante "Ricordami" cosa fa?**

**A:** Mantiene la sessione attiva più a lungo (tipicamente 30 giorni invece di 1 giorno).

**⚠️ Usa solo su dispositivi personali**, non su computer condivisi!

---

## 📄 Fatture

### **Q: Come faccio a creare una fattura?**

**A:** Segui questi passaggi:
1. Vai su **"Fatture"** nel menu
2. Clicca **"+ Nuova Fattura"**
3. Compila i campi obbligatori (*):
   - Numero Fattura
   - Cliente
   - Data Fattura
   - Importo
   - Status
4. Clicca **"Salva"**

**📖 Guida dettagliata:** [Creare una Fattura](USER_GUIDE_DETAILED_IT.md#creare-nuova-fattura)

---

### **Q: Posso modificare una fattura dopo averla creata?**

**A:** **Sì**, se hai i permessi (ruolo Utente o Admin).

**Come:**
1. Trova la fattura nella tabella
2. Clicca **"Modifica"** (icona matita)
3. Cambia i campi necessari
4. Clicca **"Salva"**

---

### **Q: Cosa succede se elimino una fattura per errore?**

**A:** **Buone notizie!** Loginet usa il **soft delete**:
- La fattura viene **nascosta**, non eliminata fisicamente
- Un **amministratore può recuperarla** dalla sezione "Fatture Eliminate"

**Come recuperare (Admin):**
1. Vai a **"Fatture Eliminate"** o **"Cestino"**
2. Trova la fattura
3. Clicca **"Ripristina"**

---

### **Q: Posso avere lo stesso numero fattura due volte?**

**A:** **NO**, il numero fattura deve essere **univoco**.

Se provi a salvare un duplicato, vedrai l'errore: **"Numero fattura già esistente"**.

**Soluzione:** Cambia il numero fattura e riprova.

---

### **Q: Qual è la differenza tra "Saldato", "Non Saldato" e "Scaduto"?**

**A:**
- **🟢 Saldato**: Pagamento ricevuto e completato
- **🔴 Non Saldato**: In attesa di pagamento
- **🟠 Scaduto**: La scadenza è passata senza pagamento

**Come usare:**
- Imposta "Non Saldato" quando emetti la fattura
- Cambia a "Saldato" quando ricevi il pagamento
- Se la scadenza passa senza pagamento, cambia a "Scaduto"

---

### **Q: Posso cercare una fattura specifica?**

**A:** **Sì!** Hai diverse opzioni:

**1. Ricerca Rapida:**
- Usa la barra di ricerca in alto
- Digita numero fattura, cliente, o parola chiave

**2. Filtri:**
- Filtra per **Cliente**
- Filtra per **Status**
- Filtra per **intervallo di date**
- Filtra per **importo**

**3. Ordinamento:**
- Clicca sulle intestazioni colonne per ordinare

**📖 Guida:** [Ricerca e Filtri](USER_GUIDE_DETAILED_IT.md#parte-7-ricerca-e-filtri)

---

### **Q: Quante fatture posso creare?**

**A:** **Nessun limite** (dipende solo dalla capacità del database).

Il sistema può gestire **migliaia di fatture** senza problemi di performance.

---

## 👥 Clienti

### **Q: Devo creare il cliente prima di creare la fattura?**

**A:** **Sì**, il cliente deve esistere prima di associarlo a una fattura.

**Procedura corretta:**
1. Crea il cliente (se non esiste)
2. Poi crea la fattura e seleziona quel cliente

---

### **Q: Come faccio a trovare un cliente nell'elenco?**

**A:** Quando crei/modifichi una fattura:
1. Nel campo **"Cliente"**, inizia a **digitare** il nome
2. Appare un **dropdown con suggerimenti** (autocomplete)
3. Seleziona il cliente dall'elenco

**💡 Tip:** Digita almeno 2-3 caratteri per risultati migliori.

---

### **Q: Posso modificare il nome di un cliente?**

**A:** **Sì**, se hai i permessi.

**⚠️ Attenzione:** La modifica si rifletterà su **tutte le fatture** associate a quel cliente.

---

### **Q: Cosa succede se elimino un cliente con fatture associate?**

**A:** **Dipende dalla configurazione:**
- Potresti ricevere un **errore** (protezione integrità dati)
- In questo caso, **non puoi eliminare** il cliente finché ha fatture

**Opzioni:**
1. Elimina prima tutte le fatture del cliente
2. Oppure NON eliminare il cliente (mantienilo nel sistema)

---

### **Q: Posso esportare l'elenco clienti?**

**A:** Dipende dalla versione. Alcune versioni hanno l'export clienti, altre solo export fatture.

**Se disponibile:** Cerca il pulsante **"Esporta"** nella pagina Clienti.

---

## 📊 Esportazione Dati

### **Q: In quali formati posso esportare i dati?**

**A:** Loginet supporta:
- **CSV** (Comma-Separated Values)
- **Excel** (XLSX)

Entrambi apribili con Excel, LibreOffice Calc, Google Sheets.

---

### **Q: Come faccio a esportare le fatture?**

**A:**
1. Vai alla pagina **"Fatture"**
2. **(Opzionale)** Applica **filtri** per esportare solo alcune fatture
3. Clicca **"Esporta CSV"** o **"Esporta Excel"**
4. Il file viene scaricato automaticamente

**📖 Guida:** [Esportazione Dati](USER_GUIDE_DETAILED_IT.md#parte-6-esportazione-dati)

---

### **Q: Il file CSV mostra caratteri strani (æ, ¿, etc.)**

**A:** Problema di **codifica caratteri**. Il CSV usa UTF-8, ma Excel potrebbe non riconoscerlo.

**Soluzione Excel:**
1. Apri Excel
2. **Dati** → **Da testo/CSV**
3. Seleziona il file
4. Imposta codifica: **UTF-8**
5. Importa

**Alternativa:** Usa **LibreOffice Calc** o **Google Sheets** (gestiscono meglio UTF-8).

---

### **Q: Posso esportare solo le fatture di un cliente specifico?**

**A:** **Sì!**
1. Applica il **filtro Cliente** nella pagina Fatture
2. Seleziona il cliente desiderato
3. Clicca **"Esporta"**
4. Il file conterrà solo quelle fatture

---

### **Q: Il file Excel ha un formato brutto**

**A:** Se usi **"Esporta CSV"**, il formato è basico.

**Soluzione:** Usa **"Esporta Excel"** (XLSX) se disponibile:
- Formattazione migliore
- Colonne auto-dimensionate
- Intestazioni in grassetto

---

## 👤 Utenti e Permessi

### **Q: Non vedo il menu "Utenti". Perché?**

**A:** La gestione utenti è disponibile **solo per ruolo Admin**.

Se sei **Utente** o **Visitatore**, non hai accesso.

**Soluzione:** Contatta un amministratore se devi gestire utenti.

---

### **Q: Qual è la differenza tra Admin, Utente e Visitatore?**

**A:**

| Ruolo | Permessi |
|-------|----------|
| **Admin** | ✅ Tutto (fatture, clienti, utenti) |
| **Utente** | ✅ Fatture e clienti, ❌ Utenti |
| **Visitatore** | ✅ Solo visualizzazione, ❌ Modifiche |

**📖 Dettagli:** [Ruoli Utente](USER_GUIDE_DETAILED_IT.md#ruoli-utente)

---

### **Q: Come faccio a creare un nuovo utente?**

**A:** **Solo se sei Admin:**
1. Vai su **"Utenti"**
2. Clicca **"+ Nuovo Utente"**
3. Compila:
   - Nome utente (univoco)
   - Password (min 8 caratteri)
   - Ruolo
4. Clicca **"Salva"**

---

### **Q: Posso cambiare il mio ruolo?**

**A:** **NO**, non puoi cambiare il tuo ruolo da solo.

Solo un **amministratore** può modificare i ruoli degli utenti.

---

### **Q: Ho bisogno di più permessi. Cosa faccio?**

**A:** Contatta l'**amministratore del sistema** e spiega quali funzionalità ti servono.

L'amministratore può:
- Cambiarti il ruolo (es: da Visitatore a Utente)
- Oppure spiegarti perché non è possibile

---

## 📅 Calendario

### **Q: Come funziona il calendario?**

**A:** Il calendario mostra le **fatture come eventi**:
- **Data evento** = Data fattura
- **Colore** = Status (Verde=Saldato, Rosso=Non Saldato, Arancione=Scaduto)

**Come usare:**
1. Vai su **"Calendario"** nel menu
2. Naviga tra mesi/settimane/giorni
3. Clicca su un evento per vedere i dettagli

---

### **Q: Posso modificare una fattura dal calendario?**

**A:** **Sì!**
1. Clicca sull'evento (fattura)
2. Nel popup, clicca **"Modifica"**
3. Si apre il form di modifica

---

### **Q: Posso spostare una fattura trascinandola su un'altra data?**

**A:** Dipende dalla versione. Se il **drag & drop** è abilitato:
- Trascina l'evento su una nuova data
- La data fattura verrà aggiornata automaticamente

Se non funziona, usa il form di modifica normale.

---

### **Q: Il calendario è lento con molte fatture**

**A:** Con migliaia di fatture, il calendario può rallentare.

**Suggerimenti:**
- Filtra le fatture per periodo (es: solo mese corrente)
- Usa la vista **Settimana** o **Giorno** invece di Mese
- Considera di esportare i dati per analisi offline

---

## 🔧 Problemi Tecnici

### **Q: La pagina non si carica / errore bianco**

**A:** Possibili cause:

**1. Problema di rete:**
- Verifica la connessione internet/rete
- Prova a ricaricare la pagina (F5)

**2. Sessione scaduta:**
- Fai nuovamente login

**3. Errore server:**
- Contatta l'amministratore IT
- Segnala l'ora esatta dell'errore

---

### **Q: Non riesco a salvare una fattura (errore generico)**

**A:** **Controlli:**

1. **Tutti i campi obbligatori (*) sono compilati?**
2. **Il numero fattura è univoco?** (non duplicato)
3. **L'importo è un numero valido?** (no lettere)
4. **La data ha il formato corretto?** (gg/mm/aaaa)

Se tutto è ok, contatta l'amministratore con:
- Screenshot dell'errore
- Dati che stavi inserendo

---

### **Q: L'autocomplete non funziona**

**A:** **Soluzioni:**

1. **Digita almeno 2-3 caratteri** (non si attiva con 1 solo)
2. **Ricarica la pagina** (F5)
3. **Verifica che il cliente esista** (vai su Clienti e controlla)
4. **Prova con un altro browser** (Chrome, Firefox)

Se continua a non funzionare, segnala all'amministratore.

---

### **Q: Il pulsante "Salva" è grigio e non clicca**

**A:** Il pulsante è **disabilitato** perché il form non è valido.

**Controlli:**
- Ci sono **campi con bordo rosso**? Quelli sono invalidi
- Ci sono **messaggi di errore** sotto i campi?
- Leggi i messaggi e correggi gli errori

---

## 🔒 Sicurezza

### **Q: Le mie password sono al sicuro?**

**A:** **Sì!** Loginet usa **BCrypt** per hashare le password:
- Le password **NON sono memorizzate in chiaro**
- Sono **crittografate con algoritmo unidirezionale**
- Nemmeno gli amministratori possono vedere la tua password

---

### **Q: Devo cambiare la password periodicamente?**

**A:** **Raccomandato** per sicurezza:
- Cambia ogni **3-6 mesi**
- Cambia **immediatamente** se sospetti compromissione

---

### **Q: Posso usare la stessa password di altri siti?**

**A:** **NO, assolutamente!** È una pratica **molto pericolosa**.

**Perché:** Se un altro sito viene violato, gli attaccanti potrebbero provare la stessa password qui.

**Soluzione:** Usa un **password manager** che genera e memorizza password univoche.

---

### **Q: Qualcuno può vedere i miei dati?**

**A:** Dipende dai **permessi**:
- **Admin**: Vede tutti i dati
- **Utente**: Vede tutti i dati (fatture, clienti)
- **Visitatore**: Vede in sola lettura

**Non c'è isolamento per utente** (tutti vedono tutto). Se serve isolamento, serve una configurazione custom.

---

## 💡 Funzionalità Generali

### **Q: Posso personalizzare i campi delle fatture?**

**A:** Dipende dalla configurazione del sistema. Alcune versioni permettono campi custom.

Contatta l'**amministratore** o il **fornitore del software** per info.

---

### **Q: C'è un limite al numero di utenti?**

**A:** **NO**, nessun limite applicativo.

Il limite dipende dalle **licenze del database** (SQL Server ha limiti in base all'edizione).

---

### **Q: Posso stampare una fattura?**

**A:** La stampa dipende dalla versione:
- Alcune versioni hanno funzione "Stampa" o "PDF"
- Altrimenti, usa il browser: **File → Stampa** (Ctrl+P)

---

### **Q: I dati vengono salvati automaticamente?**

**A:** **NO**, devi cliccare **"Salva"** esplicitamente.

**Non c'è auto-save**. Se chiudi la finestra senza salvare, perdi i dati.

---

### **Q: Posso annullare una modifica?**

**A:** Una volta cliccato **"Salva"**, la modifica è **permanente**.

**Non c'è "Undo"**. Fai attenzione prima di salvare!

Se serve, puoi:
- Modificare nuovamente il record
- Chiedere all'admin di recuperare da backup (se disponibile)

---

### **Q: Come faccio a vedere le fatture eliminate?**

**A:** **Solo Admin** può accedere alla sezione **"Fatture Eliminate"** o **"Cestino"**.

Gli utenti normali non vedono le fatture eliminate.

---

### **Q: C'è un'app mobile?**

**A:** **No**, non c'è un'app nativa iOS/Android.

**MA:** Loginet funziona benissimo nel **browser mobile** (responsive design).

Usa Safari (iOS) o Chrome (Android) per accedere.

---

### **Q: Posso integrare Loginet con altri software (Excel, ERP, etc.)?**

**A:** **Esportazione:** Sì, via CSV/Excel

**Integrazione API:** Dipende dalla versione. Alcune versioni potrebbero avere API per integrazioni custom.

Contatta il fornitore per info su integrazioni avanzate.

---

## 📞 Altre Domande?

### **Non hai trovato la risposta?**

1. **Consulta le guide:**
   - [Guida Rapida](USER_GUIDE_QUICKSTART_IT.md)
   - [Guida Dettagliata](USER_GUIDE_DETAILED_IT.md)
   - [Risoluzione Problemi](TROUBLESHOOTING_USERS_IT.md)

2. **Contatta l'amministratore del sistema**

3. **Documentazione tecnica** (per IT): [Deployment Docs](../07-deployment/README.md)

---

## 🆕 Suggerire Nuove Domande

Se hai una domanda che **non è** in questa FAQ:
1. Contatta l'amministratore
2. Suggerisci di aggiungerla a questa FAQ

---

**[⬆ Torna all'indice](#-indice-categorie)**

**[📚 Torna alla documentazione utente](README.md)**

**[🏠 Torna all'indice principale](../README.md)**
