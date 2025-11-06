// ====================================
// AUTHENTICATION FUNCTIONS
// ====================================

/**
 * Main login function - handles both manual and autologin
 * @param {string|null} sessionUsername - Username for autologin, null for manual
 * @param {string|null} sessionToken - Token for autologin, null for manual
 * @param {Event|null} event - Form event for manual login, null for autologin
 */
function doLogin(sessionUsername, sessionToken, event)
{
    //TODO: Gestire il login

    if (event)
    {
        event.preventDefault();
        event.stopPropagation();
    }

    //Creiamo l'oggetto form che invierà i dati effettivamente al server
    const dataContainer = new FormData();

    let usernameToSave;

    const isAutologin = (sessionUsername != undefined && sessionToken != undefined);

    if (!isAutologin) {
        showLoading();

        //Popoliamo la form
        usernameToSave = document.forms.loginForm.username.value;
        dataContainer.append("username", usernameToSave);
        dataContainer.append("password", document.forms.loginForm.password.value);
        dataContainer.append("token", "");
    }
    else
    {
        usernameToSave = sessionUsername;
        dataContainer.append("username", sessionUsername);     
        dataContainer.append("token", sessionToken);
    }

    //Creiamo l'oggetto XMLHttpRequest che invii i dati al server
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            if (!isAutologin)
            {
                hideLoading();
            }
            switch (this.status)
            {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);
                    //Seconda fase: modificare aspetto GUI
                    //console.log(res);
                    loginWorker(res, usernameToSave, isAutologin);
                break;

                default:
                    console.log("Si è verificato un errore, riprova più tardi");

                    // Clear invalid token
                    if (!isAutologin)
                    {
                        showView("login-view");
                    }
                break;

                
            }
        }
    }

    xhr.open("POST", API.auth.login, true);
    xhr.send(dataContainer);

}

/**
 * Process login response from server
 * @param {Object} res - Server response object {Code: string, Message: any}
 * @param {string} usernameToSave - Username to save on successful login
 * @param {boolean} isAutologin - Whether this is an autologin attempt
 */
function loginWorker(res, usernameToSave, isAutologin)
{
    switch (res.Code)
    {
        case "Ok":
        {
                //Nome utente e password sono corretti, per cui dobbiamo:
                //1: inserire username e password in localStorage

                if (!isAutologin)
                {
                    localStorage.setItem("username", usernameToSave);
                    localStorage.setItem("token", res.Message.Token);
                }

                //2: Mostare la vista calendario
                showView("calendar-view");
                //2b: Inizializzare il calendario
                

                //Estraiamo anno e mese corrente
                const today = new Date();

                console.log(today.getMonth() + " " + today.getFullYear());

                //TODO: estrarre l'elenco delle fatture del mese/anno attuale
                //const invoicesList = invoicesSearch(today.getMonth(), today.getFullYear());

                invoicesSearch(today.getMonth(), today.getFullYear());


                

                //3: mostrare tutte le voci di menu nascoste e nascondere il login
                showMenu();

        } break;

        case "Ko":
        {
                // Handle failed login
                console.log("Login fallito: credenziali non valide");
                localStorage.removeItem("username");
                localStorage.removeItem("token");
                showView("login-view");
                // Show error message
                alert("Login fallito: nome utente o password non corretti");

        } break;

        case "OUT":
            {
                // NEW: Expired or invalid token
                console.log("Sessione scaduta o token non valido");
                localStorage.removeItem("username");
                localStorage.removeItem("token");
                showView("login-view");

                // Only show alert if it was an autologin attempt
                if (isAutologin) {
                    alert("La tua sessione è scaduta. Per favore, effettua nuovamente il login.");
                }
            }
            break;

        default:
        {
                // Unknown response code
                console.error("Codice di risposta sconosciuto: " + res.Code);
                showView("login-view");
        } break;
    }
}

/**
 * Funzione che nasconde tutti gli elementi di classe view, tranne l'elemento con id = idToShow
 * 
 * @param {any} viewtoShow l'id della vista da mostrare
 */
function showView(viewToShow)
{
    //Cicliamo su tutte le viste
    const viewsList = document.querySelectorAll(".view");

    for (el of viewsList)
    {
        el.classList.add("view-hidden");
        el.classList.remove("view-visible");
    }

    const visibleElement = document.querySelector(`#${viewToShow}`);
    visibleElement.classList.remove("view-hidden");
    visibleElement.classList.add("view-visible");
    // Find menu item by data-viewport instead
    const menuItem = document.querySelector(`[data-viewport="${viewToShow}"]`);
    if (menuItem) {
        setActiveMenuItem(menuItem.id);
    }
    /*setActiveMenuItem(`nav-${viewToShow}`);*/

}

function showMenu()
{
    /* 
    Rimuoviamo la classe guest-hidden dalle voci di menu e nascondiamo la login (se necessario)
    */
    const menuItems = document.querySelectorAll(".guest-hidden");

    for (el of menuItems)
    {
        el.classList.remove("guest-hidden");
    }

    //Nascondiamo la voce di login
    const element = document.querySelector("#nav-login");
    element.style.display = "none"
}
const invoicesSearch = (month, year) => {
    //event.preventDefault();
    //event.stopPropagation();
    //Estraiamo tutte le fatture del mese e dell'anno corrente
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("Year", year);
    //fd.append("Month", month+1);

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    {
                        //Prima fase: convertire il JSON in un oggetto Javascript
                        const res = JSON.parse(this.responseText);
                        let today = new Date();
                        calendarHandler(today.getMonth(), today.getFullYear(),[]);
                        //console.log(`${year} - ${month}`);
                        reloadCalendar(res);
                        //Carichiamo il calendario
                        //console.log(res);
                        //loginWorker(res);
                    }break;

                default:
                    {
                       // const res = JSON.parse(this.responseText);
                        console.log(this.responseText);
                        console.log("Si è verificato un errore, riprova più tardi");
                    }break;


            }
        }
    }

    xhr.open("POST", API.invoices.getInvoicesFiltred, true);
    xhr.send(fd);

    retvalue = [];

    return retvalue;
}

/**
 * funzione che ricarica gli eventi del calendario
 */
