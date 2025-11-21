# 🚀 Guida Rapida Utente - Loginet

**Sistema di Gestione Fatture Loginet**

**Versione:** 2.0
**Tempo di lettura:** 15 minuti
**Ultimo aggiornamento:** 21 Novembre 2025

---

## 👋 Benvenuto in Loginet!

Loginet è un sistema completo per la gestione delle fatture e dei clienti. Questa guida rapida ti aiuterà a iniziare in pochi minuti.

### **Cosa puoi fare con Loginet:**
- ✅ Creare e gestire fatture
- ✅ Gestire l'anagrafica clienti
- ✅ Visualizzare fatture su calendario
- ✅ Esportare dati in formato CSV/Excel
- ✅ Cercare e filtrare fatture avanzato
- ✅ Recuperare fatture eliminate (soft delete)

---

## 🔐 Primo Accesso

### **Scenario 1: Prima Installazione (Setup Wizard)**

Se questa è la **prima volta** che qualcuno accede al sistema:

1. **Apri il browser** e vai a: `http://tuoserver/setup-wizard.html`

2. **Compila il form di configurazione:**
   - **Nome Utente**: Scegli il nome per l'amministratore (minimo 3 caratteri)
   - **Password**: Almeno 8 caratteri
   - **Conferma Password**: Ripeti la password

3. **Clicca "Completa Configurazione"**

4. **Attendere il messaggio di successo** (circa 2 secondi)

5. **Verrai reindirizzato automaticamente** alla pagina di login

**⚠️ IMPORTANTE:** Il Setup Wizard può essere eseguito **solo una volta**. Dopo il completamento, i file vengono automaticamente eliminati per sicurezza.

**📖 Per dettagli completi:** Vedi [Guida Setup Wizard](../09-setup-settings/SETUP_WIZARD_GUIDE_IT.md)

---

### **Scenario 2: Login Normale**

Se il sistema è già configurato:

1. **Apri il browser** e vai a: `http://tuoserver/Index.html`

2. **Inserisci le tue credenziali:**
   - Nome utente
   - Password

3. **Clicca "Accedi"**

4. **Verrai reindirizzato alla dashboard principale**

**💡 Nota:** Se hai dimenticato la password, contatta l'amministratore del sistema.

---

## 🏠 Dashboard Principale

Dopo il login, vedrai la dashboard con:

### **Menu Principale (Sidebar):**
```
📊 Dashboard
📄 Fatture
👥 Clienti
📅 Calendario
👤 Utenti (solo Admin)
🚪 Logout
```

### **Barra Superiore:**
- Nome utente e ruolo (Admin/Utente/Visitatore)
- Pulsante logout
- Ricerca rapida

---

## 📄 Creare una Fattura

### **Passo 1: Aprire il Form**
1. Clicca su **"Fatture"** nel menu laterale
2. Clicca sul pulsante **"+ Nuova Fattura"**

### **Passo 2: Compilare i Campi**

**Campi Obbligatori (*):**
- **Numero Fattura**: Numero identificativo univoco (es: "FAT-2025-001")
- **Cliente**: Seleziona un cliente esistente (oppure creane uno nuovo)
- **Data Fattura**: Data di emissione
- **Importo**: Importo totale della fattura
- **Status**: Saldato / Non Saldato / Scaduto

**Campi Facoltativi:**
- **Note**: Note aggiuntive sulla fattura
- **Data Scadenza**: Scadenza pagamento
- **Altri campi**: Secondo la configurazione

