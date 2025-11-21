# 🚀 Opzioni di Deployment - Loginet

**Guida Semplificata per Utenti Non Tecnici**

**Versione:** 2.0
**Ultimo aggiornamento:** 21 Novembre 2025

---

## 📖 Introduzione

Questa guida spiega in modo semplice le **opzioni disponibili** per installare e far funzionare Loginet nella tua azienda.

**Pubblico:** Manager, titolari d'azienda, responsabili IT senza competenze tecniche avanzate
**Obiettivo:** Aiutarti a scegliere l'opzione di deployment più adatta alle tue esigenze

---

## 🎯 Cosa Significa "Deployment"?

**Deployment** = **Installazione e messa in funzione** del software.

In parole semplici:
- Dove verrà installato Loginet?
- Come verrà configurato?
- Chi avrà accesso?
- Come verrà manutenuto?

---

## 🔢 Due Metodologie Principali

Loginet può essere installato in **due modi diversi**:

### **1. Deployment Tradizionale (IIS)**
### **2. Deployment Moderno (Docker)**

Vediamoli in dettaglio.

---

## 🖥️ Opzione 1: Deployment Tradizionale (IIS)

### **Cos'è?**

L'applicazione viene installata direttamente su un **server Windows** con **IIS** (Internet Information Services).

**Analogia:** È come installare un programma sul tuo computer, ma su un server invece.

### **Come Funziona?**

```
[Server Windows] → [IIS] → [Loginet] → [Database SQL Server]
```

1. **Server Windows**: Computer dedicato che funziona 24/7
2. **IIS**: Software Microsoft per ospitare siti web
3. **Loginet**: La tua applicazione
4. **SQL Server**: Database con tutti i dati (fatture, clienti, etc.)

### **Vantaggi ✅**

- ✅ **Semplicità**: Metodo tradizionale, ben conosciuto
- ✅ **Controllo totale**: Accesso diretto al server
- ✅ **Supporto Microsoft**: Documentazione e supporto ampio
- ✅ **Familiarità**: Se già usi server Windows, è familiare

### **Svantaggi ❌**

- ❌ **Manutenzione manuale**: Aggiornamenti Windows, patch, backup
- ❌ **Meno flessibile**: Più difficile spostare su altro server
- ❌ **Dipendenza Windows**: Richiede licenze Windows Server

### **Quando Scegliere IIS?**

**Scegli IIS se:**
- ✅ Hai già un **server Windows** disponibile
- ✅ Il tuo team IT conosce **IIS e Windows Server**
- ✅ Preferisci metodi **tradizionali e consolidati**
- ✅ Non vuoi imparare nuove tecnologie (Docker)

### **Requisiti Minimi**

- **Hardware**: Server con 4GB RAM, 50GB disco
- **Software**: Windows Server 2016+ o Windows 10/11 Pro
- **Database**: SQL Server 2017+ (può essere sullo stesso server o separato)
- **Competenze**: Conoscenza base amministrazione Windows

### **Tempo di Installazione**

- **Manuale**: 1-2 ore (seguendo la guida passo-passo)
- **Automatica**: 15-30 minuti (con script PowerShell forniti)

---

## 🐳 Opzione 2: Deployment Moderno (Docker)

### **Cos'è Docker?**

Docker è una tecnologia che permette di "**impacchettare**" l'applicazione con tutto ciò che serve in un **contenitore**.

**Analogia:** Pensa a Docker come a una **scatola pre-confezionata** che contiene:
- L'applicazione Loginet
- Tutto il software necessario
- Le configurazioni

Tu prendi la scatola e la "avvii" su qualsiasi server compatibile.

### **Come Funziona?**

```
[Server (Windows/Linux)] → [Docker] → [Contenitore Loginet + Database]
```

1. **Server**: Può essere Windows o Linux
2. **Docker**: Piattaforma che gestisce i contenitori
3. **Contenitori**: Scatole indipendenti con app e database

### **Vantaggi ✅**

- ✅ **Portabilità**: Funziona ovunque (Windows, Linux, Cloud)
- ✅ **Isolamento**: Loginet è separato dal resto del sistema
- ✅ **Facile aggiornamento**: Nuova versione = nuovo contenitore
- ✅ **Ambiente consistente**: Stessa configurazione ovunque
- ✅ **Scalabilità**: Facile aggiungere risorse o repliche

### **Svantaggi ❌**

- ❌ **Curva di apprendimento**: Richiede conoscere Docker
- ❌ **Complessità iniziale**: Setup più complesso la prima volta
- ❌ **Dimensione**: I contenitori Windows sono grandi (~5-10GB)

### **Quando Scegliere Docker?**

**Scegli Docker se:**
- ✅ Vuoi **flessibilità** (cambiare server facilmente)
- ✅ Hai un team IT che conosce **Docker** o vuole impararlo
- ✅ Prevedi di usare il **cloud** (Azure, AWS, etc.)
- ✅ Vuoi **isolamento** tra applicazioni sullo stesso server
- ✅ Ti interessa la **tecnologia moderna**