const reloadCalendar = (events) => {
    //Costruiamo la lista dei nuovi eventi in calendare
    newEventsList = Array();

    const statusesArray = [
        {
            backgroundColor: "green",
            textColor: "white"
        },
        {
            backgroundColor: "yellow",
            textColor: "black"
        },
        {
            backgroundColor: "red",
            textColor: "white"
        }
    ];

    //Cicliamo sulle fatture per aggiungerle al calendario
    for (el of events.Message)
    {

        newEventsList.push(
            {
                
                title: el.Invoice.Customer.CustomerName + " - " + el.Invoice.InvoiceDue,
                start: el.Invoice.InvoiceDueDate.split("T")[0],
                backgroundColor: statusesArray[parseInt(el.StatusCode)].backgroundColor,
                textColor: statusesArray[parseInt(el.StatusCode)].textColor,
                borderColor: "transparent",
                extendedProps: {
                    invoiceId: el.Invoice.InvoiceID
                }
            }
        );
    }

    //Azzeriamo l'elenco precedente degli eventi
    calendar.removeAllEvents();
    calendar.addEventSource(newEventsList);
    // oppure
    //calendar.refetchEvents(); // se usi una funzione come source

}

const showInvoicesList = () => {
    const today = new Date();
    getInvoicesList(today.getMonth(), today.getFullYear());
    showView('invoice-list');
};

function invoiceItemCreator(message, i) {
    const invoiceData = message.Invoice;
    const statusCode = message.StatusCode; 

    return `
    <tr style="height: 45px;">
        <th scope="row" class="align-middle">${i}</th>
        <td class="align-middle">${invoiceData.InvoiceNumber}</td>
        <td class="align-middle">${invoiceData.InvoiceOrderNumber}</td>
        <td class="align-middle">${invoiceData.Customer.CustomerName}</td>
        <td class="align-middle">${invoiceData.InvoiceCreationDate.split('T')[0]}</td>
        <td class="align-middle">${invoiceData.InvoiceDueDate.split('T')[0]}</td>
        <td class="align-middle">${getStatusBadge(statusCode)}</td>
        <td class="align-middle text-center">
            <button class="btn btn-sm btn-outline-primary" onclick="showInvoiceDetail(${invoiceData.InvoiceID})" title="Visualizza">
                <i class="bi bi-eye"></i>
            </button>
        </td>
        <td class="align-middle text-center">
            <button class="btn btn-sm btn-outline-danger" onclick="deleteInvoice(${invoiceData.InvoiceID})" title="Elimina">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    </tr>`;
}

function getStatusBadge(statusCode) {
    const statusMap = {
        '0': { class: 'success', label: 'Saldato' },       // Paid - Green
        '1': { class: 'warning', label: 'Non Saldato' },   // Not paid, not overdue - Yellow
        '2': { class: 'danger', label: 'Scaduta' }         // Overdue - Red
    };
    const status = statusMap[statusCode] || { class: 'secondary', label: 'Sconosciuto' };
    return `<span class="badge bg-${status.class}">${status.label}</span>`;
}

function editInvoice(i) {
    // Mostra la vista di modifica fattura
    //showView('invoice-creation');
    // Carica i dati della fattura da modificare
    loadInvoiceData(i);
}

function loadInvoiceData(invoiceId) {
    // Implementa la logica per caricare i dati della fattura con l'ID specificato
    console.log(`Caricamento dati per la fattura con ID: ${invoiceId}`);
    // Esempio: Effettua una chiamata AJAX per ottenere i dati della fattura e popolare il modulo
}

function deleteInvoice(i) {
    // Implementa la logica per eliminare la fattura con l'ID specificato
    console.log(`Eliminazione fattura con ID: ${i}`);
}

function cancelInvoice(i) {
    // Implementa la logica per annullare la modifica della fattura con l'ID specificato
    console.log(`Annullamento modifica fattura con ID: ${i}`);
}

function saveInvoice(i) {
    // Implementa la logica per salvare la fattura con l'ID specificato
    console.log(`Salvataggio fattura con ID: ${i}`);
}

//function fillInvoicesList(res) {
//    const divInvoicesList = document.getElementById('invoices-list-container');

//    if (!res || !res.Message || res.Message.length === 0) {
//        divInvoicesList.innerHTML = `
//            <div class="text-center py-5">
//                <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
//                <p class="text-muted mt-3">Nessuna fattura trovata.</p>
//            </div>`;
//        return;
//    }

//    let invoicesList = `
//        <div class="table-responsive">
//            <table class="table table-hover table-sm">
//                <thead class="table-light">
//                    <tr>
//                        <th scope="col">#</th>
//                        <th scope="col">N° Fattura</th>
//                        <th scope="col">N° Ordine</th>
//                        <th scope="col">Cliente</th>
//                        <th scope="col">Data Immissione</th>
//                        <th scope="col">Data Scadenza</th>
//                        <th scope="col">Stato</th>
//                        <th scope="col" class="text-center">Visualizza</th>
//                        <th scope="col" class="text-center">Elimina</th>
//                    </tr>
//                </thead>
//                <tbody>`;

//    let i = 0;
//    for (el of res.Message) {
//        invoicesList += invoiceItemCreator(el, ++i);
//    }

//    invoicesList += `
//                </tbody>
//            </table>
//        </div>`;

//    divInvoicesList.innerHTML = invoicesList;
//}

const getInvoicesList = (month, year) => {
    //event.preventDefault();
    //event.stopPropagation();
    //Estraiamo tutte le fatture del mese e dell'anno corrente
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    //fd.append("Year", year);
    //fd.append("Month", month+1);

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    {
                        //Prima fase: convertire il JSON in un oggetto Javascript
                        const res = JSON.parse(this.responseText);

                        fillInvoicesList(res);
                        //Carichiamo il calendario
                        //console.log(res);
                        //loginWorker(res);
                    } break;

                default:
                    {
                        // const res = JSON.parse(this.responseText);
                        console.log(this.responseText);
                        console.log("Si è verificato un errore, riprova più tardi");
                    } break;


            }
        }
    }

    xhr.open("POST", API.invoices.getInvoicesFiltred, true);
    xhr.send(fd);

    retvalue = [];

    return retvalue;
}


const showCalendarView = () => {

    const today = new Date();
    invoicesSearch(today.getMonth(), today.getFullYear());
    showView('calendar-view');
}

