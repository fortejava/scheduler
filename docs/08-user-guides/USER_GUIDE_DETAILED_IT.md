# 📖 Guida Dettagliata Utente - Loginet

**Sistema Completo di Gestione Fatture**

**Versione:** 2.0
**Livello:** Dettagliato
**Tempo di lettura:** 45-60 minuti
**Ultimo aggiornamento:** 21 Novembre 2025

---

## 📚 Indice

### [Parte 1: Introduzione](#parte-1-introduzione)
- [Cos'è Loginet](#cosè-loginet)
- [Caratteristiche Principali](#caratteristiche-principali)
- [Ruoli Utente](#ruoli-utente)

### [Parte 2: Primi Passi](#parte-2-primi-passi)
- [Configurazione Iniziale](#configurazione-iniziale)
- [Login e Accesso](#login-e-accesso)
- [Interfaccia Utente](#interfaccia-utente)

### [Parte 3: Gestione Fatture](#parte-3-gestione-fatture)
- [Visualizzare Fatture](#visualizzare-fatture)
- [Creare Nuova Fattura](#creare-nuova-fattura)
- [Modificare Fattura](#modificare-fattura)
- [Eliminare e Recuperare Fatture](#eliminare-e-recuperare-fatture)
- [Stati Fattura](#stati-fattura)

### [Parte 4: Gestione Clienti](#parte-4-gestione-clienti)
- [Visualizzare Clienti](#visualizzare-clienti)
- [Creare Nuovo Cliente](#creare-nuovo-cliente)
- [Modificare Cliente](#modificare-cliente)
- [Eliminare Cliente](#eliminare-cliente)
- [Ricerca Clienti](#ricerca-clienti)

### [Parte 5: Calendario](#parte-5-calendario)
- [Visualizzazione Calendario](#visualizzazione-calendario)
- [Navigazione](#navigazione-calendario)
- [Eventi e Interazioni](#eventi-e-interazioni)

### [Parte 6: Esportazione Dati](#parte-6-esportazione-dati)
- [Esportare CSV](#esportare-csv)
- [Esportare Excel](#esportare-excel)
- [Filtri Pre-Esportazione](#filtri-pre-esportazione)

### [Parte 7: Ricerca e Filtri](#parte-7-ricerca-e-filtri)
- [Ricerca Rapida](#ricerca-rapida)
- [Filtri Avanzati](#filtri-avanzati)
- [Combinazione Filtri](#combinazione-filtri)

### [Parte 8: Gestione Utenti](#parte-8-gestione-utenti-admin)
- [Visualizzare Utenti](#visualizzare-utenti)
- [Creare Utente](#creare-utente)
- [Modificare Utente](#modificare-utente)
- [Gestione Ruoli](#gestione-ruoli)

### [Parte 9: Funzionalità Avanzate](#parte-9-funzionalità-avanzate)
- [Autocomplete Intelligente](#autocomplete-intelligente)
- [Soft Delete](#soft-delete-recupero-dati)
- [Validazione Dati](#validazione-dati)

### [Parte 10: Best Practices](#parte-10-best-practices)
- [Organizzazione Dati](#organizzazione-dati)
- [Sicurezza](#sicurezza)
- [Performance](#performance)

---

## Parte 1: Introduzione

### Cos'è Loginet

Loginet è un **sistema web-based professionale** per la gestione completa di fatture e clienti, progettato per piccole e medie imprese.

**Architettura:**
- Applicazione web moderna (ASP.NET + Bootstrap 5)
- Database SQL Server
- Interfaccia responsive (funziona su desktop, tablet, smartphone)
- Autenticazione sicura con BCrypt password hashing

**Accesso:**
- Browser web moderno (Chrome, Firefox, Edge)
- Connessione internet (o rete locale)
- Credenziali personali (username + password)

---

### Caratteristiche Principali

#### **✅ Gestione Fatture Completa**
- Creazione, modifica, eliminazione fatture
- Stati multipli (Saldato, Non Saldato, Scaduto)
- Soft delete (recupero fatture eliminate)
- Ricerca avanzata e filtri multipli
- Visualizzazione calendario
- Esportazione CSV/Excel

#### **✅ Gestione Clienti**
- Anagrafica clienti completa
- Ricerca intelligente con autocomplete
- Associazione fatture-clienti
- Modifica ed eliminazione controllata

#### **✅ Controllo Accessi (RBAC)**
- 3 livelli di autorizzazione: Admin, Utente, Visitatore
- Gestione utenti centralizzata (solo Admin)
- Sicurezza a livello endpoint

#### **✅ Esportazione Dati**
- Formato CSV (compatibile Excel/LibreOffice)
- Formato Excel nativo (XLSX)
- Filtri pre-esportazione
- Codifica UTF-8 per caratteri speciali

#### **✅ Interfaccia Moderna**
- Design responsive (mobile-friendly)
- Icone intuitive (Bootstrap Icons)
- Feedback visivo immediato
- Tooltip informativi

---

### Ruoli Utente

Loginet implementa un sistema di **controllo accessi basato sui ruoli (RBAC)**:

#### **1. Admin (Amministratore)**
**Permessi:**
- ✅ Gestione completa fatture (crea, modifica, elimina)
- ✅ Gestione completa clienti (crea, modifica, elimina)
- ✅ **Gestione utenti** (crea, modifica, elimina utenti)
- ✅ Accesso a tutte le funzionalità
- ✅ Esportazione dati

**Casi d'uso:**
- Titolare dell'azienda
- Responsabile IT
- Manager con accesso completo

#### **2. Utente (User)**
**Permessi:**
- ✅ Gestione completa fatture (crea, modifica, elimina)
- ✅ Gestione completa clienti (crea, modifica, elimina)
- ✅ Esportazione dati
- ❌ **NON può gestire utenti**

**Casi d'uso:**
- Operatori amministrativi
- Contabili
- Personale di back-office

#### **3. Visitatore (Visitor)**
**Permessi:**
- ✅ Visualizzare fatture (sola lettura)
- ✅ Visualizzare clienti (sola lettura)
- ✅ Ricerca e filtri
- ❌ **NON può creare/modificare/eliminare** nulla

**Casi d'uso:**
- Consulenti esterni
- Auditor
- Personale in formazione

---

## Parte 2: Primi Passi

### Configurazione Iniziale

#### **Prima Installazione: Setup Wizard**

Alla **prima installazione** del sistema, è necessario creare l'utente amministratore tramite il **Setup Wizard**.

**Passaggi:**

1. **Accedere al Setup Wizard:**
   ```
   http://tuoserver/setup-wizard.html
   ```

2. **Compilare il Form:**
   - **Nome Utente Amministratore**:
     - Minimo 3 caratteri
     - Massimo 100 caratteri
     - Univoco nel sistema

   - **Password**:
     - Minimo 8 caratteri
     - Consigliato: mix di lettere, numeri, simboli
     - Memorizzare in modo sicuro

   - **Conferma Password**:
     - Deve corrispondere esattamente alla password

3. **Completare la Configurazione:**
   - Clicca **"Completa Configurazione"**
   - Attendi il messaggio di successo (2 secondi)
   - Verrai reindirizzato automaticamente al login

**🔒 Nota Sicurezza:** Il Setup Wizard si **auto-elimina** dopo il primo utilizzo. Questo è un comportamento di sicurezza intenzionale.

**📖 Guida Completa:** [Setup Wizard Guide](../09-setup-settings/SETUP_WIZARD_GUIDE_IT.md)

---

### Login e Accesso

#### **Procedura di Login Standard**

1. **Aprire la Pagina di Login:**
   ```
   http://tuoserver/Index.html
   ```

2. **Inserire Credenziali:**
   - Campo **"Nome Utente"**: Inserisci il tuo username
   - Campo **"Password"**: Inserisci la tua password
   - *(Opzionale)* **"Ricordami"**: Mantieni la sessione attiva più a lungo

3. **Accedere:**
   - Clicca il pulsante **"Accedi"** o premi `Enter`

4. **Dashboard:**
   - Se le credenziali sono corrette, verrai reindirizzato alla dashboard

**Errori Comuni:**
- **"Credenziali non valide"**: Username o password errati
- **"Sessione scaduta"**: Effettua nuovamente il login
- **"Utente non autorizzato"**: L'account potrebbe essere disabilitato (contatta admin)

---

### Interfaccia Utente

#### **Layout Principale**

```
┌─────────────────────────────────────────────────────┐
│  [BARRA SUPERIORE]                        [Utente] │
├──────────┬──────────────────────────────────────────┤
│  SIDEBAR │  AREA PRINCIPALE                         │
│          │                                           │
│ Dashboard│  [Contenuto pagina]                      │
│ Fatture  │                                           │
│ Clienti  │                                           │
│ Calendario│                                          │
│ Utenti   │                                           │
│          │                                           │
│ [Logout] │                                           │
└──────────┴──────────────────────────────────────────┘
```

#### **Componenti UI**

**1. Barra Superiore (Navbar):**
- Logo Loginet
- Titolo pagina corrente
- Info utente (nome + ruolo)
- Ricerca rapida
- Notifiche (se abilitate)

**2. Sidebar (Menu Laterale):**
- **Dashboard** 📊: Panoramica generale
- **Fatture** 📄: Gestione fatture
- **Clienti** 👥: Gestione clienti
- **Calendario** 📅: Vista calendario
- **Utenti** 👤: Gestione utenti (solo Admin)
- **Logout** 🚪: Uscita sicura

**3. Area Principale:**
- Contenuto dinamico in base alla sezione selezionata
- Tabelle, form, calendario, dashboard

**4. Footer:**
- Informazioni versione
- Copyright
- Link utili

---

## Parte 3: Gestione Fatture

### Visualizzare Fatture

#### **Accedere all'Elenco Fatture**

1. Clicca su **"Fatture"** nel menu laterale
2. Vedrai la **tabella fatture** con tutte le fatture del sistema

#### **Colonne della Tabella**

| Colonna | Descrizione | Formato |
|---------|-------------|---------|
| **#** | Numero progressivo | 1, 2, 3... |
| **Numero Fattura** | Identificativo fattura | FAT-2025-001 |
| **Cliente** | Nome cliente associato | Cliente XYZ |
| **Data Fattura** | Data emissione | 15/11/2025 |
| **Data Scadenza** | Data scadenza pagamento | 15/12/2025 |
| **Importo** | Importo totale | €1.500,00 |
| **Status** | Stato fattura | Badge colorato |
| **Azioni** | Pulsanti operazioni | Modifica / Elimina |

#### **Badge Status**

Gli stati sono visualizzati con badge colorati:

- 🟢 **Saldato** (Verde): Pagamento completato
- 🔴 **Non Saldato** (Rosso): Pagamento da ricevere
- 🟠 **Scaduto** (Arancione): Scadenza superata

#### **Paginazione**

Se ci sono molte fatture:
- **Righe per pagina**: Scegli 10 / 25 / 50 / 100
- **Navigazione**: Usa i pulsanti `< 1 2 3 >`
- **Info**: "Visualizzando 1-10 di 150 fatture"

#### **Ordinamento Colonne**

Clicca sull'**intestazione colonna** per ordinare:
- **Primo click**: Ordine crescente (A→Z, 0→9)
- **Secondo click**: Ordine decrescente (Z→A, 9→0)
- **Icona**: Freccia su/giù indica l'ordinamento attivo

---

### Creare Nuova Fattura

#### **Passo 1: Aprire il Form**

1. Nella pagina **"Fatture"**, clicca il pulsante **"+ Nuova Fattura"** (in alto a destra)
2. Si apre un **modale/popup** con il form

#### **Passo 2: Compilare i Campi Obbligatori**

**Campi Obbligatori (*)**

1. **Numero Fattura** (*)
   - Identificativo univoco
   - Formato: Libero (es: FAT-2025-001, 2025/0001, etc.)
   - **Errore se duplicato**: "Numero fattura già esistente"

2. **Cliente** (*)
   - Seleziona da elenco clienti esistenti
   - **Autocomplete**: Inizia a digitare → suggerimenti
   - Se il cliente non esiste: [Crea prima il cliente](#creare-nuovo-cliente)

3. **Data Fattura** (*)
   - Data di emissione
   - **Formato**: gg/mm/aaaa
   - **Date Picker**: Clicca l'icona calendario per selezionare

4. **Importo** (*)
   - Importo totale della fattura
   - **Formato**: Numero decimale (es: 1500.00)
   - **Separatore decimale**: Punto o virgola (automatico)
   - **Validazione**: Solo numeri positivi

5. **Status** (*)
   - Seleziona uno stato:
     - **Saldato**: Pagamento ricevuto
     - **Non Saldato**: In attesa di pagamento
     - **Scaduto**: Scadenza superata senza pagamento

#### **Passo 3: Campi Facoltativi**

**Campi Opzionali**

1. **Data Scadenza**
   - Data limite per il pagamento
   - Se non specificata: nessuna scadenza

2. **Note**
   - Campo testo libero
   - Informazioni aggiuntive sulla fattura
   - Massimo 500 caratteri (tipico)

3. **Altri Campi**
   - Possono variare in base alla configurazione del sistema
   - Consultare l'amministratore per dettagli

#### **Passo 4: Salvare**

1. Verifica che tutti i campi obbligatori (*) siano compilati
2. Clicca **"Salva"**

**Risultato:**
- ✅ **Successo**: Messaggio "Fattura creata con successo"
- ❌ **Errore**: Messaggio specifico (es: "Campo obbligatorio mancante")

#### **Passo 5: Verifica**

Dopo il salvataggio:
- Il modale si chiude automaticamente
- La nuova fattura appare nella tabella
- Puoi trovarla usando la ricerca o i filtri

---

### Modificare Fattura

#### **Aprire il Form di Modifica**

1. Trova la fattura nella tabella
2. Clicca il pulsante **"Modifica"** (icona matita 📝)
3. Si apre il form pre-compilato con i dati attuali

#### **Modificare i Campi**

1. Modifica i campi che desideri cambiare
2. **Note**:
   - Puoi modificare **qualsiasi campo** (anche obbligatori)
   - Il **Numero Fattura** può essere modificato (ma deve rimanere univoco)
   - Il **Cliente** può essere cambiato (usa autocomplete)

#### **Salvare le Modifiche**

1. Clicca **"Salva"**
2. Messaggio di conferma: "Fattura aggiornata con successo"

**⚠️ Attenzione:** Le modifiche sono **immediate** e **permanenti**.

---

### Eliminare e Recuperare Fatture

#### **Eliminare una Fattura (Soft Delete)**

Loginet utilizza il **soft delete**: le fatture eliminate non vengono cancellate fisicamente dal database, ma solo "nascoste".

**Procedura:**

1. Trova la fattura nella tabella
2. Clicca il pulsante **"Elimina"** (icona cestino 🗑️)
3. **Conferma l'eliminazione** nel popup
4. Messaggio: "Fattura eliminata con successo"

**Risultato:**
- La fattura scompare dalla vista normale
- Può essere recuperata da un amministratore

#### **Recuperare Fatture Eliminate** (Admin)

**⚠️ Funzionalità riservata agli amministratori**

1. Vai alla sezione **"Fatture Eliminate"** o **"Cestino"**
2. Trova la fattura eliminata
3. Clicca **"Ripristina"**
4. La fattura torna visibile nell'elenco normale

**📖 Nota Tecnica:** Il soft delete è implementato con un flag `IsDeleted` nel database.

---

### Stati Fattura

#### **3 Stati Disponibili**

**1. Saldato 🟢**
- **Significato**: Pagamento ricevuto e completato
- **Colore Badge**: Verde
- **Comportamento**: Fattura considerata "chiusa"

**2. Non Saldato 🔴**
- **Significato**: In attesa di pagamento
- **Colore Badge**: Rosso
- **Comportamento**: Fattura "aperta", pagamento da ricevere

**3. Scaduto 🟠**
- **Significato**: Scadenza superata senza pagamento
- **Colore Badge**: Arancione
- **Comportamento**: Richiede attenzione (sollecito?)

#### **Cambio Stato**

Per cambiare lo stato di una fattura:
1. **Modifica la fattura**
2. Cambia il campo **"Status"**
3. **Salva**

**💡 Suggerimento:** Usa lo stato "Scaduto" per tenere traccia delle fatture che richiedono follow-up.

---

## Parte 4: Gestione Clienti

### Visualizzare Clienti

#### **Accedere all'Elenco Clienti**

1. Clicca su **"Clienti"** nel menu laterale
2. Vedrai la **tabella clienti**

#### **Colonne della Tabella**

| Colonna | Descrizione |
|---------|-------------|
| **#** | Numero progressivo |
| **Nome Cliente** | Ragione sociale / Nome completo |
| **Indirizzo** | Indirizzo completo (se presente) |
| **Telefono** | Numero di telefono (se presente) |
| **Email** | Email (se presente) |
| **Fatture** | Numero fatture associate |
| **Azioni** | Modifica / Elimina |

---

### Creare Nuovo Cliente

#### **Procedura**

1. Nella pagina **"Clienti"**, clicca **"+ Nuovo Cliente"**
2. Compila il form:

**Campi Obbligatori (*)**
- **Nome Cliente**: Ragione sociale o nome completo

**Campi Facoltativi**
- Indirizzo
- Città
- CAP
- Provincia
- Telefono
- Email
- Partita IVA
- Codice Fiscale
- Note

3. Clicca **"Salva"**

**✅ Risultato:** Cliente creato e disponibile per essere associato alle fatture.

---

### Modificare Cliente

1. Trova il cliente nella tabella
2. Clicca **"Modifica"** (icona matita)
3. Modifica i campi necessari
4. Clicca **"Salva"**

**⚠️ Nota:** La modifica del nome cliente si rifletterà automaticamente su tutte le fatture associate.

---

### Eliminare Cliente

1. Trova il cliente nella tabella
2. Clicca **"Elimina"** (icona cestino)
3. **Conferma l'eliminazione**

**⚠️ ATTENZIONE:**
- Se il cliente ha **fatture associate**, potresti ricevere un errore
- In questo caso:
  - **Opzione A**: Elimina prima tutte le fatture del cliente
  - **Opzione B**: Riassegna le fatture ad un altro cliente (se possibile)
  - **Opzione C**: Non eliminare (mantieni il cliente nel sistema)

---

### Ricerca Clienti

#### **Ricerca per Nome**

Nella pagina Clienti:
1. Usa il campo di ricerca in alto
2. Digita parte del nome del cliente
3. I risultati si filtrano **in tempo reale** (live search)

#### **Autocomplete nelle Fatture**

Quando crei/modifichi una fattura:
1. Nel campo **"Cliente"**, inizia a digitare
2. Appare un **dropdown con suggerimenti**
3. Seleziona il cliente desiderato

**Caratteristiche Autocomplete:**
- Ricerca **case-insensitive** (maiuscole/minuscole irrilevanti)
- Ricerca **parziale** (trova "Cliente" anche digitando "cli")
- Mostra fino a **10 risultati** più rilevanti
- Evidenzia la parte del testo che corrisponde

---

## Parte 5: Calendario

### Visualizzazione Calendario

#### **Accedere al Calendario**

1. Clicca su **"Calendario"** nel menu laterale
2. Vedrai le fatture visualizzate come **eventi** sul calendario

#### **Layout Calendario**

Il calendario utilizza **FullCalendar** con le seguenti viste:
- **Mese**: Vista mensile completa
- **Settimana**: Vista settimanale dettagliata
- **Giorno**: Vista giornaliera con orari
- **Agenda**: Lista cronologica eventi

---

### Navigazione Calendario

#### **Controlli di Navigazione**

**Barra Superiore Calendario:**
```
[Oggi] [<] [Novembre 2025] [>]  [Mese|Settimana|Giorno]
```

**Pulsanti:**
- **Oggi**: Torna alla data odierna
- **< >**: Naviga periodo precedente/successivo
- **Mese / Settimana / Giorno**: Cambia vista

#### **Scorciatoie**

- `Spazio`: Vai a oggi
- `← →`: Naviga avanti/indietro
- `1 2 3 4`: Cambia vista (1=Mese, 2=Settimana, etc.)

---

### Eventi e Interazioni

#### **Eventi sul Calendario**

Ogni **fattura** appare come un **evento** sul calendario:
- **Data evento**: Data fattura
- **Colore evento**: In base allo status
  - 🟢 Verde: Saldato
  - 🔴 Rosso: Non Saldato
  - 🟠 Arancione: Scaduto

#### **Interazioni**

**Click su evento:**
1. Si apre un **tooltip/popup** con:
   - Numero fattura
   - Cliente
   - Importo
   - Status
   - Pulsanti: Visualizza / Modifica

**Drag & Drop** (se abilitato):
- Trascina un evento per cambiare la data fattura
- Rilascia per salvare automaticamente

---

## Parte 6: Esportazione Dati

### Esportare CSV

#### **Procedura**

1. Vai alla pagina **"Fatture"**
2. **(Opzionale)** Applica **filtri** per esportare solo alcune fatture
3. Clicca il pulsante **"Esporta CSV"**
4. Il browser scarica automaticamente il file: `fatture_YYYYMMDD_HHMMSS.csv`

#### **Formato CSV**

**Caratteristiche:**
- **Separatore**: Virgola (`,`)
- **Codifica**: UTF-8 (supporta caratteri accentati)
- **Intestazione**: Prima riga contiene nomi colonne
- **Quote**: Campi con virgole sono racchiusi tra virgolette

**Esempio:**
```csv
NumeroFattura,Cliente,DataFattura,Importo,Status
FAT-2025-001,"Cliente XYZ Srl",15/11/2025,1500.00,Saldato
FAT-2025-002,"Azienda, ABC SpA",16/11/2025,2300.50,Non Saldato
```

#### **Aprire il CSV**

**Con Microsoft Excel:**
1. Apri Excel
2. File → Apri → Seleziona il file CSV
3. Se i caratteri non appaiono correttamente:
   - Dati → Da testo/CSV
   - Scegli codifica **UTF-8**
   - Importa

**Con LibreOffice Calc:**
1. Apri Calc
2. File → Apri → Seleziona il file CSV
3. Nella finestra di import:
   - Codifica caratteri: **UTF-8**
   - Separatore: **Virgola**
   - OK

**Con Google Sheets:**
1. Apri Google Drive
2. Nuovo → Carica file
3. Seleziona il CSV
4. Apri con Google Sheets

---

### Esportare Excel

#### **Procedura**

1. Vai alla pagina **"Fatture"**
2. **(Opzionale)** Applica filtri
3. Clicca il pulsante **"Esporta Excel"**
4. Il browser scarica il file: `fatture_YYYYMMDD_HHMMSS.xlsx`

#### **Formato Excel (XLSX)**

**Vantaggi rispetto a CSV:**
- ✅ Formattazione preservata (colori, font, bordi)
- ✅ Colonne larghezze automatiche
- ✅ Intestazione in grassetto
- ✅ Formati numerici/data corretti
- ✅ Nessun problema di codifica caratteri

**Apri direttamente con Microsoft Excel, LibreOffice Calc, o Google Sheets.**

---

### Filtri Pre-Esportazione

**💡 Suggerimento:** Applica i filtri **prima** di esportare per ottenere solo i dati desiderati.

**Esempi:**

**Scenario 1: Esportare solo fatture non saldate**
1. Applica filtro **Status = "Non Saldato"**
2. Clicca **"Esporta CSV"**
3. Il file conterrà solo le fatture non saldate

**Scenario 2: Esportare fatture di un cliente specifico**
1. Filtro **Cliente = "Cliente XYZ"**
2. Clicca **"Esporta Excel"**
3. Il file conterrà solo le fatture di quel cliente

**Scenario 3: Esportare fatture per periodo**
1. Filtro **Data Da: 01/11/2025**
2. Filtro **Data A: 30/11/2025**
3. Esporta
4. Fatture di novembre 2025

---

## Parte 7: Ricerca e Filtri

### Ricerca Rapida

#### **Ricerca Globale (Barra Superiore)**

La barra di ricerca in alto permette di cercare in **tutte** le sezioni:
1. Digita nel campo di ricerca
2. Premi `Enter` o clicca l'icona lente
3. Vedrai i risultati da:
   - Fatture (numero, cliente, note)
   - Clienti (nome, email, telefono)

---

### Filtri Avanzati

#### **Filtri Fatture**

Nella pagina **"Fatture"**, trovi i filtri nella parte superiore:

**1. Filtro per Numero Fattura**
- Campo: Testo libero
- Ricerca: Parziale (es: "FAT" trova "FAT-2025-001")

**2. Filtro per Cliente**
- Campo: Autocomplete
- Digita per vedere suggerimenti

**3. Filtro per Status**
- Dropdown: Tutti / Saldato / Non Saldato / Scaduto

**4. Filtro per Data**
- **Data Da**: Data inizio periodo
- **Data A**: Data fine periodo
- Entrambi opzionali

**5. Filtro per Importo**
- **Importo Min**: Minimo importo
- **Importo Max**: Massimo importo

---

### Combinazione Filtri

**I filtri si possono combinare** per ricerche molto specifiche.

**Esempio Pratico:**

**Obiettivo:** Trovare tutte le fatture non saldate del cliente "ABC Srl" emesse a novembre 2025 con importo superiore a €1000.

**Filtri da applicare:**
1. **Status**: Non Saldato
2. **Cliente**: ABC Srl
3. **Data Da**: 01/11/2025
4. **Data A**: 30/11/2025
5. **Importo Min**: 1000

**Risultato:** Solo le fatture che soddisfano **tutti** i criteri.

**Pulsante "Reset Filtri":** Rimuove tutti i filtri e mostra tutte le fatture.

---

## Parte 8: Gestione Utenti (Admin)

**⚠️ Questa sezione è accessibile solo agli utenti con ruolo "Admin".**

### Visualizzare Utenti

1. Clicca su **"Utenti"** nel menu laterale
2. Vedrai la tabella con tutti gli utenti del sistema

**Colonne:**
- Nome Utente
- Ruolo (Admin / Utente / Visitatore)
- Data Creazione
- Ultimo Accesso
- Azioni (Modifica / Elimina)

---

### Creare Utente

#### **Procedura**

1. Nella pagina **"Utenti"**, clicca **"+ Nuovo Utente"**
2. Compila il form:

**Campi Obbligatori (*)**
- **Nome Utente**: Univoco nel sistema (3-100 caratteri)
- **Password**: Minimo 8 caratteri
- **Conferma Password**: Deve corrispondere
- **Ruolo**: Seleziona Admin / Utente / Visitatore

3. Clicca **"Salva"**

**✅ Risultato:** Nuovo utente creato e attivo.

#### **Note sulla Password**

- Le password sono **hashate con BCrypt** (sicurezza massima)
- **Non sono recuperabili** (solo reset possibile)
- Consiglia all'utente di **annotare la password** al primo accesso

---

### Modificare Utente

1. Trova l'utente nella tabella
2. Clicca **"Modifica"**
3. Puoi modificare:
   - **Ruolo** (cambiare permessi)
   - **Password** (reset password)

**⚠️ Cambio Ruolo:**
- **Effetto immediato**: L'utente avrà nuovi permessi al prossimo login
- **Admin → Utente**: Perde accesso a gestione utenti
- **Utente → Visitatore**: Perde capacità di modifica

---

### Gestione Ruoli

#### **Assegnare il Ruolo Corretto**

**Linee Guida:**

**Assegna "Admin" se:**
- ✅ L'utente deve gestire altri utenti
- ✅ Ha responsabilità complete sul sistema
- ✅ È affidabile (accesso completo)

**Assegna "Utente" se:**
- ✅ Deve lavorare con fatture e clienti
- ✅ NON deve gestire altri utenti
- ✅ Operatore quotidiano del sistema

**Assegna "Visitatore" se:**
- ✅ Deve solo consultare i dati
- ✅ Non deve modificare nulla
- ✅ Accesso temporaneo o limitato

#### **🔒 Principio del Minimo Privilegio**

**Best Practice:** Assegna sempre il **livello di accesso minimo** necessario. Non dare ruolo "Admin" se non strettamente necessario.

---

## Parte 9: Funzionalità Avanzate

### Autocomplete Intelligente

#### **Come Funziona**

L'autocomplete è attivo su:
- **Campo Cliente** (quando crei/modifichi fattura)
- **Filtro Cliente** (nella pagina fatture)

**Caratteristiche:**
1. **Ricerca Parziale**: "cli" trova "Cliente XYZ"
2. **Case-Insensitive**: "cliente" = "CLIENTE" = "Cliente"
3. **Ricerca all'inizio e in mezzo**: "xyz" trova "Cliente XYZ"
4. **Limite risultati**: Mostra i 10 più rilevanti
5. **Evidenziazione**: Parte corrispondente evidenziata

#### **Utilizzo Ottimale**

**Suggerimenti:**
- Digita almeno **2-3 caratteri** per risultati migliori
- Se hai molti clienti, sii **più specifico**
- Usa **parole chiave univoche** (es: ragione sociale completa)

---

### Soft Delete (Recupero Dati)

#### **Cos'è il Soft Delete?**

Invece di eliminare **fisicamente** i record dal database, Loginet usa il **soft delete**:
- Il record rimane nel database
- Viene marcato come "eliminato" (flag `IsDeleted = true`)
- Non appare nelle viste normali
- Può essere **recuperato** da un amministratore

#### **Vantaggi**

✅ **Sicurezza**: Errore di eliminazione reversibile
✅ **Audit**: Storico completo delle operazioni
✅ **Compliance**: Requisiti legali di conservazione dati
✅ **Recovery**: Ripristino rapido in caso di necessità

#### **Come Recuperare**

**(Admin Only)**
1. Vai alla sezione **"Fatture Eliminate"** o **"Cestino"**
2. Trova la fattura eliminata
3. Clicca **"Ripristina"**
4. La fattura torna visibile

---

### Validazione Dati

#### **Validazione Lato Client (Browser)**

**Prima di inviare al server**, il browser verifica:
- ✅ Campi obbligatori compilati
- ✅ Formati corretti (email, numeri, date)
- ✅ Lunghezza minima/massima testi

**Feedback Immediato:**
- Bordo rosso su campo invalido
- Messaggio errore sotto il campo
- Pulsante "Salva" disabilitato se form non valido

#### **Validazione Lato Server (Backend)**

**Anche se superi la validazione client**, il server verifica:
- ✅ Univocità numero fattura
- ✅ Esistenza cliente selezionato
- ✅ Sicurezza (XSS, SQL injection)
- ✅ Autorizzazioni utente

**Se fallisce:** Messaggio di errore specifico.

#### **Messaggi di Errore Comuni**

| Errore | Significato | Soluzione |
|--------|-------------|-----------|
| "Campo obbligatorio" | Manca un campo (*) | Compila il campo |
| "Numero fattura già esistente" | Duplicato | Cambia numero |
| "Cliente non trovato" | Cliente eliminato/non esiste | Seleziona altro cliente |
| "Importo deve essere positivo" | Numero negativo | Inserisci valore > 0 |
| "Formato data non valido" | Data errata | Usa gg/mm/aaaa |

---

## Parte 10: Best Practices

### Organizzazione Dati

#### **Nomenclatura Fatture**

**Consiglio:** Usa uno **schema consistente** per i numeri fattura.

**Esempi:**
- `FAT-2025-0001`, `FAT-2025-0002`, ... (Schema anno-progressivo)
- `2025/0001`, `2025/0002`, ... (Semplice)
- `FAT-202511-001`, ... (Anno-mese-progressivo)

**Vantaggi:**
- ✅ Ordinamento naturale
- ✅ Facile identificare anno
- ✅ Nessuna confusione

#### **Gestione Clienti**

**Consiglio:** Mantieni l'**anagrafica clienti pulita**.

**Best Practices:**
- ✅ **Nome univoco**: Evita duplicati (es: "Cliente XYZ Srl" e "XYZ Srl")
- ✅ **Dati completi**: Compila tutti i campi disponibili
- ✅ **Verifica periodica**: Controlla e aggiorna dati obsoleti

#### **Stati Fatture**

**Consiglio:** Usa gli stati in modo **consistente**.

**Linee Guida:**
- 🟢 **Saldato**: Solo quando pagamento **effettivamente ricevuto**
- 🔴 **Non Saldato**: Fattura emessa, pagamento atteso
- 🟠 **Scaduto**: Usa **solo dopo la scadenza**

---

### Sicurezza

#### **Password Sicure**

**Requisiti Minimi:**
- Minimo 8 caratteri
- Mix di lettere, numeri, simboli

**Raccomandazioni:**
- ✅ Usa un **password manager** (LastPass, 1Password, Bitwarden)
- ✅ Password **univoca** (non usare la stessa ovunque)
- ✅ Cambia periodicamente (ogni 3-6 mesi)
- ❌ NON scrivere su post-it
- ❌ NON condividere con altri

#### **Logout**

**Sempre fare logout** quando:
- ✅ Finisci di lavorare
- ✅ Ti allontani dal computer
- ✅ Computer condiviso/pubblico

**Scorciatoia:** Clicca **"Logout"** nel menu o premi `Ctrl+Shift+L` (se abilitato).

#### **Sessioni**

- Le sessioni hanno una **durata limitata** (tipicamente 30 giorni con "Ricordami", o 1 giorno senza)
- Dopo l'inattività, potresti essere disconnesso
- **Non preoccuparti**: I dati sono sempre salvati

---

### Performance

#### **Per Migliorare la Velocità**

**Suggerimenti:**

1. **Usa i Filtri:**
   - Se hai migliaia di fatture, filtra prima di visualizzare
   - Riduce il carico sulla pagina

2. **Paginazione:**
   - Non visualizzare "Tutte" le righe se sono molte
   - Usa 25 o 50 righe per pagina

3. **Ricerca Specifica:**
   - Ricerche specifiche sono più veloci di "mostra tutto"

4. **Browser Moderno:**
   - Usa Chrome, Firefox, o Edge aggiornati
   - Evita Internet Explorer

5. **Chiudi Tab Inutilizzate:**
   - Più tab aperti = browser più lento

---

## 🆘 Supporto e Risoluzione Problemi

### **Guide di Supporto**

- **[FAQ Utenti](FAQ_IT.md)** - Domande frequenti
- **[Risoluzione Problemi Utenti](TROUBLESHOOTING_USERS_IT.md)** - Problemi comuni
- **[Guida Setup Wizard](../09-setup-settings/SETUP_WIZARD_GUIDE_IT.md)** - Configurazione iniziale

### **Contatti**

**Hai bisogno di aiuto?**
1. Consulta le guide di supporto
2. Contatta l'**amministratore di sistema**
3. Apri un **ticket di supporto** (se disponibile)

---

## 📚 Risorse Correlate

### **Per Utenti:**
- [Guida Rapida](USER_GUIDE_QUICKSTART_IT.md) - 15 minuti
- [FAQ](FAQ_IT.md) - Domande frequenti
- [Risoluzione Problemi](TROUBLESHOOTING_USERS_IT.md)

### **Per Amministratori:**
- [Setup Wizard Guide](../09-setup-settings/SETUP_WIZARD_GUIDE_EN.md) (EN)
- [Settings Guide](../09-setup-settings/SETTINGS_GUIDE_EN.md) (EN)
- [Deployment Documentation](../07-deployment/README.md) (EN)
- [Security Hardening](../07-deployment/SECURITY_HARDENING.md) (EN)

---

## ✅ Conclusione

Ora hai una **conoscenza completa** di Loginet!

**Cosa puoi fare ora:**
- ✅ Gestire fatture in autonomia
- ✅ Gestire anagrafica clienti
- ✅ Usare il calendario
- ✅ Esportare dati
- ✅ Ricerca avanzata
- ✅ Gestire utenti (se Admin)

**Continua a esplorare** e scoprire le funzionalità!

---

**Buon lavoro con Loginet! 🎉**

---

**[⬆ Torna all'indice](#-indice)**

**[🏠 Torna alla documentazione](../README.md)**