### **Due Sotto-Opzioni Docker**

#### **A. Full Stack (App + Database in Docker)**

Tutto gira in contenitori Docker:
- Contenitore 1: Loginet (Windows)
- Contenitore 2: SQL Server (Linux)

**Vantaggi:**
- ✅ Tutto containerizzato
- ✅ Facile spostare tutto insieme
- ✅ Isolamento completo

**Usa quando:** Nuova installazione senza database esistente

#### **B. Solo App (Database Esterno)**

Solo Loginet in Docker, database separato:
- Contenitore: Loginet (Windows)
- Database: SQL Server esistente (su altro server o cloud)

**Vantaggi:**
- ✅ Riusa database esistente
- ✅ Database gestito separatamente

**Usa quando:** Hai già un SQL Server aziendale

### **Requisiti Minimi**

- **Hardware**: Server con 8GB RAM, 50GB disco (per contenitori Windows)
- **Software**: Windows 10/11 Pro o Windows Server con Docker Desktop
- **Database**: Opzionale (può essere in Docker o esterno)
- **Competenze**: Conoscenza base Docker

### **Tempo di Installazione**

- **Prima volta**: 1-2 ore (installare Docker + capire concetti)
- **Successivi**: 10-20 minuti (avviare contenitori)

---

## 📊 Confronto Diretto

| Caratteristica | IIS (Tradizionale) | Docker (Moderno) |
|----------------|--------------------|--------------------|
| **Facilità Setup Iniziale** | ⭐⭐⭐⭐ (se conosci Windows) | ⭐⭐⭐ (richiede apprendimento) |
| **Portabilità** | ⭐⭐ (solo Windows) | ⭐⭐⭐⭐⭐ (ovunque) |
| **Aggiornamenti** | ⭐⭐⭐ (manuali) | ⭐⭐⭐⭐⭐ (semplici) |
| **Isolamento** | ⭐⭐ (condivide server) | ⭐⭐⭐⭐⭐ (isolato) |
| **Requisiti Hardware** | ⭐⭐⭐⭐ (leggero) | ⭐⭐⭐ (più pesante) |
| **Maturità Tecnologia** | ⭐⭐⭐⭐⭐ (consolidata) | ⭐⭐⭐⭐ (moderna ma stabile) |
| **Supporto Cloud** | ⭐⭐⭐ (possibile) | ⭐⭐⭐⭐⭐ (nativo) |
| **Costo** | Licenze Windows | Licenze Windows + Docker (free/paid) |

---

## 🤔 Quale Scegliere? - Albero Decisionale

**Segui questo percorso:**

### **Domanda 1: Hai già un server Windows con IIS?**

- **SÌ** → Vai a Domanda 2
- **NO** → Vai a Domanda 3

### **Domanda 2: Il tuo team IT conosce bene Windows/IIS?**

- **SÌ** → **Raccomandazione: IIS** ✅ (semplice, familiare)
- **NO** → Vai a Domanda 3

### **Domanda 3: Hai bisogno di flessibilità/portabilità?**

- **SÌ** (vogliamo poter cambiare server facilmente) → **Raccomandazione: Docker** ✅
- **NO** (server fisso) → **Raccomandazione: IIS** ✅

### **Domanda 4: Userete il cloud (Azure, AWS)?**

- **SÌ** → **Raccomandazione: Docker** ✅ (migliore per cloud)
- **NO** → Entrambe le opzioni vanno bene

### **Domanda 5: Il team IT vuole imparare tecnologie moderne?**

- **SÌ** → **Raccomandazione: Docker** ✅ (buona opportunità)
- **NO** → **Raccomandazione: IIS** ✅ (resta sul familiare)

---

## 🎯 Raccomandazioni per Scenari Comuni

### **Scenario A: Piccola Azienda (5-20 utenti)**

**Situazione:**
- Un server Windows esistente
- Team IT piccolo o assente
- Budget limitato
- Serve subito

**Raccomandazione: IIS** ✅

**Perché:**
- Setup rapido se hai già Windows
- Nessuna nuova tecnologia da imparare
- Costo contenuto (nessun costo Docker extra)

---

### **Scenario B: Media Azienda (20-100 utenti)**

**Situazione:**
- Infrastruttura IT strutturata
- Team IT con competenze varie
- Possibile crescita futura
- Valutano il cloud

**Raccomandazione: Docker** ✅

**Perché:**
- Scalabilità per crescita futura
- Flessibilità cloud
- Investimento in tecnologia moderna
- Isolamento migliore

---

### **Scenario C: Azienda con SQL Server Esistente**

**Situazione:**
- Hanno già SQL Server aziendale
- Database condiviso tra applicazioni
- Team IT esperto

**Raccomandazione: Docker (Solo App)** ✅

**Perché:**
- Riusa database esistente
- Isola solo l'applicazione
- Non tocca l'infrastruttura DB esistente