const showCreateInvoice = () => {
    showView('invoice-creation');
    getAllStatuses("StatusID");
    getAllCustomers("CustomerID");

}

const getAllCustomers = (idToFill) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);

                    //TODO: Gestire il caso di KO

                    //Seconda fase: modificare aspetto GUI

                    //accedere alla select con ID passato e valorizzarla
                    fillCustomers(res, idToFill);

                    break;

                default:
                    console.log("Si è verificato un errore in fase di ottenimento dei clienti");
                    break;


            }
        }
    }
    xhr.open("GET", "/services/CustomerHandlers/GetAllCustomers.ashx", true);
    xhr.send();
}

const getAllStatuses = (idToFill) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);
                    //Seconda fase: modificare aspetto GUI

                    //TODO: Gestire il caso di KO

                    //accedere alla select con ID passato e valorizzarla
                    fillStatuses(res, idToFill);

                    break;

                default:
                    console.log("Si è verificato un errore in fase di ottenimento degli stati");
                    break;


            }
        }
    }
    xhr.open("GET", "/services/StatusHandlers/GetAllStatuses.ashx", true);
    xhr.send();
}

/**
 * Funzione che riempie la select contenente gli status con id selezionato
 */
const fillStatuses = (res, idToFill) => {
    //Otteniamo il riferimento DOM alla select idToFill
    const statuses = document.getElementById(idToFill);

    for (el of res.Message)
    {
        const newOption = document.createElement("option");
        newOption.value = el.StatusID;
        newOption.innerText = el.StatusLabel;

        if (el.StatusID == 2)
        {
            newOption.selected = true;
        }

        statuses.appendChild(newOption);
    }
}

/**
 * Funzione che riempie la select contenente gli customer con id 
 */
const fillCustomers = (res, idToFill) => {
    //Otteniamo il riferimento DOM alla select idToFill
    const statuses = document.getElementById(idToFill);

    for (el of res.Message) {
        const newOption = document.createElement("option");
        newOption.value = el.CustomerID;
        newOption.innerText = el.CustomerName;

        if (el.StatusID == 2) {
            newOption.selected = true;
        }

        statuses.appendChild(newOption);
    }
}

/**
 * Funzione che tenta la creazione della nuova fattura
 */

function createInvoiceFunction(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    //Verifichiamo che il netto a pagare non sia maggiore del totale della fattura
    if (parseFloat(document.querySelector("#InvoiceDue").value) > parseFloat(document.querySelector("#InvoiceTotal").value))
    {
        //Mostriamo la popup con l'errore
        showPopup("Errore di compilazione", "Il netto a pagare non può essere maggiore del totale della fattura.");
        return false;
    }

    let fd = new FormData();
    const frontendForm = document.forms["createInvoice"];

    if (frontendForm.CreationDate.value > frontendForm.DueDate.value)
    {
        showPopup("Errore di compilazione", "La data di emissione della fattura non può essere successiva alla data di scadenza.");
        return false;
    }

    console.log(parseFloat(frontendForm.InvoiceTax.value) / 100);

    //fd.append("InvoiceID", document.forms["createInvoice"].InvoiceID.value);
    fd.append("InvoiceID", null);
    fd.append("InvoiceOrderNumber", frontendForm.InvoiceOrderNumber.value);
    fd.append("InvoiceNumber", frontendForm.InvoiceNumber.value);
    fd.append("CustomerID", frontendForm.CustomerID.value);
    fd.append("StatusID", frontendForm.StatusID.value);
    fd.append("InvoiceTaxable", frontendForm.InvoiceTaxable.value);
    fd.append("InvoiceTax", frontendForm.InvoiceTax.value);
    fd.append("InvoiceDue", frontendForm.InvoiceDue.value);
    fd.append("CreationDate", frontendForm.CreationDate.value);
    fd.append("DueDate", frontendForm.DueDate.value);
    fd.append("Description", frontendForm.Description.value);

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);
                    console.log(res);

                    switch (res.Code)
                    {
                        case "Ok":
                            showPopup("Fattura creata correttamente!", "complimenti, sei un eroe!!!");
                            //Mostriamo la vista calendario
                            showView("calendar-view");
                            break;
                        default:
                            showPopup("Si è verificato un errore", res.Message);
                            break;
                    }

                    //Seconda fase: mostrare messaggio di errore o conferma di inserimento

                    break;

                default:
                    console.log("Si è verificato un errore in fase di inserimento della fattura");
                    break;


            }
        }
    }

    xhr.open("POST", "/services/InvoiceHandlers/CreateOrUpdateInvoice.ashx", true);
    xhr.send(fd);

    
    return false;

}

const showPopup = (title, message) => {
    document.getElementById("popup-label").innerText = title;
    document.getElementById("popup-content").innerText = message;
    const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    myModal.show();
}

/**
 * Funzione che aggiorna il totale fattura e il totale tasse
 */
const updateInvoiceCreation = () => {
    let taxableAmount = parseFloat(document.querySelector("#InvoiceTaxable").value);
    let taxRate = parseFloat(document.querySelector("#InvoiceTax").value) / 100;

    //cole.log(`${taxableAmount} - ${taxRate}`);
    if (!isNaN(taxableAmount) && !isNaN(taxRate))
    {
        //Aggiorniamo la form
        document.querySelector("#TaxTotal").value = taxableAmount * taxRate;
        document.querySelector("#InvoiceTotal").value = taxableAmount + (taxableAmount * taxRate);

    }
}


//Autologin
window.onload = function ()
{
    let username = localStorage.getItem("username");
    let token = localStorage.getItem("token");
    if (notEmptyString(username) && notEmptyString(token)) {
        doLogin(username, token, null);
    }
    else
    {
        showView("login-view");
    }
    
}

const notEmptyString = (s) => {
    return s != null && typeof s === 'string' && s.trim() != "";
    //s !== null && s !== undefined && s.Trim() != ""; != treats null and undefined as the same
}

const notEmptyArray = (arr) => {
    return arr && Array.isArray(arr) && arr.length > 0;
}

// ====================================
// UI HELPER FUNCTIONS
// ====================================

const showLoading = () => {
    document.getElementById("loading-overlay").style.display = "block";
}

const hideLoading = () => {
    document.getElementById("loading-overlay").style.display = "none";
}


/**
 * Logout user and clear session
 */
