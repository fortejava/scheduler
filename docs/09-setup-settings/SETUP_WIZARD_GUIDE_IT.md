# 🔧 Guida al Setup Wizard - Loginet

**Configurazione Iniziale del Sistema**

**Versione:** 2.0
**Lingua:** Italiano
**Ultimo Aggiornamento:** 21 Novembre 2025

---

## 📖 Indice

1. [Cos'è il Setup Wizard?](#cosè-il-setup-wizard)
2. [Quando si Esegue?](#quando-si-esegue)
3. [Prerequisiti](#prerequisiti)
4. [Configurazione Passo-Passo](#configurazione-passo-passo)
5. [Funzionalità di Sicurezza](#funzionalità-di-sicurezza)
6. [Dopo il Completamento](#dopo-il-completamento)
7. [Disabilitare il Setup Wizard](#disabilitare-il-setup-wizard)
8. [Risoluzione Problemi](#risoluzione-problemi)

---

## Cos'è il Setup Wizard?

Il **Setup Wizard** è uno **strumento di configurazione iniziale** che crea il primo account amministratore per Loginet.

### **Scopo**

Quando Loginet viene installato per la prima volta, **non ci sono utenti** nel sistema. Il Setup Wizard:
- ✅ Crea il **primo utente Admin**
- ✅ Imposta il sistema come "configurato"
- ✅ Previene accessi non autorizzati
- ✅ **Si auto-elimina** dopo il completamento (caratteristica di sicurezza)

### **Caratteristiche Principali**

- **Uso singolo**: Può essere eseguito una sola volta
- **Accesso anonimo**: Non richiede login (solo per la configurazione iniziale)
- **Sicurezza prioritaria**: Auto-eliminazione dopo il completamento
- **Interfaccia semplice**: Form user-friendly
- **Attivazione immediata**: Utente Admin attivo dopo il completamento

---

## Quando si Esegue?

Il Setup Wizard si esegue **una sola volta** durante il deployment iniziale.

### **Condizioni di Attivazione**

Il wizard è **accessibile solo** quando:
- ✅ Loginet è appena stato deployato (prima installazione)
- ✅ Il flag del database `SystemConfig.SetupCompleted = 'false'` (o non esiste)
- ✅ Non esistono utenti nel sistema

### **URL di Accesso**

```
http://tuoserver/setup-wizard.html
```

**Dopo la configurazione, questo URL restituirà 404 (file eliminato).**

---

## Prerequisiti

### **Prima di Eseguire il Setup Wizard**

Assicurati che questi passaggi siano completati:

#### **1. Database Deployato**
- ✅ Database SQL Server creato
- ✅ Tabelle create (da DB.sql o script di migrazione)
- ✅ Dati iniziali caricati (Ruoli, Status, SystemConfig)

**Verifica:**
```sql
-- Controlla se le tabelle esistono
SELECT name FROM sys.tables;

-- Controlla tabella Roles
SELECT * FROM Roles;
-- Dovrebbe avere: Admin, User, Visitor

-- Controlla SystemConfig
SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted';
-- Dovrebbe essere 'false' o non esistere
```

#### **2. Applicazione Deployata**
- ✅ File dell'applicazione web copiati sul server
- ✅ IIS/Docker configurato e in esecuzione
- ✅ Connection string configurata correttamente

**Test:**
```
http://tuoserver/Index.html
```
Dovrebbe mostrare la pagina di login (ma non ci sono ancora utenti per accedere).

#### **3. Accesso Rete**
- ✅ Server raggiungibile dalla rete
- ✅ Firewall consente porta 80/443
- ✅ Il browser può accedere al server

---

## Configurazione Passo-Passo

### **Passo 1: Accedi al Setup Wizard**

1. Apri il tuo browser web
2. Vai a:
   ```
   http://tuoserver/setup-wizard.html
   ```

3. Dovresti vedere la pagina **"Configurazione Iniziale"**

**Descrizione Schermata:**
- Sfondo con gradiente viola
- Card bianca con form di configurazione
- Icone Bootstrap
- Testo in italiano

---

### **Passo 2: Compila il Form**

Il form ha **3 campi**:

#### **Campo 1: Nome Utente Amministratore**

**Requisiti:**
- Minimo: **3 caratteri**
- Massimo: **100 caratteri**
- Deve essere **unico** (non ci saranno conflitti alla prima esecuzione)

**Esempi:**
- ✅ `admin`
- ✅ `amministratore`
- ✅ `mario.rossi`
- ❌ `ab` (troppo corto)

**Suggerimenti:**
- Usa un nome utente professionale
- Evita spazi
- Minuscolo raccomandato

---

#### **Campo 2: Password**

**Requisiti:**
- Minimo: **8 caratteri**
- Nessun massimo
- Può contenere: lettere, numeri, simboli

**Raccomandazioni:**
- ✅ Combinazione di maiuscole e minuscole
- ✅ Includi numeri
- ✅ Includi simboli (!@#$%^&*)
- ✅ Usa un password manager

**Esempi:**
- ✅ `P@ssw0rd123!` (16 caratteri, forte)
- ✅ `MiaPasswordSicura2025!` (23 caratteri, forte)
- ❌ `password` (8 caratteri, debole)
- ❌ `12345678` (8 caratteri, molto debole)

---

#### **Campo 3: Conferma Password**

- Deve corrispondere **esattamente** al campo Password
- Validazione in tempo reale (mostra errore se non corrisponde)

---

### **Passo 3: Invia il Form**

1. **Rivedi** tutti i campi per correttezza
2. Clicca **"Completa Configurazione"**
3. Il pulsante mostrerà uno **spinner di caricamento**: "Configurazione in corso..."

---

### **Passo 4: Attendi il Messaggio di Successo**

**Se ha successo:**
- ✅ Alert verde: **"Configurazione completata con successo"**
- ✅ Messaggio mostra: "Utente amministratore creato"
- ✅ **Reindirizzamento automatico** a `Index.html` dopo 2 secondi

**Se errore:**
- ❌ Alert rosso con messaggio di errore
- Errori comuni:
  - "Il nome utente deve essere di almeno 3 caratteri"
  - "Le password non corrispondono"
  - "Setup già completato"

---

### **Passo 5: Accedi con il Nuovo Account Admin**

Dopo il reindirizzamento a `Index.html`:

1. **Inserisci le credenziali:**
   - Nome utente: Quello che hai appena creato
   - Password: Quella che hai appena creato

2. **Clicca "Accedi"**

3. **Sei dentro!** Vedrai la dashboard

**⚠️ Importante:** **Salva queste credenziali in modo sicuro!** Non c'è recupero password senza accesso admin.

---

## Funzionalità di Sicurezza

### **1. Uso Singolo**

**Protezione:** Il flag `SetupCompleted` previene riesecuzioni.

**Perché:** Impedisce agli attaccanti di creare nuovi account admin dopo la configurazione iniziale.

---

### **2. Eliminazione Automatica dei File (Sicurezza Tier 2A)**

**Cosa viene eliminato:**
- `setup-wizard.html` (frontend)
- `assets/js/setup-wizard.js` (logica JavaScript)

**Quando:** Immediatamente dopo la configurazione riuscita

**Perché:**
- ✅ Chiude il vettore di attacco
- ✅ Nessun modo di accedere all'URL del wizard dopo il completamento
- ✅ Riduce la superficie di attacco

**Fallback:** Se l'eliminazione automatica fallisce (permessi file), il flag previene comunque l'esecuzione.

---

### **3. Hashing Password BCrypt**

**Tecnologia:** BCrypt con generazione automatica del salt

**Benefici:**
- ✅ **Hash unidirezionale**: Impossibile invertire per ottenere la password
- ✅ **Salted**: Stessa password = hash diverso ogni volta
- ✅ **Lento per design**: Resistente ad attacchi brute-force
- ✅ **Standard industriale**: Ampiamente affidabile

**Esempio:**
```
Password: "P@ssw0rd123!"
Hash: "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

---

### **4. Accesso Anonimo (Controllato)**

**Perché permettere accesso anonimo?**
- Necessario per la configurazione iniziale (non esistono ancora utenti)

**Come è sicuro?**
- ✅ Funziona solo quando `SetupCompleted = false`
- ✅ Crea solo **un** utente (non può essere sfruttato per account multipli)
- ✅ I file si auto-eliminano dopo il completamento
- ✅ Il flag previene riesecuzioni

---

## Dopo il Completamento

### **Cosa Dovresti Fare Dopo**

#### **1. Verifica Accesso Admin**
- Accedi con l'account admin creato
- Controlla di poter accedere a tutte le funzionalità
- Verifica che il menu "Utenti" sia visibile (solo Admin)

#### **2. Crea Utenti Aggiuntivi**
- Vai al menu **"Utenti"**
- Crea utenti per il tuo team
- Assegna ruoli appropriati (Admin/User/Visitor)

#### **3. Configura Applicazione**
- Crea clienti iniziali
- Configura eventuali impostazioni personalizzate
- Importa dati esistenti (se stai migrando)

#### **4. Verifica Sicurezza**
- Controlla che setup-wizard.html restituisca **404** (eliminato)
- Verifica che non puoi rieseguire il setup
- Conferma robustezza password

#### **5. Backup**
- Crea **backup del database** immediatamente
- Salva credenziali admin in modo sicuro (password manager)
- Documenta la tua configurazione

---

## Disabilitare il Setup Wizard

### **Disabilitazione Automatica**

Il wizard **si disabilita automaticamente** dopo la configurazione riuscita:
- ✅ Flag `SetupCompleted` impostato a `true`
- ✅ File eliminati
- ✅ Nessuna azione ulteriore necessaria

### **Disabilitazione Manuale (Se Necessario)**

Se l'eliminazione automatica fallisce, puoi **disabilitare manualmente**:

#### **Metodo 1: Elimina File Manualmente**
```bash
# Sul server
del C:\inetpub\wwwroot\TuaApp\setup-wizard.html
del C:\inetpub\wwwroot\TuaApp\assets\js\setup-wizard.js
```

#### **Metodo 2: Imposta Flag Senza Eseguire Setup**

**Caso d'uso:** Hai importato utenti da un altro sistema e non hai bisogno del wizard.

**Comando SQL:**
```sql
-- Controlla valore attuale
SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted';

-- Imposta a 'true'
UPDATE SystemConfig
SET ConfigValue = 'true'
WHERE ConfigKey = 'SetupCompleted';

-- Se non esiste, inserisci
IF NOT EXISTS (SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted')
BEGIN
    INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
    VALUES ('SetupCompleted', 'true', 'Setup wizard bypassed - utenti importati');
END
```

**Poi elimina manualmente i file del wizard.**

---

## Risoluzione Problemi

### **Problema: Errore "Setup già completato"**

**Causa:** Il flag `SetupCompleted` è `true`.

**Soluzione:**
- Se **riesecuzione legittima necessaria** (ambiente di test): Vedi documentazione inglese per re-enabling
- Se **produzione**: Questo è il comportamento corretto. Crea utenti tramite pannello Admin.

---

### **Problema: setup-wizard.html Restituisce 404**

**Causa:** Il file è stato eliminato (previsto dopo il setup).

**Se setup NON ancora completato:**
1. Controlla database: `SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted'`
2. Se `'false'` o mancante, ripristina i file del wizard dal codice sorgente
3. Riaccedi all'URL

**Se setup completato:**
- Questo è **comportamento corretto**
- Accedi tramite `Index.html` invece

---

### **Problema: "Il nome utente deve essere di almeno 3 caratteri"**

**Causa:** Nome utente troppo corto.

**Soluzione:** Usa almeno 3 caratteri per il nome utente.

---

### **Problema: "Le password non corrispondono"**

**Causa:** I campi Password e Conferma Password non corrispondono esattamente.

**Soluzione:**
- Ridigita la password con attenzione
- Controlla CAPS LOCK
- Copia-incolla entrambi i campi (se disperato, ma non raccomandato per sicurezza)

---

### **Problema: "Errore di rete durante la configurazione"**

**Causa:** Errore di rete/server.

**Controlli:**
1. **Server in esecuzione?** Controlla che IIS/Docker sia in esecuzione
2. **Database accessibile?** Testa connessione SQL Server
3. **Handler backend esiste?** Controlla che `Services/Setup/CompleteSetup.ashx` esista
4. **Errori console?** Apri Strumenti Sviluppatore browser (F12) → Console

**Soluzione:** Controlla log del server, risolvi il problema sottostante, riprova.

---

### **Problema: Il wizard completa ma non riesci ad accedere**

**Causa:** Utente creato ma problema con la password.

**Soluzione:**
1. **Verifica che l'utente esista:**
   ```sql
   SELECT * FROM Users;
   ```
2. **Controlla nome utente** corrisponde a quello inserito (case-sensitive?)
3. **Reimposta password via SQL** (se disperato) - contatta l'amministratore di sistema

---

### **Problema: Eliminazione automatica fallita**

**Sintomi:** Il file esiste ancora, ma setup completato.

**Controlla:**
1. Vai a `http://tuoserver/setup-wizard.html`
2. Se vedi il form, i file non sono stati eliminati
3. Se ottieni errore "Setup già completato", i file esistono ma wizard disabilitato (sicuro)

**Soluzione:**
- **Elimina manualmente** i file (vedi [Disabilitazione Manuale](#disabilitazione-manuale-se-necessario))
- Il wizard è comunque disabilitato dal flag, ma eliminare i file aggiunge un livello di sicurezza

---

## Best Practices

### **✅ Cose da Fare**

- ✅ **Esegui il setup immediatamente** dopo il deployment
- ✅ **Usa una password forte** (12+ caratteri, maiuscole/minuscole, simboli)
- ✅ **Salva credenziali in modo sicuro** (password manager)
- ✅ **Verifica eliminazione file** dopo il setup
- ✅ **Crea utenti aggiuntivi** subito (non affidarti a un singolo admin)
- ✅ **Backup del database** dopo il setup

### **❌ Cose da NON Fare**

- ❌ **Non ritardare il setup** (lascia il sistema vulnerabile)
- ❌ **Non usare password deboli** (es. "password123")
- ❌ **Non condividere la password admin** (crea account separati invece)
- ❌ **Non saltare la verifica** (testa sempre il login dopo il setup)

---

## Documentazione Correlata

### **Per Utenti:**
- [Guida Rapida (IT)](../08-user-guides/USER_GUIDE_QUICKSTART_IT.md)
- [Manuale Utente Completo (IT)](../08-user-guides/USER_GUIDE_DETAILED_IT.md)
- [FAQ (IT)](../08-user-guides/FAQ_IT.md)

### **Per Amministratori:**
- [Setup Wizard Guide (EN)](SETUP_WIZARD_GUIDE_EN.md) - Versione tecnica completa
- [Deployment Documentation](../07-deployment/README.md)
- [Security Hardening](../07-deployment/SECURITY_HARDENING.md)
- [Troubleshooting](../07-deployment/TROUBLESHOOTING.md)

---

## Riepilogo

Il Setup Wizard è un **passaggio critico** nel deployment di Loginet:
- ✅ Crea l'account admin iniziale
- ✅ Mette in sicurezza il sistema (auto-eliminazione)
- ✅ Uso singolo (previene abusi)
- ✅ Semplice e user-friendly

**Dopo il completamento:** Accedi, crea utenti, e inizia a usare Loginet!

---

**[⬆ Torna all'inizio](#-guida-al-setup-wizard---loginet)**

**[🏠 Torna all'indice documentazione](../README.md)**
