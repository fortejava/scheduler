# ⚙️ Guida alle Impostazioni - Loginet

**Configurazione e Gestione delle Impostazioni di Sistema**

**Versione:** 2.0
**Lingua:** Italiano
**Ultimo Aggiornamento:** 21 Novembre 2025

---

## 📖 Indice

1. [Panoramica](#panoramica)
2. [Tabella SystemConfig](#tabella-systemconfig)
3. [Impostazioni Disponibili](#impostazioni-disponibili)
4. [Gestire le Impostazioni](#gestire-le-impostazioni)
5. [Considerazioni di Sicurezza](#considerazioni-di-sicurezza)
6. [Best Practices](#best-practices)

---

## Panoramica

Loginet utilizza un **sistema di configurazione basato su database** per gestire le impostazioni dell'applicazione dinamicamente senza richiedere modifiche al codice o ridistribuzione.

### **Architettura della Configurazione**

**Tabella Database:** `SystemConfig`
- **Posizione:** Database SQL Server
- **Struttura:** Coppie chiave-valore con descrizioni
- **Accesso:** Programmatico tramite Entity Framework

**Vantaggi:**
- ✅ **Nessuna ridistribuzione necessaria** - Le modifiche hanno effetto immediato
- ✅ **Gestione centralizzata** - Tutte le impostazioni in un unico posto
- ✅ **Tracciamento modifiche** - Modifiche delle impostazioni tracciate nel database
- ✅ **Specifico per ambiente** - Impostazioni diverse per ambiente (dev/prod)

---

## Tabella SystemConfig

### **Struttura Tabella**

```sql
CREATE TABLE SystemConfig (
    ConfigID INT PRIMARY KEY IDENTITY(1,1),
    ConfigKey NVARCHAR(100) NOT NULL UNIQUE,
    ConfigValue NVARCHAR(MAX) NULL,
    Description NVARCHAR(500) NULL,
    CreatedDate DATETIME DEFAULT GETDATE(),
    ModifiedDate DATETIME NULL
)
```

### **Descrizione Colonne**

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| **ConfigID** | INT | Chiave primaria, auto-incremento |
| **ConfigKey** | NVARCHAR(100) | Identificatore univoco dell'impostazione (es. "SetupCompleted") |
| **ConfigValue** | NVARCHAR(MAX) | Valore dell'impostazione (memorizzato come stringa, analizzato se necessario) |
| **Description** | NVARCHAR(500) | Descrizione leggibile dell'impostazione |
| **CreatedDate** | DATETIME | Quando l'impostazione è stata creata |
| **ModifiedDate** | DATETIME | Timestamp dell'ultima modifica |

---

## Impostazioni Disponibili

### **1. SetupCompleted**

**Scopo:** Indica se il Setup Wizard iniziale è stato completato

**Tipo:** Booleano (memorizzato come stringa)

**Valori:**
- `"true"` - Setup completato, wizard disabilitato
- `"false"` - Setup non completato, wizard accessibile

**Default:** `"false"` (su installazione nuova)

**Esempio:**
```sql
SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted';
```

**Risultato:**
```
ConfigID | ConfigKey       | ConfigValue | Description
---------|-----------------|-------------|----------------------------------
1        | SetupCompleted  | true        | Stato setup wizard iniziale
```

**Impatto Sicurezza:** ⚠️ **Critico** - Controlla l'accesso all'endpoint Setup Wizard

---

### **2. ApplicationVersion** (Raccomandato)

**Scopo:** Tracciare la versione dell'applicazione per gestione aggiornamenti

**Tipo:** Stringa (semantic versioning)

**Esempio:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('ApplicationVersion', '2.0.0', 'Versione corrente dell\'applicazione');
```

**Utilizzo:**
- Visualizzare nel footer/pagina about
- Controllare aggiornamenti
- Compatibilità script di migrazione

---

### **3. MaintenanceMode** (Raccomandato)

**Scopo:** Abilitare/disabilitare modalità manutenzione

**Tipo:** Booleano (memorizzato come stringa)

**Valori:**
- `"true"` - Modalità manutenzione abilitata (mostra pagina manutenzione)
- `"false"` - Operazione normale

**Esempio:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('MaintenanceMode', 'false', 'Stato modalità manutenzione sistema');
```

**Utilizzo nel Codice:**
```csharp
var maintenanceMode = db.SystemConfigs
    .FirstOrDefault(c => c.ConfigKey == "MaintenanceMode");

if (maintenanceMode?.ConfigValue == "true")
{
    // Reindirizza a pagina manutenzione
    Response.Redirect("~/maintenance.html");
}
```

---

### **4. SessionTimeout** (Raccomandato)

**Scopo:** Configurare durata timeout sessione (minuti)

**Tipo:** Intero (memorizzato come stringa)

**Esempio:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('SessionTimeout', '30', 'Timeout sessione in minuti');
```

**Utilizzo:**
- Logica scadenza sessione
- Durata token
- Timer auto-logout

---

### **5. MaxLoginAttempts** (Raccomandato)

**Scopo:** Numero massimo tentativi login falliti prima del blocco account

**Tipo:** Intero (memorizzato come stringa)

**Esempio:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('MaxLoginAttempts', '5', 'Numero massimo tentativi login falliti');
```

**Utilizzo:**
- Protezione brute-force
- Logica blocco account

---

### **6. CompanyName** (Opzionale)

**Scopo:** Personalizzare nome azienda visualizzato nell'UI

**Tipo:** Stringa

**Esempio:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('CompanyName', 'Loginet S.r.l.', 'Nome azienda per branding');
```

**Utilizzo:**
- Visualizzazione header/footer
- Template fatture
- Firme email

---

### **7. DateFormat** (Opzionale)

**Scopo:** Formato data predefinito per l'applicazione

**Tipo:** Stringa (pattern formato)

**Esempio:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('DateFormat', 'DD/MM/YYYY', 'Formato visualizzazione data predefinito');
```

**Valori:**
- `"DD/MM/YYYY"` - Formato europeo
- `"MM/DD/YYYY"` - Formato US
- `"YYYY-MM-DD"` - Formato ISO

---

### **8. Currency** (Opzionale)

**Scopo:** Valuta predefinita per le fatture

**Tipo:** Stringa (codice ISO 4217)

**Esempio:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('Currency', 'EUR', 'Valuta predefinita (codice ISO 4217)');
```

**Valori Comuni:**
- `"EUR"` - Euro
- `"USD"` - Dollaro USA
- `"GBP"` - Sterlina britannica

---

## Gestire le Impostazioni

### **Metodo 1: SQL Server Management Studio (SSMS)**

**Migliore per:** Configurazione manuale, modifiche una tantum

**Passaggi:**

1. **Connetti a SQL Server**
   ```
   Server: localhost\SQLEXPRESS
   Database: scheduler
   Autenticazione: Windows Authentication
   ```

2. **Interroga Impostazioni Esistenti**
   ```sql
   SELECT * FROM SystemConfig ORDER BY ConfigKey;
   ```

3. **Aggiungi Nuova Impostazione**
   ```sql
   INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
   VALUES ('NomeImpostazione', 'valore', 'Descrizione dell\'impostazione');
   ```

4. **Aggiorna Impostazione Esistente**
   ```sql
   UPDATE SystemConfig
   SET ConfigValue = 'nuovo valore',
       ModifiedDate = GETDATE()
   WHERE ConfigKey = 'NomeImpostazione';
   ```

5. **Elimina Impostazione** (usa con cautela)
   ```sql
   DELETE FROM SystemConfig WHERE ConfigKey = 'NomeImpostazione';
   ```

---

### **Metodo 2: UI Admin (Miglioramento Futuro)**

**Stato:** Non attualmente implementato
**Raccomandazione:** Aggiungere pagina impostazioni admin

**Funzionalità Proposte:**
- ✅ Elenca tutte le impostazioni in tabella
- ✅ Modifica impostazioni inline
- ✅ Aggiungi nuove impostazioni tramite form
- ✅ Elimina impostazioni con conferma
- ✅ Validazione per tipi impostazione
- ✅ Log audit delle modifiche

**URL Esempio:**
```
http://tuoserver/admin/settings.html
```

**Ruolo Richiesto:** Solo Admin

---

### **Metodo 3: Accesso Programmatico**

**Migliore per:** Logica applicazione, configurazione dinamica

**Leggi Impostazione:**
```csharp
using (var db = new schedulerEntities())
{
    var setting = db.SystemConfigs
        .FirstOrDefault(c => c.ConfigKey == "NomeImpostazione");

    string value = setting?.ConfigValue ?? "valore predefinito";
}
```

**Aggiorna Impostazione:**
```csharp
using (var db = new schedulerEntities())
{
    var setting = db.SystemConfigs
        .FirstOrDefault(c => c.ConfigKey == "NomeImpostazione");

    if (setting != null)
    {
        setting.ConfigValue = "nuovo valore";
        setting.ModifiedDate = DateTime.Now;
    }
    else
    {
        // Crea se non esiste
        db.SystemConfigs.Add(new SystemConfig
        {
            ConfigKey = "NomeImpostazione",
            ConfigValue = "nuovo valore",
            Description = "Descrizione impostazione"
        });
    }

    db.SaveChanges();
}
```

---

## Considerazioni di Sicurezza

### **1. Controllo Accessi**

**⚠️ Impostazioni Critiche:**
- `SetupCompleted` - Dovrebbe essere scrivibile solo da sistema/admin
- `SessionTimeout` - Influisce sulla sicurezza
- `MaxLoginAttempts` - Influisce sulla sicurezza

**Best Practice:**
- ✅ Solo utenti Admin dovrebbero modificare le impostazioni
- ✅ Implementare log audit per modifiche impostazioni
- ✅ Validare valori impostazione prima del salvataggio

---

### **2. Prevenzione SQL Injection**

**Usa sempre query parametrizzate:**

**❌ SBAGLIATO (vulnerabilità SQL Injection):**
```csharp
string query = "UPDATE SystemConfig SET ConfigValue = '" + userInput + "' WHERE ConfigKey = 'NomeImpostazione'";
```

**✅ CORRETTO (Sicuro):**
```csharp
// Entity Framework (automaticamente parametrizzato)
var setting = db.SystemConfigs.FirstOrDefault(c => c.ConfigKey == "NomeImpostazione");
setting.ConfigValue = userInput;
db.SaveChanges();
```

---

### **3. Dati Sensibili**

**⚠️ NON memorizzare in SystemConfig:**
- ❌ Password (anche con hash)
- ❌ Connection string (usa Web.config invece)
- ❌ Chiavi API (usa storage sicuro/variabili ambiente)
- ❌ Chiavi crittografia

**✅ SICURO da memorizzare:**
- ✅ Flag funzionalità (true/false)
- ✅ Preferenze visualizzazione (formato data, valuta)
- ✅ Valori timeout
- ✅ Personalizzazione UI (nome azienda, URL logo)

---

### **4. Backup e Ripristino**

**Backup Tabella SystemConfig:**
```sql
-- Esporta impostazioni in script
SELECT 'INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description) VALUES ('''
    + ConfigKey + ''', '''
    + ISNULL(ConfigValue, '') + ''', '''
    + ISNULL(Description, '') + ''');'
FROM SystemConfig
ORDER BY ConfigKey;
```

**Ripristina da Backup:**
```sql
-- Cancella esistenti (ATTENZIONE!)
TRUNCATE TABLE SystemConfig;

-- Reinserisci da script backup
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('SetupCompleted', 'true', 'Stato setup wizard iniziale');
-- ... (resto impostazioni)
```

---

## Best Practices

### **✅ Cose da Fare**

1. **Usa nomi ConfigKey descrittivi**
   - ✅ Buono: `MaintenanceMode`, `SessionTimeoutMinutes`
   - ❌ Cattivo: `mm`, `timeout`, `setting1`

2. **Fornisci sempre descrizioni**
   ```sql
   INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
   VALUES ('NuovaImpostazione', 'valore', 'Cosa controlla questa impostazione e valori validi');
   ```

3. **Documenta valori validi**
   ```sql
   Description: 'Modalità manutenzione: "true" o "false"'
   ```

4. **Usa formati valore consistenti**
   - Booleani: `"true"` o `"false"` (minuscolo)
   - Numeri: `"123"` (senza formattazione)
   - Date: Formato ISO `"2025-11-21"`

5. **Imposta ModifiedDate sugli aggiornamenti**
   ```sql
   UPDATE SystemConfig
   SET ConfigValue = 'nuovo valore',
       ModifiedDate = GETDATE()
   WHERE ConfigKey = 'NomeImpostazione';
   ```

---

### **❌ Cose da NON Fare**

1. **Non hardcodare valori impostazioni**
   - ❌ Cattivo: `if (timeout == 30)`
   - ✅ Buono: `int timeout = ConfigHelper.GetIntSetting("SessionTimeout", 30);`

2. **Non eliminare impostazioni critiche**
   - Mantieni `SetupCompleted` permanentemente

3. **Non esporre impostazioni a utenti non-admin**
   - La pagina impostazioni dovrebbe richiedere ruolo Admin

4. **Non memorizzare dati binari**
   - Usa file system o storage blob dedicato

---

## Scenari di Configurazione Comuni

### **Scenario 1: Abilitare Modalità Manutenzione**

**Quando:** Eseguire manutenzione database, aggiornamenti, o risoluzione problemi

**Passaggi:**
```sql
-- 1. Imposta modalità manutenzione
UPDATE SystemConfig
SET ConfigValue = 'true',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'MaintenanceMode';

-- 2. Esegui manutenzione

-- 3. Disabilita modalità manutenzione
UPDATE SystemConfig
SET ConfigValue = 'false',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'MaintenanceMode';
```

---

### **Scenario 2: Cambiare Timeout Sessione**

**Quando:** Cambiano i requisiti di sicurezza

**Passaggi:**
```sql
-- Imposta a 15 minuti (più restrittivo)
UPDATE SystemConfig
SET ConfigValue = '15',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'SessionTimeout';

-- Oppure imposta a 60 minuti (più rilassato)
UPDATE SystemConfig
SET ConfigValue = '60',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'SessionTimeout';
```

---

### **Scenario 3: Riabilitare Setup Wizard (Solo Sviluppo)**

**⚠️ ATTENZIONE: Solo Sviluppo/Testing - NON per produzione**

**Passaggi:**
```sql
-- 1. Resetta flag SetupCompleted
UPDATE SystemConfig
SET ConfigValue = 'false',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'SetupCompleted';

-- 2. Elimina utenti esistenti (ATTENZIONE!)
DELETE FROM Users;

-- 3. Ripristina file setup-wizard.html e setup-wizard.js dal codice sorgente

-- 4. Accedi a http://tuoserver/setup-wizard.html
```

---

## Documentazione Correlata

### **Per Amministratori:**
- [Guida Setup Wizard (IT)](SETUP_WIZARD_GUIDE_IT.md)
- [Setup Wizard Guide (EN)](SETUP_WIZARD_GUIDE_EN.md) - Versione tecnica completa
- [Deployment Guide](../07-deployment/README.md)
- [Security Hardening](../07-deployment/SECURITY_HARDENING.md)

### **Per Utenti:**
- [Guida Rapida (IT)](../08-user-guides/USER_GUIDE_QUICKSTART_IT.md)
- [Manuale Utente Completo (IT)](../08-user-guides/USER_GUIDE_DETAILED_IT.md)
- [FAQ (IT)](../08-user-guides/FAQ_IT.md)

---

## Riepilogo

La tabella SystemConfig fornisce **configurazione flessibile basata su database** per Loginet:
- ✅ Gestione impostazioni centralizzata
- ✅ Nessuna ridistribuzione necessaria per modifiche
- ✅ Configurazione specifica per ambiente
- ✅ Tracciamento modifiche tramite ModifiedDate

**Impostazione Critica Corrente:**
- `SetupCompleted` - Controlla accesso Setup Wizard

**Impostazioni Future Raccomandate:**
- `MaintenanceMode` - Controllo manutenzione sistema
- `SessionTimeout` - Configurazione sicurezza
- `MaxLoginAttempts` - Protezione brute-force
- `CompanyName` - Branding UI
- `DateFormat` / `Currency` - Localizzazione

---

**[⬆ Torna all'inizio](#️-guida-alle-impostazioni---loginet)**

**[🏠 Torna all'indice documentazione](../README.md)**