const doLogout = () => {
    // Clear all session data
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("token_timestamp");

    // Hide authenticated menu items
    const menuItems = document.querySelectorAll(".nav-item:not(.guest-hidden)");
    for (el of menuItems) {
        el.classList.add("guest-hidden");
    }

    // Show login menu item
    const loginItem = document.querySelector("#nav-login");
    if (loginItem) {
        loginItem.style.display = "block";
    }

    // Show login view
    showView("login-view");

    // Optional: notify user
    showPopup("Logout effettuato", "Hai effettuato il logout con successo.");
}


// ====================================
// CONFIGURATION CONSTANTS
// ====================================

// Centralize endpoints 
const API = {
    base: '/Services',              // stick to one casing everywhere
    invoices: {
        createOrUpdate: '/Services/InvoiceHandlers/CreateOrUpdateInvoice.ashx',
        getByIdDTO: '/Services/InvoiceHandlers/GetInvoiceByID_DTO.ashx',
        getInvoicesFiltred: '/Services/InvoiceHandlers/GetInvoices.ashx',
        byMonthDTO: '/Services/InvoiceHandlers/GetInvoiceByMonthDTO.ashx',
        years: '/Services/InvoiceHandlers/InvoiceYears.ashx'
    },
    customers: {
        all: '/Services/CustomerHandlers/GetAllCustomers.ashx',
        byId: '/Services/CustomerHandlers/GetCustomerByID.ashx',
        search: '/Services/CustomerHandlers/SearchCustomer.ashx',
        startsWith: '/Services/CustomerHandlers/StartWithCustomerName.ashx',
        filterByName: '/Services/CustomerHandlers/FilterByNameCustomers.ashx',
        createOrUpdate: '/Services/CustomerHandlers/CreateOrUpdateCustomer.ashx'
    },
    statuses: {
        all: '/Services/StatusHandlers/GetAllStatuses.ashx',
        byId: '/Services/StatusHandlers/GetStatusByID.ashx'
    },
    auth: {
        login: '/Services/Login.ashx'
    }
};





const showCustomersView = () => {
    //Carichiamo l'elenco dei clienti
    showLoading();
    fetchAllCustomers(newFillCustomersList);
    showView('customers-view');
}

const fetchAllCustomers = (callback) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);

                    //TODO: Gestire il caso di KO

                    //Seconda fase: modificare aspetto GUI

                    //
                    callback(res);

                    break;

                default:
                    console.log("Si è verificato un errore in fase di ottenimento dei clienti");
                    hideLoading();
                    break;


            }
        }
    }
    xhr.open("GET", API.customers.all, true);
    xhr.send();
}