---

### **Scenario D: Startup Tecnologica**

**Situazione:**
- Team IT giovane e tecnologico
- Infrastruttura cloud
- Crescita rapida prevista

**Raccomandazione: Docker (Full Stack)** ✅✅

**Perché:**
- Allineato con stack tecnologico moderno
- Ottimo per cloud
- Facile scalare

---

## 💰 Considerazioni sui Costi

### **Costi IIS**

**Una Tantum:**
- Licenze Windows Server: €500-€1000 (circa)
- Licenze SQL Server: €1000-€5000 (o SQL Express gratis con limiti)

**Ricorrenti:**
- Manutenzione server
- Eventuali update licenze

### **Costi Docker**

**Una Tantum:**
- Licenze Windows Server: €500-€1000 (per contenitori Windows)
- Docker Desktop: Gratis (uso personale/piccole aziende) o €5-10/mese per azienda
- Licenze SQL Server: Se incluso, stessi costi IIS

**Ricorrenti:**
- Eventuale abbonamento Docker (se oltre soglia gratis)
- Manutenzione

**💡 Nota:** I costi sono simili. La differenza principale è nella **gestione**, non nel costo licenze.

---

## 📚 Documentazione Tecnica (Per IT)

### **Guide IIS (Inglese):**
- [IIS Deployment Guide - Basic](../../07-deployment/IIS_DEPLOYMENT_GUIDE_BASIC.md) - Quick (15-30 min)
- [IIS Deployment Guide - Detailed](../../07-deployment/IIS_DEPLOYMENT_GUIDE_DETAILED.md) - Complete (1-2 hours)

### **Guide Docker (Inglese):**
- [Docker Deployment Guide - Basic](../../07-deployment/DOCKER_DEPLOYMENT_GUIDE_BASIC.md) - Quick (10-20 min)
- [Docker Deployment Guide - Detailed](../../07-deployment/DOCKER_DEPLOYMENT_GUIDE_DETAILED.md) - Complete (1-2 hours)

### **Guide Database (Inglese):**
- [Database Deployment Guide](../../07-deployment/DATABASE_DEPLOYMENT_GUIDE.md) - Per entrambe le opzioni

### **Sicurezza (Inglese):**
- [Security Hardening Guide](../../07-deployment/SECURITY_HARDENING.md) - Best practices sicurezza
- [Production Checklist](../../07-deployment/PRODUCTION_CHECKLIST.md) - Verifica pre-produzione

---

## ❓ Domande Frequenti

### **1. Posso cambiare idea dopo?**

**SÌ**, ma richiede lavoro.
- Da IIS → Docker: Fattibile, backup dati + nuova installazione
- Da Docker → IIS: Fattibile, stessa procedura

### **2. Quale è più sicuro?**

**Entrambi sicuri** se configurati correttamente.
- IIS: Sicurezza Windows ben consolidata
- Docker: Isolamento migliore (contenitori separati)

### **3. Quale è più veloce?**

**Performance simili**. La differenza è trascurabile per la maggior parte degli usi.

### **4. Posso usare Linux?**

- **IIS**: NO (solo Windows)
- **Docker**: SÌ, ma Loginet richiede contenitori Windows (per ASP.NET 4.7.2)

### **5. Serve connessione internet?**

**Dipende:**
- Installazione: Sì (per scaricare componenti)
- Uso quotidiano: NO (se tutto su rete locale)

### **6. Posso testare entrambe?**

**SÌ!** Puoi installare in ambiente di test e provare entrambe le opzioni prima di decidere per produzione.

---

## 🎓 Raccomandazione Finale

**Se sei incerto**, la nostra raccomandazione generale è:

### **Per il 2025: Docker** 🐳

**Perché:**
- Tecnologia del futuro
- Maggiore flessibilità
- Migliore per cloud (trend crescente)
- Isolamento superiore

**MA:** Se il tuo team IT non ha esperienza Docker e hai fretta, **IIS è perfettamente valido** e più semplice nell'immediato.

---

## 📞 Hai Bisogno di Aiuto?

**Per decidere:**
1. Consulta il tuo team IT
2. Valuta i pro/contro per il tuo scenario
3. Leggi le guide tecniche (link sopra)
4. Se serve, contatta un consulente IT

**Per l'installazione:**
- Segui le guide tecniche dettagliate
- Usa gli script di automazione forniti
- Chiedi supporto al team IT

---

## ✅ Prossimi Passi

**Dopo aver scelto:**

1. **Leggi la guida tecnica** corrispondente
2. **Prepara l'ambiente** (server, licenze, etc.)
3. **Segui la procedura** passo-passo
4. **Testa** in ambiente di prova
5. **Vai in produzione** quando pronto

**Buona installazione! 🚀**

---

**[⬆ Torna su](#-opzioni-di-deployment---loginet)**

**[📚 Torna alla documentazione utente](README.md)**

**[🏠 Torna all'indice principale](../README.md)**