### **Passo 3: Selezionare il Cliente**
- **Opzione A:** Inizia a digitare il nome del cliente → l'autocomplete ti suggerirà i clienti esistenti
- **Opzione B:** Se il cliente non esiste, prima [crea il cliente](#-creare-un-cliente)

### **Passo 4: Salvare**
1. Verifica che tutti i campi obbligatori siano compilati
2. Clicca **"Salva"**
3. Vedrai un messaggio di conferma: **"Fattura creata con successo"**

**✅ Fatto!** La fattura è ora visibile nell'elenco.

---

## 👥 Creare un Cliente

### **Passo 1: Aprire il Form**
1. Clicca su **"Clienti"** nel menu laterale
2. Clicca sul pulsante **"+ Nuovo Cliente"**

### **Passo 2: Inserire i Dati**

**Campi Obbligatori (*):**
- **Nome Cliente**: Ragione sociale o nome completo

**Campi Facoltativi:**
- Indirizzo
- Telefono
- Email
- Partita IVA / Codice Fiscale
- Altri campi (secondo la configurazione)

### **Passo 3: Salvare**
1. Clicca **"Salva"**
2. Messaggio di conferma: **"Cliente creato con successo"**

**✅ Fatto!** Il cliente è ora disponibile per essere associato alle fatture.

---

## 📋 Visualizzare e Modificare Fatture

### **Visualizzare l'Elenco Fatture**
1. Clicca su **"Fatture"** nel menu laterale
2. Vedrai una tabella con tutte le fatture

**Colonne della Tabella:**
- Numero Fattura
- Cliente
- Data Fattura
- Importo
- Status (con badge colorato)
- Azioni (Modifica / Elimina)

### **Filtrare le Fatture**
Usa i filtri nella parte superiore della tabella:
- **Per numero fattura**
- **Per cliente** (autocomplete)
- **Per status** (Saldato / Non Saldato / Scaduto)
- **Per intervallo di date**

### **Modificare una Fattura**
1. Trova la fattura nell'elenco
2. Clicca sul pulsante **"Modifica"** (icona matita)
3. Modifica i campi necessari
4. Clicca **"Salva"**

### **Eliminare una Fattura**
1. Trova la fattura nell'elenco
2. Clicca sul pulsante **"Elimina"** (icona cestino)
3. Conferma l'eliminazione

**💡 Nota:** Le fatture eliminate possono essere **recuperate** (soft delete). Contatta l'amministratore se necessario.

---

## 📅 Visualizzazione Calendario

### **Aprire il Calendario**
1. Clicca su **"Calendario"** nel menu laterale
2. Vedrai le fatture visualizzate come eventi sul calendario

### **Navigare il Calendario**
- **Mese/Settimana/Giorno**: Cambia la visualizzazione usando i pulsanti in alto
- **Navigazione**: Usa le frecce per spostarti tra i periodi
- **Oggi**: Torna alla data odierna

### **Interagire con gli Eventi**
- **Click su una fattura**: Mostra i dettagli
- **Colori**: Gli eventi sono colorati in base allo status (Saldato/Non Saldato/Scaduto)

---

## 📊 Esportare Dati (CSV/Excel)

### **Esportare Fatture**
1. Vai alla pagina **"Fatture"**
2. **(Opzionale)** Applica filtri per esportare solo alcune fatture
3. Clicca sul pulsante **"Esporta CSV"** o **"Esporta Excel"**
4. Il file verrà scaricato automaticamente

**Formato File CSV:**
- Separatore: Virgola (,)
- Codifica: UTF-8
- Include intestazioni colonne

**💡 Suggerimento:** Apri il file CSV con Excel, LibreOffice Calc, o Google Sheets.

---

## 🔍 Ricerca Avanzata

### **Ricerca Globale**
- Usa la **barra di ricerca** in alto
- Cerca per:
  - Numero fattura
  - Nome cliente
  - Importo
  - Note

### **Filtri Combinati**
Puoi combinare più filtri:
1. Filtra per status: **"Non Saldato"**
2. Filtra per intervallo date: **"Ultimo mese"**
3. Filtra per cliente: **"Cliente XYZ"**

**Risultato:** Vedrai solo le fatture che corrispondono a **tutti** i filtri applicati.

---

## 👤 Gestione Utenti (Solo per Amministratori)

**⚠️ Questa funzionalità è disponibile solo per utenti con ruolo "Admin".**

### **Visualizzare Utenti**
1. Clicca su **"Utenti"** nel menu laterale
2. Vedrai l'elenco di tutti gli utenti

### **Creare un Nuovo Utente**
1. Clicca **"+ Nuovo Utente"**
2. Inserisci:
   - Nome utente (univoco)
   - Password (minimo 8 caratteri)
   - Ruolo (Admin / Utente / Visitatore)
3. Clicca **"Salva"**

### **Ruoli Disponibili**
- **Admin**: Accesso completo (può gestire utenti, fatture, clienti)
- **Utente**: Può creare, modificare, eliminare fatture e clienti
- **Visitatore**: Può solo visualizzare (nessuna modifica)

### **Modificare/Eliminare Utente**
1. Trova l'utente nell'elenco
2. Usa i pulsanti **Modifica** o **Elimina**

**💡 Nota:** Non puoi eliminare l'utente con cui sei attualmente connesso.

---

## 🚪 Uscire dall'Applicazione (Logout)

### **Metodo 1: Menu Sidebar**
1. Clicca su **"Logout"** nel menu laterale

### **Metodo 2: Barra Superiore**
1. Clicca sull'icona **utente** in alto a destra
2. Seleziona **"Logout"**

**Verrai reindirizzato alla pagina di login.**

**🔒 Importante:** Fai sempre logout quando finisci di lavorare, specialmente su computer condivisi.

---

## ⌨️ Scorciatoie da Tastiera

| Combinazione | Azione |
|--------------|--------|
| `Ctrl + N` | Nuova Fattura |
| `Ctrl + S` | Salva (quando in form) |
| `Esc` | Chiudi modale/popup |
| `Ctrl + F` | Ricerca rapida |

---

## 🆘 Problemi Comuni

### **"Non riesco ad accedere"**
- ✅ Verifica che username e password siano corretti
- ✅ Controlla il MAIUSCOLO sulla tastiera
- ✅ Se continui ad avere problemi, contatta l'amministratore

### **"Il cliente non appare nell'autocomplete"**
- ✅ Assicurati di aver creato il cliente prima
- ✅ Prova a digitare almeno 2-3 caratteri
- ✅ Aggiorna la pagina (F5)

### **"Errore durante il salvataggio"**
- ✅ Verifica che tutti i campi obbligatori (*) siano compilati
- ✅ Controlla il formato dei dati (es: importo deve essere numerico)
- ✅ Verifica che il numero fattura non sia duplicato

### **"Il pulsante 'Utenti' non è visibile"**
- ✅ Questa funzionalità è disponibile solo per utenti **Admin**
- ✅ Contatta un amministratore se necessiti di gestire utenti

---

## 📚 Risorse Aggiuntive

### **Per Saperne di Più:**
- **[Guida Dettagliata Utente](USER_GUIDE_DETAILED_IT.md)** - Manuale completo con tutte le funzionalità
- **[Guida Setup Wizard](../09-setup-settings/SETUP_WIZARD_GUIDE_IT.md)** - Configurazione iniziale
- **[FAQ](FAQ_IT.md)** - Domande frequenti
- **[Risoluzione Problemi](TROUBLESHOOTING_USERS_IT.md)** - Problemi comuni e soluzioni

### **Per Amministratori:**
- [Guida Deployment](../07-deployment/README.md) (English)
- [Guida Sicurezza](../07-deployment/SECURITY_HARDENING.md) (English)

---

## 📞 Supporto

**Hai bisogno di aiuto?**
1. Consulta la [FAQ](FAQ_IT.md)
2. Leggi la [Guida Dettagliata](USER_GUIDE_DETAILED_IT.md)
3. Contatta il tuo amministratore di sistema

---

## ✅ Prossimi Passi

Ora che conosci le basi, puoi:
1. ✅ Creare le tue prime fatture
2. ✅ Aggiungere i tuoi clienti
3. ✅ Esplorare la visualizzazione calendario
4. ✅ Provare la ricerca avanzata
5. ✅ Leggere la [Guida Dettagliata](USER_GUIDE_DETAILED_IT.md) per funzionalità avanzate

---

**Buon lavoro con Loginet! 🚀**

---

**[⬆ Torna su](#-guida-rapida-utente---loginet)**

**[📚 Torna all'indice documentazione](../README.md)**