const newFillCustomersList = (res) => {
    const container = document.getElementById("customers-list-container");
    let dynamicHtml = "";

    if (res.Code === "Ok" && notEmptyArray(res.Message)) {
        // Column header
        dynamicHtml += `
        <div class="row mb-2 px-3">
            <div class="col-8">
                <label class="form-label text-muted small fw-bold">NOME CLIENTE</label>
            </div>
            <div class="col-4 text-end">
                <label class="form-label text-muted small fw-bold">AZIONI</label>
            </div>
        </div>`;

        // Customer rows
        let i = 0;
        for (let customer of res.Message) {
            i++;
            dynamicHtml += `
            <div class="customer-item mb-3 p-3 border rounded bg-white shadow-sm" id="customer-${i}" data-customer-name="${customer.CustomerName}">
                <div class="row align-items-center">
                    <div class="col-8">
                        <input 
                            readonly 
                            class="form-control-plaintext customer-name-input" 
                            id="customer-input-${i}" 
                            data-customer-id="${customer.CustomerID}" 
                            data-customer-name="${customer.CustomerName}" 
                            value="${customer.CustomerName}"
                        />
                    </div>
                    <div class="col-4 text-end">
                        <!-- View mode buttons -->
                        <button class="btn btn-sm btn-outline-primary me-2 edit-button" onclick="editCustomer(${i})" id="customer-edit-Button-${i}" title="Modifica">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-button" onclick="deleteCustomer(${i})" id="customer-delete-Button-${i}" title="Elimina">
                            <i class="bi bi-trash"></i>
                        </button>
                        
                        <!-- Edit mode buttons (hidden by default) -->
                        <button class="btn btn-sm btn-success me-2 save-button hidden" onclick="saveCustomer(${i})" id="customer-save-Button-${i}" title="Salva">
                            <i class="bi bi-check-lg"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary cancel-button hidden" onclick="cancelCustomer(${i})" id="customer-cancel-Button-${i}" title="Annulla">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        }
    }

    container.innerHTML = (dynamicHtml !== "") ? dynamicHtml : '<p class="text-muted text-center">Nessun cliente presente.</p>';
    hideLoading();
}

const filterCustomers = () => {
    const searchInput = document.getElementById('customer-search');
    const filter = searchInput.value.toLowerCase();
    const customerItems = document.querySelectorAll('.customer-item');

    customerItems.forEach(item => {
        const customerName = item.getAttribute('data-customer-name').toLowerCase();
        if (customerName.includes(filter)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

const searchCustomers = () =>
{
    const searchInput = document.getElementById('customer-search');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const customerItems = document.querySelectorAll('.customer-item'); 

    customerItems.forEach(item => {
        const customerName = item.getAttribute('data-customer-name');
        if (!customerName || customerName.toLowerCase().includes(query))
        {
            item.style.display = '';
        } else
        {
            item.style.display = 'none';
        }
    });
    
}

// Show items without names OR items matching search
//if (!customerName) {
//    item.style.display = '';
//} else if (customerName.toLowerCase().includes(query)) {
//    item.style.display = '';
//}

function editCustomer(i) {
    // Hide view buttons
    document.getElementById(`customer-edit-Button-${i}`).classList.add("hidden");
    document.getElementById(`customer-delete-Button-${i}`).classList.add("hidden");

    // Show edit buttons
    document.getElementById(`customer-save-Button-${i}`).classList.remove("hidden");
    document.getElementById(`customer-cancel-Button-${i}`).classList.remove("hidden");

    // Make input editable with visual change
    const input = document.getElementById(`customer-input-${i}`);
    input.removeAttribute("readonly");
    input.classList.remove("form-control-plaintext");
    input.classList.add("form-control");
}

function cancelCustomer(i) {
    // Show view buttons
    document.getElementById(`customer-edit-Button-${i}`).classList.remove("hidden");
    document.getElementById(`customer-delete-Button-${i}`).classList.remove("hidden");

    // Hide edit buttons
    document.getElementById(`customer-save-Button-${i}`).classList.add("hidden");
    document.getElementById(`customer-cancel-Button-${i}`).classList.add("hidden");

    // Make input readonly with visual change
    const input = document.getElementById(`customer-input-${i}`);
    input.setAttribute("readonly", "readonly");
    input.classList.remove("form-control");
    input.classList.add("form-control-plaintext");
    input.value = input.getAttribute("data-customer-name");
}



function saveCustomer(i, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    showLoading();
    let fd = new FormData();

    let customerElement = document.getElementById(`customer-input-${i}`);
    let customerId = customerElement.getAttribute("data-customer-id");
    let customerName = customerElement.value;

    if (!notEmptyString(customerName)) {
        showPopup("Errore di compilazione", "Il nome del cliente vuoto");
        return false;
    } else if (customerName === customerElement.getAttribute("data-customer-name")) {
        showPopup("Nessuna modifica", "Il nome del cliente non è stato modificato.");
        return false;
    }

    //fd.append("AddCustomerName", frontendForm.addCustomer.value); // --- not working
    fd.append("CustomerID", customerId);
    fd.append("CustomerName", customerName);

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //Convertire il Json
                    const res = JSON.parse(this.responseText);
                    console.log(res);
                    switch (res.Code) {
                        case "Ok":
                            showPopup("Cliente Aggiornato", "Il cliente e' stato aggiornato correttamente");
                            customerElement.setAttribute("data-customer-name", customerName);
                            //showView("customers-view");
                            const editButton = document.getElementById(`customer-edit-Button-${i}`);
                            editButton.classList.remove("hidden");
                            const deleteButton = document.getElementById(`customer-delete-Button-${i}`);
                            deleteButton.classList.remove("hidden");
                            const saveButton = document.getElementById(`customer-save-Button-${i}`);
                            saveButton.classList.add("hidden");
                            const cancelButton = document.getElementById(`customer-cancel-Button-${i}`);
                            cancelButton.classList.add("hidden");
                            customerElement.setAttribute("readonly", "readonly");
                            break;
                        case "Ko":
                            showPopup("Si è verificato un errore", res.Message);
                            break;
                        default:
                            showPopup("Network Error1", "Si è verificato un errore nel Network");
                            break;
                    } break;
                default:
                    console.log("Si è verificato un errore in fase di aggiornamento del cliente");
                    showPopup("Network Error2", "Si è verificato un errore in fase di aggiornamento del cliente");
                    break;
            }
        }
        hideLoading();
    }

    xhr.open("POST", API.customers.createOrUpdate, true);
    xhr.send(fd);

    return false;
}

function deleteCustomer(i, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    alert(`Delete customer ${i} - function not implemented yet.`);
    return false;
}



function addCustomerFunction(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    //TODO: aggiungere il codice per l'aggiunta del cliente

    let fd = new FormData();
    const frontendForm = document.forms["addCustomer"];

    let customerName = document.querySelector("#addCustomerName").value;
    if (!notEmptyString(customerName)) {
        showPopup("Errore di compilazione", "Il nome del cliente vuoto");
        return false;
    }

    showLoading();

    //fd.append("AddCustomerName", frontendForm.addCustomer.value); // --- not working
    fd.append("CustomerName", customerName);

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                {
                    //Convertire il Json
                    const res = JSON.parse(this.responseText);
                    console.log(res);

                    switch (res.Code) {
                        case "Ok":
                            document.querySelector("#addCustomerName").value = ""; // ← Clear input
                            fetchAllCustomers(newFillCustomersList);
                            showPopup("Cliente Aggiunto", "Un nuovo cliente e' stato aggiunto");
                            //showView("customers-view");
                            break;
                        case "Ko":
                            showPopup("Si è verificato un errore", res.Message);
                            break;
                        default:
                            showPopup("Si è verificato un errore nel Network");
                            break;
                    }
                }
                break;

                default:
                    console.log("Si è verificato un errore in fase di inserimento del nuovo cliente");
                    break;

            }
        }
        hideLoading();
    }

    xhr.open("POST", API.customers.createOrUpdate, true);
    xhr.send(fd);

    return false;
}



const setActiveMenuItem = (menuItemId) => {
    // Step 1: Remove 'active' from ALL menu links
    // Hint: Use querySelectorAll to get all nav-links
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((el) => {
        el.classList.remove('active');
    });

    // Step 2: Add 'active' to the specific menu item
    if (notEmptyString(menuItemId)) {
        const parent = document.getElementById(`${menuItemId}`);
        if (parent)
        {
            const navLink = parent.querySelector('.nav-link');
            if (navLink) {
                navLink.classList.add('active');
            }           
        }
    }
}



// Toggle between view and edit mode for invoices
const toggleEditMode = () => {
    const isEditMode = document.getElementById('enableEditMode').checked;
    const formElements = document.querySelectorAll('#invoice-creation input:not([type="hidden"]):not(#enableEditMode), #invoice-creation select, #invoice-creation textarea');

    formElements.forEach(el => {
        el.disabled = !isEditMode;
    });

    document.getElementById('invoice-submit-btn').style.display = isEditMode ? 'block' : 'none';
};

// Show invoice in detail/view mode
const showInvoiceDetail = (invoiceId) => {
    showLoading();

    // Fetch invoice data
    const fd = new FormData();
    fd.append("InvoiceID",invoiceId);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            hideLoading();
            if (this.status === 200) {
                const res = JSON.parse(this.responseText);
                if (res.Code === "Ok") {
                    fillInvoiceForm(res.Message, false); // false = view mode
                    showView('invoice-creation');
                }
            }
        }
    };
    xhr.open("POST", `/Services/InvoiceHandlers/GetInvoiceByID_DTO.ashx`, true);
    xhr.send(fd);
};

// Fill form with invoice data
const fillInvoiceForm = (invoiceDTO, isCreateMode) => {
    // Set title and toggle visibility
    document.getElementById('invoice-form-title').innerText = isCreateMode ? 'Aggiungi Nuova Fattura' : 'Dettaglio Fattura';
    document.getElementById('edit-mode-toggle').style.display = isCreateMode ? 'none' : 'block';
    document.getElementById('enableEditMode').checked = false;

    if (!isCreateMode) {
        const invoice = invoiceDTO.Invoice; // ← Extract the nested Invoice object

        // Fill fields
        document.getElementById('InvoiceID').value = invoice.InvoiceID || '';
        document.getElementById('InvoiceOrderNumber').value = invoice.InvoiceOrderNumber || '';
        document.getElementById('InvoiceNumber').value = invoice.InvoiceNumber || '';
        document.getElementById('InvoiceTaxable').value = invoice.InvoiceTaxable || '';
        document.getElementById('InvoiceTax').value = invoice.InvoiceTax || '';
        document.getElementById('InvoiceDue').value = invoice.InvoiceDue || '';
        document.getElementById('TaxTotal').value = (invoice.InvoiceTaxable * (invoice.InvoiceTax / 100)) || '';
        document.getElementById('InvoiceTotal').value = (invoice.InvoiceTaxable + (invoice.InvoiceTaxable * (invoice.InvoiceTax / 100))) || '';
        document.getElementById('CreationDate').value = invoice.InvoiceCreationDate?.split('T')[0] || '';
        document.getElementById('DueDate').value = invoice.InvoiceDueDate?.split('T')[0] || '';
        document.getElementById('Description').value = invoice.InvoiceDescription || '';

        // Color-code status by StatusCode
        const statusColors = {
            '0': '#d4edda', // green - paid
            '1': '#fff3cd', // yellow - not paid, not overdue
            '2': '#f8d7da'  // red - overdueF
        };
        const statusSelect = document.getElementById('StatusID');
        statusSelect.style.backgroundColor = statusColors[invoiceDTO.StatusCode] || '#ffffff';

        // Load and select customer/status
        getAllCustomers("CustomerID");
        getAllStatuses("StatusID");
        setTimeout(() => {
            document.getElementById('CustomerID').value = invoice.CustomerID || '';
            document.getElementById('StatusID').value = invoice.StatusID || '';
        }, 500);

        // Disable all fields initially
        toggleEditMode();
    }

    // Update button text
    document.getElementById('invoice-submit-btn').innerHTML = isCreateMode ?
        '<i class="bi bi-check-circle"></i> Crea Fattura' :
        '<i class="bi bi-save"></i> Aggiorna Fattura';
};

// Update fillInvoicesList to store data
// Update fillInvoicesList to set default filters
function fillInvoicesList(res) {
    if (!res || !res.Message || res.Message.length === 0) {
        document.getElementById('invoices-list-container').innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
                <p class="text-muted mt-3">Nessuna fattura trovata.</p>
            </div>`;
        return;
    }

    allInvoices = res.Message;

    // Populate filters
    populateYearFilter();
    populateCustomerFilter();

    // Set default to current month/year
    setDefaultDateFilters();

    // Render with filters applied
    filterInvoices();
}

function populateYearFilter() {
    const yearFilter = document.getElementById('year-filter');
    if (!yearFilter) return;

    const years = [...new Set(allInvoices.map(inv =>
        new Date(inv.Invoice.InvoiceDueDate).getFullYear()
    ))].sort((a, b) => b - a);

    let options = '<option value="">Tutti gli anni</option>';
    years.forEach(year => {
        options += `<option value="${year}">${year}</option>`;
    });

    yearFilter.innerHTML = options;
}

function setDefaultDateFilters() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const monthFilter = document.getElementById('month-filter');
    const yearFilter = document.getElementById('year-filter');

    if (monthFilter) monthFilter.value = currentMonth;
    if (yearFilter) yearFilter.value = currentYear;
}


function populateCustomerFilter() {
    const customerFilter = document.getElementById('customer-filter');
    if (!customerFilter) return;

    const uniqueCustomers = [...new Set(allInvoices.map(inv => inv.Invoice.Customer.CustomerName))];

    let options = '<option value="">Tutti i clienti</option>';
    uniqueCustomers.forEach(customer => {
        options += `<option value="${customer}">${customer}</option>`;
    });

    customerFilter.innerHTML = options;
}

//function renderInvoicesTable(invoices) {
//    const divInvoicesList = document.getElementById('invoices-list-container');

//    let invoicesList = `
//        <div class="table-responsive">
//            <table class="table table-hover table-sm">
//                <thead class="table-light sticky-top">
//                    <tr>
//                        <th scope="col">#</th>
//                        <th scope="col" class="sortable" onclick="sortTable('invoiceNumber')">
//                            N° Fattura <i class="bi bi-arrow-down-up"></i>
//                        </th>
//                        <th scope="col" class="sortable" onclick="sortTable('orderNumber')">
//                            N° Ordine <i class="bi bi-arrow-down-up"></i>
//                        </th>
//                        <th scope="col" class="sortable" onclick="sortTable('customer')">
//                            Cliente <i class="bi bi-arrow-down-up"></i>
//                        </th>
//                        <th scope="col" class="sortable" onclick="sortTable('creationDate')">
//                            Data Immissione <i class="bi bi-arrow-down-up"></i>
//                        </th>
//                        <th scope="col" class="sortable" onclick="sortTable('dueDate')">
//                            Data Scadenza <i class="bi bi-arrow-down-up"></i>
//                        </th>
//                        <th scope="col" class="sortable" onclick="sortTable('status')">
//                            Stato <i class="bi bi-arrow-down-up"></i>
//                        </th>
//                        <th scope="col" class="text-center">Azioni</th>
//                    </tr>
//                </thead>
//                <tbody>`;

//    // Render rows
//    const startIndex = (currentPage - 1) * itemsPerPage;
//    const endIndex = startIndex + itemsPerPage;
//    const paginatedInvoices = invoices.slice(startIndex, endIndex);

//    paginatedInvoices.forEach((el, index) => {
//        invoicesList += createInvoiceRow(el, startIndex + index + 1);
//    });

//    invoicesList += `
//                </tbody>
//            </table>
//        </div>
//        ${renderPagination(invoices.length)}`;

//    divInvoicesList.innerHTML = invoicesList;
//}

function renderInvoicesTable(invoices) {
    const divInvoicesList = document.getElementById('invoices-list-container');

    if (!invoices || invoices.length === 0) {
        divInvoicesList.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
                <p class="text-muted mt-3">Nessuna fattura trovata con i filtri selezionati.</p>
            </div>`;
        return;
    }

    // Calculate pagination
    const totalItems = invoices.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedInvoices = invoices.slice(startIndex, endIndex);

    let tableHtml = `
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-dark sticky-top">
                    <tr>
                        <th scope="col" style="font-size: 0.9rem; font-weight: 600;">#</th>
                        <th scope="col" class="sortable" onclick="sortTable('invoiceNumber')" style="font-size: 0.9rem; font-weight: 600;">
                            N° FATTURA <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="sortable" onclick="sortTable('orderNumber')" style="font-size: 0.9rem; font-weight: 600;">
                            N° ORDINE <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="sortable" onclick="sortTable('customer')" style="font-size: 0.9rem; font-weight: 600;">
                            CLIENTE <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="sortable" onclick="sortTable('creationDate')" style="font-size: 0.9rem; font-weight: 600;">
                            DATA IMMISSIONE <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="sortable" onclick="sortTable('dueDate')" style="font-size: 0.9rem; font-weight: 600;">
                            DATA SCADENZA <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="sortable" onclick="sortTable('status')" style="font-size: 0.9rem; font-weight: 600;">
                            STATO <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="text-center" style="font-size: 0.9rem; font-weight: 600;">AZIONI</th>
                    </tr>
                </thead>
                <tbody>`;

    // Render paginated rows
    paginatedInvoices.forEach((el, index) => {
        tableHtml += createInvoiceRow(el, startIndex + index + 1);
    });

    tableHtml += `
                </tbody>
            </table>
        </div>`;

    // Add pagination controls
    if (totalPages > 1) {
        tableHtml += renderPaginationControls(totalItems, totalPages);
    }

    divInvoicesList.innerHTML = tableHtml;
    updateSortIcons();
}

function createInvoiceRow(message, rowNumber) {
    const inv = message.Invoice;
    const statusCode = message.StatusCode;

    return `
    <tr class="invoice-row" 
        data-invoice-id="${inv.InvoiceID}"
        data-invoice-number="${inv.InvoiceNumber}"
        data-customer="${inv.Customer.CustomerName}"
        data-status-code="${statusCode}"
        style="cursor: pointer;">
        <th scope="row" class="align-middle">${rowNumber}</th>
        <td class="align-middle fw-bold">${inv.InvoiceNumber}</td>
        <td class="align-middle text-muted">${inv.InvoiceOrderNumber}</td>
        <td class="align-middle">${inv.Customer.CustomerName}</td>
        <td class="align-middle">${formatDate(inv.InvoiceCreationDate)}</td>
        <td class="align-middle">${formatDate(inv.InvoiceDueDate)}</td>
        <td class="align-middle">${getStatusBadge(statusCode)}</td>
        <td class="align-middle text-center">
            <button class="btn btn-sm btn-outline-primary me-1" 
                    onclick="event.stopPropagation(); showInvoiceDetail(${inv.InvoiceID})" 
                    title="Visualizza">
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" 
                    onclick="event.stopPropagation(); confirmDeleteInvoice(${inv.InvoiceID})" 
                    title="Elimina">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    </tr>`;
}

function renderPaginationControls(totalItems, totalPages) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    let paginationHtml = `
        <div class="row mt-3 align-items-center">
            <!-- Left: Items info -->
            <div class="col-md-4">
                <small class="text-muted fw-bold">
                    Mostrando ${startItem}-${endItem} di ${totalItems} fatture
                </small>
            </div>
            
            <!-- Center: Page navigation -->
            <div class="col-md-4 text-center">
                <nav aria-label="Navigazione pagine">
                    <ul class="pagination pagination-sm justify-content-center mb-0">
                        <!-- Previous button -->
                        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;" aria-label="Precedente">
                                <i class="bi bi-chevron-left"></i>
                            </a>
                        </li>`;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page + ellipsis if needed
    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
            </li>`;
        if (startPage > 2) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Visible page range
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>`;
    }

    // Ellipsis + last page if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
            </li>`;
    }

    paginationHtml += `
                        <!-- Next button -->
                        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;" aria-label="Successiva">
                                <i class="bi bi-chevron-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
            
            <!-- Right: Items per page selector -->
            <div class="col-md-4 text-end">
                <select class="form-select form-select-sm d-inline-block" style="width: auto;" onchange="changeItemsPerPage(this.value)">
                    <option value="15" ${itemsPerPage === 15 ? 'selected' : ''}>15 per pagina</option>
                    <option value="30" ${itemsPerPage === 30 ? 'selected' : ''}>30 per pagina</option>
                    <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50 per pagina</option>
                    <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>Tutte</option>
                </select>
            </div>
        </div>`;

    return paginationHtml;
}

function changePage(page) {
    const filteredData = getCurrentFilteredData();
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderInvoicesTable(filteredData);

    // Smooth scroll to table top
    document.querySelector('.table-responsive')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function changeItemsPerPage(value) {
    itemsPerPage = parseInt(value);
    currentPage = 1; // Reset to first page
    filterInvoices(); // Re-render with new page size
}

// FILTER FUNCTION
function filterInvoices() {
    const filtered = getCurrentFilteredData();

    // Update counter
    updateResultsCounter(filtered.length, allInvoices.length);

    // Reset to page 1 when filters change
    currentPage = 1;

    // Render with pagination
    renderInvoicesTable(filtered);
}
//function filterInvoices() {
//    const searchTerm = document.getElementById('invoice-search')?.value.toLowerCase() || '';
//    const monthFilter = document.getElementById('month-filter')?.value || '';
//    const yearFilter = document.getElementById('year-filter')?.value || '';
//    const statusFilter = document.getElementById('status-filter')?.value || '';
//    const customerFilter = document.getElementById('customer-filter')?.value || '';

//    const filtered = allInvoices.filter(item => {
//        const inv = item.Invoice;
//        const dueDate = new Date(inv.InvoiceDueDate);

//        // Search match
//        const matchesSearch =
//            inv.InvoiceNumber.toLowerCase().includes(searchTerm) ||
//            inv.InvoiceOrderNumber.toLowerCase().includes(searchTerm) ||
//            inv.Customer.CustomerName.toLowerCase().includes(searchTerm);

//        // Date filters
//        const matchesMonth = !monthFilter || (dueDate.getMonth() + 1) === parseInt(monthFilter);
//        const matchesYear = !yearFilter || dueDate.getFullYear() === parseInt(yearFilter);

//        // Other filters
//        const matchesStatus = !statusFilter || item.StatusCode === statusFilter;
//        const matchesCustomer = !customerFilter || inv.Customer.CustomerName === customerFilter;

//        return matchesSearch && matchesMonth && matchesYear && matchesStatus && matchesCustomer;
//    });

//    // Update counter
//    updateResultsCounter(filtered.length, allInvoices.length);

//    // Reset to page 1
//    currentPage = 1;

//    renderInvoicesTable(filtered);
//}

function updateResultsCounter(filtered, total) {
    const counter = document.getElementById('results-counter');
    if (counter) {
        counter.textContent = `Visualizzate ${filtered} di ${total} fatture`;
    }
}

function clearFilters() {
    document.getElementById('invoice-search').value = '';
    document.getElementById('month-filter').value = '';
    document.getElementById('year-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('customer-filter').value = '';

    currentPage = 1;
    filterInvoices();
}

// DATE FORMATTING
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// DELETE CONFIRMATION
function confirmDeleteInvoice(invoiceId) {
    if (confirm('Sei sicuro di voler eliminare questa fattura?')) {
        deleteInvoice(invoiceId);
    }
}


function sortTable(column) {
    // Toggle direction if same column
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }

    // Get current filtered data
    let dataToSort = getCurrentFilteredData();

    // Sort logic
    dataToSort.sort((a, b) => {
        let valA, valB;

        switch (column) {
            case 'invoiceNumber':
                valA = a.Invoice.InvoiceNumber;
                valB = b.Invoice.InvoiceNumber;
                break;
            case 'orderNumber':
                valA = a.Invoice.InvoiceOrderNumber;
                valB = b.Invoice.InvoiceOrderNumber;
                break;
            case 'customer':
                valA = a.Invoice.Customer.CustomerName;
                valB = b.Invoice.Customer.CustomerName;
                break;
            case 'creationDate':
                valA = new Date(a.Invoice.InvoiceCreationDate);
                valB = new Date(b.Invoice.InvoiceCreationDate);
                break;
            case 'dueDate':
                valA = new Date(a.Invoice.InvoiceDueDate);
                valB = new Date(b.Invoice.InvoiceDueDate);
                break;
            case 'status':
                valA = parseInt(a.StatusCode);
                valB = parseInt(b.StatusCode);
                break;
        }

        if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    renderInvoicesTable(dataToSort);
    updateSortIcons();
}

function updateSortIcons() {
    // Remove all active sort indicators
    document.querySelectorAll('.sortable i').forEach(icon => {
        icon.className = 'bi bi-arrow-down-up';
    });

    // Add active indicator to current column
    const iconMap = {
        'invoiceNumber': 0,
        'orderNumber': 1,
        'customer': 2,
        'creationDate': 3,
        'dueDate': 4,
        'status': 5
    };

    const columnIndex = iconMap[currentSortColumn];
    if (columnIndex !== undefined) {
        const icon = document.querySelectorAll('.sortable i')[columnIndex];
        if (icon) {
            icon.className = currentSortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
        }
    }
}


function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return '';

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return `
        <div class="d-flex justify-content-between align-items-center mt-3">
            <div>
                <small class="text-muted">
                    Mostrando ${startItem}-${endItem} di ${totalItems} fatture
                </small>
            </div>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                            <i class="bi bi-chevron-left"></i>
                        </a>
                    </li>
                    ${renderPageNumbers(totalPages)}
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </li>
                </ul>
            </nav>
            <div>
                <select class="form-select form-select-sm" style="width: auto;" onchange="changeItemsPerPage(this.value)">
                    <option value="15" ${itemsPerPage === 15 ? 'selected' : ''}>15 per pagina</option>
                    <option value="30" ${itemsPerPage === 30 ? 'selected' : ''}>30 per pagina</option>
                    <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50 per pagina</option>
                    <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100 per pagina</option>
                </select>
            </div>
        </div>`;
}

function renderPageNumbers(totalPages) {
    let pages = '';
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>`;
    }

    return pages;
}

function changePage(page) {
    currentPage = page;
    filterInvoices();
    // Scroll to top of table
    document.querySelector('.table-responsive').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changeItemsPerPage(value) {
    itemsPerPage = parseInt(value);
    currentPage = 1;
    filterInvoices();
}

function getCurrentFilteredData() {
    // Returns currently filtered dataset
    const searchTerm = document.getElementById('invoice-search')?.value.toLowerCase() || '';
    const monthFilter = document.getElementById('month-filter')?.value || '';
    const yearFilter = document.getElementById('year-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const customerFilter = document.getElementById('customer-filter')?.value || '';

    return allInvoices.filter(item => {
        const inv = item.Invoice;
        const dueDate = new Date(inv.InvoiceDueDate);

        const matchesSearch =
            inv.InvoiceNumber.toLowerCase().includes(searchTerm) ||
            inv.InvoiceOrderNumber.toLowerCase().includes(searchTerm) ||
            inv.Customer.CustomerName.toLowerCase().includes(searchTerm);

        const matchesMonth = !monthFilter || (dueDate.getMonth() + 1) === parseInt(monthFilter);
        const matchesYear = !yearFilter || dueDate.getFullYear() === parseInt(yearFilter);
        const matchesStatus = !statusFilter || item.StatusCode === statusFilter;
        const matchesCustomer = !customerFilter || inv.Customer.CustomerName === customerFilter;

        return matchesSearch && matchesMonth && matchesYear && matchesStatus && matchesCustomer;
    });
}



// Pagination globals - ADD AT TOP OF FILE
let currentPage = 1;
let itemsPerPage = 15;
let allInvoices = [];
let currentSortColumn = null;
let currentSortDirection = 'asc';


// Pagination globals
//let currentPage = 1;
//let itemsPerPage = 15;
// Global variable to store all invoices
/*let allInvoices = [];*/
// Global sorting state
//let currentSortColumn = null;
//let currentSortDirection = 'asc';